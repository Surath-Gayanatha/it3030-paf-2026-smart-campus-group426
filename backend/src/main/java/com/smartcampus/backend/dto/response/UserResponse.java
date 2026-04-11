package com.smartcampus.backend.dto.response;

import com.smartcampus.backend.model.Role;
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

    // Convert User model to UserResponse DTO
    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .build();
    }
}