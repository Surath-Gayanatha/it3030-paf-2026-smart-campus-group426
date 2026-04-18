package com.smartcampus.backend.services;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id).orElse(null);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        Resource resource = getResourceById(id);
        if (resource != null) {
            resource.setName(resourceDetails.getName());
            resource.setType(resourceDetails.getType());
            resource.setCapacity(resourceDetails.getCapacity());
            resource.setLocation(resourceDetails.getLocation());
            resource.setDescription(resourceDetails.getDescription());
            resource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
            resource.setStatus(resourceDetails.getStatus());
            resource.setImageUrl(resourceDetails.getImageUrl());
            return resourceRepository.save(resource);
        }
        return null;
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }

    public List<Resource> searchResources(String type, Integer capacity, String location) {
        List<Resource> resources = resourceRepository.findAll();
        
        return resources.stream()
            .filter(r -> type == null || type.isBlank() || r.getType().equalsIgnoreCase(type))
            .filter(r -> capacity == null || r.getCapacity() >= capacity)
            .filter(r -> location == null || location.isBlank() || r.getLocation().toLowerCase().contains(location.toLowerCase()))
            .collect(Collectors.toList());
    }

    public Map<String, Object> getUsageAnalytics() {
        List<Resource> resources = resourceRepository.findAll();
        
        List<Map<String, Object>> topResources = resources.stream()
            .limit(5)
            .map(r -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", r.getName());
                map.put("usageCount", (int)(Math.random() * 100));
                return map;
            })
            .collect(Collectors.toList());

        List<Map<String, Object>> peakHours = new ArrayList<>();
        peakHours.add(createPeakHour("08:00", 12));
        peakHours.add(createPeakHour("10:00", 25));
        peakHours.add(createPeakHour("12:00", 18));
        peakHours.add(createPeakHour("14:00", 30));
        peakHours.add(createPeakHour("16:00", 15));

        Map<String, Object> result = new HashMap<>();
        result.put("topResources", topResources);
        result.put("peakHours", peakHours);
        result.put("totalResources", (double) resources.size());
        return result;
    }

    private Map<String, Object> createPeakHour(String hour, int bookings) {
        Map<String, Object> map = new HashMap<>();
        map.put("hour", hour);
        map.put("bookings", bookings);
        return map;
    }
}





