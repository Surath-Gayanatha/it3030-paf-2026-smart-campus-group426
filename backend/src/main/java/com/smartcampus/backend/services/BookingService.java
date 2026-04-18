package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingStatusUpdateDTO;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    public Booking createBooking(BookingRequestDTO requestDTO, String userEmail) {
        // Validate dates
        if (requestDTO.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time cannot be in the past");
        }
        
        if (requestDTO.getStartTime().isAfter(requestDTO.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }

        long durationMinutes = ChronoUnit.MINUTES.between(requestDTO.getStartTime(), requestDTO.getEndTime());
        if (durationMinutes < 15) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking must be at least 15 minutes long");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        checkForConflicts(requestDTO.getResourceId(), requestDTO.getStartTime(), requestDTO.getEndTime(), null);

        Booking booking = Booking.builder()
                .resourceId(requestDTO.getResourceId())
                .userId(user.getId())
                .startTime(requestDTO.getStartTime())
                .endTime(requestDTO.getEndTime())
                .purpose(requestDTO.getPurpose())
                .expectedAttendees(requestDTO.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == Role.ADMIN) {
            return bookingRepository.findAll();
        } else {
            return bookingRepository.findByUserId(user.getId());
        }
    }

    public Booking getBookingById(String id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Only ADMINs or the booking owner can view
        if (user.getRole() != Role.ADMIN && !booking.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this booking");
        }

        return booking;
    }

    public Booking updateBooking(String id, BookingRequestDTO requestDTO, String userEmail) {
        if (requestDTO.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time cannot be in the past");
        }

        if (requestDTO.getStartTime().isAfter(requestDTO.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }

        long durationMinutes = ChronoUnit.MINUTES.between(requestDTO.getStartTime(), requestDTO.getEndTime());
        if (durationMinutes < 15) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking must be at least 15 minutes long");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Only the owner can update their booking, and only if it's PENDING
        if (!booking.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be updated");
        }

        checkForConflicts(requestDTO.getResourceId(), requestDTO.getStartTime(), requestDTO.getEndTime(), id);

        booking.setResourceId(requestDTO.getResourceId());
        booking.setStartTime(requestDTO.getStartTime());
        booking.setEndTime(requestDTO.getEndTime());
        booking.setPurpose(requestDTO.getPurpose());
        booking.setExpectedAttendees(requestDTO.getExpectedAttendees());

        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String id, BookingStatusUpdateDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (user.getRole() == Role.ADMIN) {
            // Admins can approve or reject
            if (dto.getStatus() == BookingStatus.APPROVED || dto.getStatus() == BookingStatus.REJECTED) {
                if (dto.getStatus() == BookingStatus.APPROVED) {
                    // Final conflict check before approving
                    checkForConflicts(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), id);
                }
                booking.setStatus(dto.getStatus());
                if (dto.getStatus() == BookingStatus.REJECTED) {
                    booking.setAdminReason(dto.getAdminReason());
                }
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admins should only APPROVE or REJECT");
            }
        } else {
            // Users can only cancel their own bookings
            if (!booking.getUserId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
            if (dto.getStatus() == BookingStatus.CANCELLED) {
                if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
                     throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel this booking");
                }
                booking.setStatus(BookingStatus.CANCELLED);
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Users can only CANCEL bookings");
            }
        }

        return bookingRepository.save(booking);
    }

    public void deleteBooking(String id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        
        // Admin can delete any, user can only delete their own PENDING or REJECTED/CANCELLED bookings
        if (user.getRole() != Role.ADMIN) {
            if (!booking.getUserId().equals(user.getId())) {
                 throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
            if (booking.getStatus() == BookingStatus.APPROVED) {
                 throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete an approved booking, cancel it instead.");
            }
        }

        bookingRepository.delete(booking);
    }


    private void checkForConflicts(String resourceId, LocalDateTime startTime, LocalDateTime endTime, String excludeBookingId) {
        // We only check conflicts against APPROVED or PENDING bookings.
        List<Booking> overlapping = bookingRepository.findConflictingBookings(
                resourceId, 
                List.of(BookingStatus.APPROVED, BookingStatus.PENDING), 
                startTime, 
                endTime
        );

        for (Booking b : overlapping) {
            if (excludeBookingId == null || !b.getId().equals(excludeBookingId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "The requested resource is already booked for the selected time range.");
            }
        }
    }
}
