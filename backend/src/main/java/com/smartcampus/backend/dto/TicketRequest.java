package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.TicketCategory;
import com.smartcampus.backend.model.TicketPriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class TicketRequest {

    @NotBlank(message = "Resource or location is required")
    private String resourceLocation;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be 10–1000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Enter a valid email")
    private String contactEmail;

    private String contactPhone;

    // Optional pre-attached image URLs (Cloudinary)
    private List<String> imageUrls;
}
