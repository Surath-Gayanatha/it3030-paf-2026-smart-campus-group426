package com.smartcampus.backend.dto.response;

import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.RoleRequestStatus;
import com.smartcampus.backend.model.TechCategory;
import com.smartcampus.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;
    private String email;
    private String name;
    private String profilePicture;
    private Role role;
    private Role requestedRole;
    private RoleRequestStatus roleRequestStatus;
    private TechCategory techCategory;
    private TechCategory requestedTechCategory;
    private boolean onboardingCompleted;

    // Convert User model to UserResponse DTO
    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .requestedRole(user.getRequestedRole())
                .roleRequestStatus(user.getRoleRequestStatus())
                .techCategory(user.getTechCategory())
                .requestedTechCategory(user.getRequestedTechCategory())
                .onboardingCompleted(user.isOnboardingCompleted())
                .build();
    }
}