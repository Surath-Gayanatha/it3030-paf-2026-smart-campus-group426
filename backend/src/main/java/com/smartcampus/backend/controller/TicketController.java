package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.TicketRequest;
import com.smartcampus.backend.dto.TicketResponse;
import com.smartcampus.backend.model.TicketPriority;
import com.smartcampus.backend.model.TicketStatus;
import com.smartcampus.backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
    public ResponseEntity<TicketResponse> uploadImages(
            @PathVariable String id,
            @RequestParam("images") List<MultipartFile> images) {
        return ResponseEntity.ok(ticketService.uploadImages(id, images));
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
}
