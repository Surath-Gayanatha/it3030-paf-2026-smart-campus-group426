package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatusRequest {
    private TicketStatus status;
    private String assignedTechnician;
    private String resolutionNotes;
    private String rejectionReason;
}
