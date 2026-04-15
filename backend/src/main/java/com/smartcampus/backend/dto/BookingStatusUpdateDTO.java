package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingStatusUpdateDTO {

    @NotNull(message = "Status cannot be null")
    private BookingStatus status;

    private String adminReason; // Only strictly necessary if REJECTED, but we are flexible here
}
