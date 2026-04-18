package com.smartcampus.backend.services;

import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.RoleRequestStatus;
import com.smartcampus.backend.model.TechCategory;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Get current logged in user
    public User getCurrentUser() {
        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Find user by email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Get all users - admin only
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Update user role - admin only
    public User updateUserRole(String userId, Role role, TechCategory techCategory) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        if (techCategory != null) {
            user.setTechCategory(techCategory);
        }
        user.setRequestedRole(null);
        user.setRequestedTechCategory(TechCategory.NONE);
        user.setRoleRequestStatus(RoleRequestStatus.APPROVED);
        user.setOnboardingCompleted(true);
        return userRepository.save(user);
    }

    // User submits a role request during onboarding
    public User submitRoleRequest(Role requestedRole, TechCategory requestedTechCategory) {
        User user = getCurrentUser();

        if (requestedRole == null || requestedRole == Role.ADMIN || requestedRole == Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only LECTURER or TECHNICIAN can be requested");
        }

        user.setRequestedRole(requestedRole);
        if (requestedRole == Role.TECHNICIAN && requestedTechCategory != null) {
            user.setRequestedTechCategory(requestedTechCategory);
        }
        user.setRoleRequestStatus(RoleRequestStatus.PENDING);
        user.setOnboardingCompleted(true);
        return userRepository.save(user);
    }

    // User completes onboarding without requesting elevated role
    public User completeOnboarding() {
        User user = getCurrentUser();
        user.setOnboardingCompleted(true);

        if (user.getRoleRequestStatus() == null || user.getRoleRequestStatus() == RoleRequestStatus.NONE) {
            user.setRequestedRole(null);
            user.setRoleRequestStatus(RoleRequestStatus.NONE);
        }

        return userRepository.save(user);
    }

    // Find user by ID
    public User findById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}