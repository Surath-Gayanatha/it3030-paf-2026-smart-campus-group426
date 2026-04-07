package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.TicketRequest;
import com.smartcampus.backend.dto.TicketResponse;
import com.smartcampus.backend.dto.TicketStatusRequest;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.TicketPriority;
import com.smartcampus.backend.model.TicketStatus;
import com.smartcampus.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CloudinaryService cloudinaryService;

    // Helper: get current username safely (defaults to 'anonymous' when security is open)
    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return "anonymous";
        }
        return auth.getName();
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    public TicketResponse createTicket(TicketRequest request) {
        String currentUser = getCurrentUser();

        Ticket ticket = Ticket.builder()
                .resourceLocation(request.getResourceLocation())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>())
                .createdBy(currentUser)
                .status(TicketStatus.OPEN)
                .build();

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    public TicketResponse getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
        return mapToResponse(ticket);
    }

    // Admin: all tickets with optional filters
    public List<TicketResponse> getAllTickets(TicketStatus status, TicketPriority priority) {
        List<Ticket> tickets;

        if (status != null && priority != null) {
            tickets = ticketRepository.findByStatusAndPriority(status, priority);
        } else if (status != null) {
            tickets = ticketRepository.findByStatus(status);
        } else if (priority != null) {
            tickets = ticketRepository.findByPriority(priority);
        } else {
            tickets = ticketRepository.findAll();
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // User: only their own tickets
    public List<TicketResponse> getMyTickets(TicketStatus status) {
        String currentUser = getCurrentUser();

        List<Ticket> tickets = (status != null)
                ? ticketRepository.findByCreatedByAndStatus(currentUser, status)
                : ticketRepository.findByCreatedBy(currentUser);

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── UPLOAD IMAGES ─────────────────────────────────────────────────────────

    public TicketResponse uploadImages(String id, List<MultipartFile> files) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        // Max 3 images limit logic
        if (ticket.getImageUrls() == null) {
            ticket.setImageUrls(new ArrayList<>());
        }
        
        int availableSlots = 3 - ticket.getImageUrls().size();
        if (availableSlots <= 0 || files.isEmpty()) {
            return mapToResponse(ticket);
        }

        List<MultipartFile> filesToUpload = files.stream().limit(availableSlots).collect(Collectors.toList());

        // Delegate to CloudinaryService
        List<String> uploadedUrls = cloudinaryService.uploadImages(filesToUpload);
        ticket.getImageUrls().addAll(uploadedUrls);

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ── UPDATE STATUS ────────────────────────────────────────────────────────
    
    public TicketResponse updateTicketStatus(String id, TicketStatusRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());
        }
        
        if (request.getAssignedTechnician() != null) {
            ticket.setAssignedTechnician(request.getAssignedTechnician());
        }
        
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        
        if (request.getRejectionReason() != null) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ── MAPPER ────────────────────────────────────────────────────────────────

    private TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .resourceLocation(ticket.getResourceLocation())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactName(ticket.getContactName())
                .contactEmail(ticket.getContactEmail())
                .contactPhone(ticket.getContactPhone())
                .assignedTechnician(ticket.getAssignedTechnician())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .imageUrls(ticket.getImageUrls())
                .createdBy(ticket.getCreatedBy())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
