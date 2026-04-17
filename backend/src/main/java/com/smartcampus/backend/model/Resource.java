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
import java.util.List;

@Document(collection = "resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    private String id;

    private String name;
    private String type; // lecture hall, lab, meeting room, equipment
    private Integer capacity;
    private String location;
    private String description;
    
    private List<String> availabilityWindows; // e.g. ["08:00-10:00", "14:00-16:00"]
    
    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    private String imageUrl;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
