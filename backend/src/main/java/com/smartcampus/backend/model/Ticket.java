package com.smartcampus.backend.model;  // FIX: was com.smartcampus.model (missing .backend)

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    private String id;

    private String resourceLocation;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private String contactName;
    private String contactEmail;
    private String contactPhone;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String assignedTechnician;
    private String assignedTechnicianId;
    private String resolutionNotes;
    private String rejectionReason;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    private String createdBy;

    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}