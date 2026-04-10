package com.smartcampus.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final AuthService authService;

    public BookingService(
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            AuthService authService
    ) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.authService = authService;
    }

    public BookingResponse createBooking(CreateBookingRequest request) {

        validateRequest(request);

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        validateResource(resource, request);
        validateBookingConflict(request);

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

    private void validateRequest(CreateBookingRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (request.getDate() == null) {
            throw new IllegalArgumentException("Booking date is required");
        }

        if (request.getResourceId() == null) {
            throw new IllegalArgumentException("Resource is required");
        }
    }

    private void validateResource(Resource resource, CreateBookingRequest request) {
        if (resource.statusEnum() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException("Resource is not active and cannot be booked");
        }

        Integer capacity = resource.capacity();
        if (capacity != null && request.getExpectedAttendees() > capacity) {
            throw new IllegalArgumentException(
                    "Expected attendees exceed resource capacity of " + capacity
            );
        }
    }

    private void validateBookingConflict(CreateBookingRequest request) {
        boolean hasConflict =
                bookingRepository.existsByResourceIdAndDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNotIn(
                        request.getResourceId(),
                        request.getDate(),
                        request.getEndTime(),
                        request.getStartTime(),
                        List.of(BookingStatus.CANCELLED, BookingStatus.REJECTED)
                );

        if (hasConflict) {
            throw new IllegalArgumentException(
                    "Conflicting booking already exists for the selected time range"
            );
        }
    }
}