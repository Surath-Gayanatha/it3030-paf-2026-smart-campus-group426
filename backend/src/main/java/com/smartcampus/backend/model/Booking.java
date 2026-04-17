package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    // We will use a plain string for now per our discussion.
    // Represents the facility or asset being booked.
    private String resourceId;

    // ID of the user requesting the booking
    private String userId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String purpose;

    private Integer expectedAttendees;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // If an admin rejects the booking, they can provide a reason here
    private String adminReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
