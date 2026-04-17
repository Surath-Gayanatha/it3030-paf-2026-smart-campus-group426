package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.TicketRequest;
import com.smartcampus.backend.dto.TicketResponse;
import com.smartcampus.backend.dto.TicketStatusRequest;
import com.smartcampus.backend.model.TicketPriority;
import com.smartcampus.backend.model.TicketStatus;
import com.smartcampus.backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;

    // POST /api/tickets — any logged-in user creates a ticket
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketRequest request) {
        TicketResponse response = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/tickets/{id} — owner or admin views one ticket
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // POST /api/tickets/{id}/images - Upload Cloudinary Images
    @PostMapping("/{id}/images")
    public ResponseEntity<?> uploadImages(
            @PathVariable String id,
            @RequestParam("images") List<MultipartFile> images) {
        try {
            return ResponseEntity.ok(ticketService.uploadImages(id, images));
        } catch (RuntimeException e) {
            log.error("Image upload failed for ticket {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", e.getMessage()));
        }
    }

    // GET /api/tickets — admin only, optional ?status=OPEN&priority=HIGH
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority));
    }

    // GET /api/tickets/my — logged-in user sees only their tickets
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @RequestParam(required = false) TicketStatus status) {
        return ResponseEntity.ok(ticketService.getMyTickets(status));
    }

    // PATCH /api/tickets/{id}/status — admin/technician updates status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable String id,
            @RequestBody TicketStatusRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }
}
