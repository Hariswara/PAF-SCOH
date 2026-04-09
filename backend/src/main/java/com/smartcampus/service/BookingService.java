package com.smartcampus.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.User;
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
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Validate overlapping bookings for same resource/date
        boolean hasConflict =
                bookingRepository.existsByResourceIdAndDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
                        request.getResourceId(),
                        request.getDate(),
                        request.getEndTime(),
                        request.getStartTime(),
                        BookingStatus.CANCELLED
                );

        if (hasConflict) {
            throw new IllegalArgumentException("Conflicting booking already exists for the selected time range");
        }

        // Resource validation will be added when Resource module is ready

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
}