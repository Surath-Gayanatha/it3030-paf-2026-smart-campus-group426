package com.smartcampus.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public List<String> uploadImages(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                log.info("Uploading image to Cloudinary: {}", file.getOriginalFilename());
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                        "folder", "smart-campus/tickets",
                        "resource_type", "image"
                    )
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Successfully uploaded: {}", secureUrl);
                urls.add(secureUrl);
            } catch (Exception e) {
                log.error("Failed to upload image '{}': {}", file.getOriginalFilename(), e.getMessage());
                throw new RuntimeException("Image upload failed for '" + file.getOriginalFilename() + "'. Please check Cloudinary configuration.", e);
            }
        }

        return urls;
    }
}
