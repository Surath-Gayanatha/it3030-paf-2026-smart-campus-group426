package com.smartcampus.backend.dto;

import lombok.Data;

@Data
public class NotificationPreferenceRequest {

    private boolean bookingApproved;
    private boolean bookingRejected;
    private boolean bookingCancelled;
    private boolean ticketStatusChanged;
    private boolean newComment;
}
