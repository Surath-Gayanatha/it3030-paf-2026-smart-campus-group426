package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Find user by email - used during OAuth2 login
    Optional<User> findByEmail(String email);

    // Check if user exists by email - used before creating new user
    boolean existsByEmail(String email);
}