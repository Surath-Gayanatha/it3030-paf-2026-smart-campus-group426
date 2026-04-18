package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Resource> findByNameRegex(String name);

    List<Resource> findByType(String type);

    List<Resource> findByLocation(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}
