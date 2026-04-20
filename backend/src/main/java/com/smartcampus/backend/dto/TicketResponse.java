package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.TicketCategory;
import com.smartcampus.backend.model.TicketPriority;
import com.smartcampus.backend.model.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {

    private String id;
    private String resourceLocation;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String assignedTechnician;
    private String assignedTechnicianId;
    private String resolutionNotes;
    private String rejectionReason;
    private List<String> imageUrls;
    private String createdBy;
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
