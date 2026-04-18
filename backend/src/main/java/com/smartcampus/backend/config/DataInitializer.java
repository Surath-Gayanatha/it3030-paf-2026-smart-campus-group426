package com.smartcampus.backend.config;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    @Override
    public void run(String... args) throws Exception {
        if (resourceRepository.count() == 0) {
            Resource r1 = Resource.builder()
                .name("Main Lecture Hall")
                .type("Lecture Hall")
                .capacity(200)
                .location("Building A, Level 2")
                .description("A spacious hall equipped with high-end audio systems and dual projectors.")
                .status(ResourceStatus.ACTIVE)
                .imageUrl("https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80")
                .build();

            Resource r2 = Resource.builder()
                .name("Advanced Robotics Lab")
                .type("Lab")
                .capacity(30)
                .location("Engineering Wing, Ground Floor")
                .description("State-of-the-art laboratory for robotics research and development.")
                .status(ResourceStatus.ACTIVE)
                .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80")
                .build();

            Resource r3 = Resource.builder()
                .name("Executive Meeting Room")
                .type("Meeting Room")
                .capacity(12)
                .location("Innovation Center, Level 4")
                .description("Formal meeting space with video conferencing and glass boards.")
                .status(ResourceStatus.ACTIVE)
                .imageUrl("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80")
                .build();

            Resource r4 = Resource.builder()
                .name("4K Cinematic Camera")
                .type("Equipment")
                .capacity(1)
                .location("Media Lab")
                .description("Professional grade camera for high-quality production work.")
                .status(ResourceStatus.OUT_OF_SERVICE)
                .imageUrl("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80")
                .build();

            resourceRepository.saveAll(Arrays.asList(r1, r2, r3, r4));
            System.out.println("Seed data for resources initialized.");
        }
    }
}
