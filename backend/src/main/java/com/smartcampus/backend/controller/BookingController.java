package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.BookingRequestDTO;
import com.smartcampus.backend.dto.BookingStatusUpdateDTO;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.services.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequestDTO requestDTO, Principal principal) {
        Booking booking = bookingService.createBooking(requestDTO, principal.getName());
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(Principal principal) {
        List<Booking> bookings = bookingService.getAllBookings(principal.getName());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id, Principal principal) {
        Booking booking = bookingService.getBookingById(id, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequestDTO requestDTO,
            Principal principal) {
        Booking booking = bookingService.updateBooking(id, requestDTO, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable String id,
            @Valid @RequestBody BookingStatusUpdateDTO statusUpdateDTO,
            Principal principal) {
        Booking booking = bookingService.updateBookingStatus(id, statusUpdateDTO, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id, Principal principal) {
        bookingService.deleteBooking(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
