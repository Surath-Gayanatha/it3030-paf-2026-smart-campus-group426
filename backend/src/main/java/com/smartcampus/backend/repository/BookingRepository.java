package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    @Query("{ 'resourceId': ?0, 'status': { $in: ?1 }, 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String resourceId, List<BookingStatus> statuses, LocalDateTime newStartTime, LocalDateTime newEndTime);
}
