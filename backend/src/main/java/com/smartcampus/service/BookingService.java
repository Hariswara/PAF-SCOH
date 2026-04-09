package com.smartcampus.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.dto.ReviewBookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AuthService authService;

    public BookingService(BookingRepository bookingRepository, AuthService authService) {
        this.bookingRepository = bookingRepository;
        this.authService = authService;
    }

    public BookingResponse createBooking(CreateBookingRequest request) {

        // Validate time
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // MUST have logged-in user (no fallback)
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("Authenticated user not found");
        }

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        // real user association
        booking.setCreatedBy(currentUser.email());

        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        return new BookingResponse(
                saved.getId(),
                saved.getResourceId(),
                saved.getDate(),
                saved.getStartTime(),
                saved.getEndTime(),
                saved.getPurpose(),
                saved.getExpectedAttendees(),
                saved.getStatus().name()
        );
    }

    public BookingResponse reviewBooking(Long id, ReviewBookingRequest request) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("Authenticated user not found");
        }

        if (currentUser.role() != UserRole.DOMAIN_ADMIN &&
            currentUser.role() != UserRole.SUPER_ADMIN) {
            throw new IllegalStateException("Only admin users can review bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be reviewed");
        }

        if (request.getStatus() != BookingStatus.APPROVED &&
            request.getStatus() != BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Review status must be APPROVED or REJECTED");
        }

        booking.setStatus(request.getStatus());
        booking.setReviewedBy(currentUser.email());
        booking.setReviewedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        return new BookingResponse(
                saved.getId(),
                saved.getResourceId(),
                saved.getDate(),
                saved.getStartTime(),
                saved.getEndTime(),
                saved.getPurpose(),
                saved.getExpectedAttendees(),
                saved.getStatus().name()
        );
    }
}