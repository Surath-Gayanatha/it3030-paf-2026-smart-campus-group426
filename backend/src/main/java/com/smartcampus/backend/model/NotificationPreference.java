package com.smartcampus.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Builder.Default
    private boolean bookingApproved = true;

    @Builder.Default
    private boolean bookingRejected = true;

    @Builder.Default
    private boolean bookingCancelled = true;

    @Builder.Default
    private boolean ticketStatusChanged = true;

    @Builder.Default
    private boolean newComment = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
