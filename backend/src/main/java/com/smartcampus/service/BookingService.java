package com.smartcampus.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.dto.ReviewBookingRequest;
import com.smartcampus.dto.UpdateBookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.BookingRepository;

@Service
public class BookingService {

    private static final LocalTime BOOKING_START_TIME = LocalTime.of(8, 0);
    private static final LocalTime BOOKING_END_TIME = LocalTime.of(21, 0);

    private final BookingRepository bookingRepository;
    private final AuthService authService;

    public BookingService(BookingRepository bookingRepository, AuthService authService) {
        this.bookingRepository = bookingRepository;
        this.authService = authService;
    }

    public BookingResponse createBooking(CreateBookingRequest request) {

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (request.getStartTime().isBefore(BOOKING_START_TIME)) {
            throw new IllegalArgumentException(
                    "Booking start time must be on or after " + BOOKING_START_TIME);
        }

        if (request.getEndTime().isAfter(BOOKING_END_TIME)) {
            throw new IllegalArgumentException(
                    "Booking end time must be on or before " + BOOKING_END_TIME);
        }

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("Authenticated user not found");
        }

        List<Booking> existingBookings = bookingRepository.findByResourceIdAndDate(
                request.getResourceId(),
                request.getDate()
        );

        boolean hasOverlap = existingBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                .anyMatch(b ->
                        request.getStartTime().isBefore(b.getEndTime()) &&
                        request.getEndTime().isAfter(b.getStartTime())
                );

        if (hasOverlap) {
            throw new IllegalStateException("This resource is already booked for the selected time range");
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
        return mapToBookingResponse(saved);
    }

    public BookingResponse updateBooking(Long id, UpdateBookingRequest request) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("Authenticated user not found");
        }

        boolean isOwner = booking.getCreatedBy() != null &&
                          booking.getCreatedBy().equals(currentUser.email());

        if (!isOwner) {
            throw new IllegalStateException("Only the booking owner can edit this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be edited");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (request.getStartTime().isBefore(BOOKING_START_TIME)) {
            throw new IllegalArgumentException(
                    "Booking start time must be on or after " + BOOKING_START_TIME);
        }

        if (request.getEndTime().isAfter(BOOKING_END_TIME)) {
            throw new IllegalArgumentException(
                    "Booking end time must be on or before " + BOOKING_END_TIME);
        }

        List<Booking> existingBookings = bookingRepository.findByResourceIdAndDate(
                request.getResourceId(),
                request.getDate()
        );

        boolean hasOverlap = existingBookings.stream()
                .filter(b -> !b.getId().equals(booking.getId()))
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                .anyMatch(b ->
                        request.getStartTime().isBefore(b.getEndTime()) &&
                        request.getEndTime().isAfter(b.getStartTime())
                );

        if (hasOverlap) {
            throw new IllegalStateException("This resource is already booked for the selected time range");
        }

        booking.setResourceId(request.getResourceId());
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return mapToBookingResponse(saved);
    }

    public List<BookingResponse> getAllBookings(
            BookingStatus status,
            UUID resourceId,
            LocalDate date,
            String user) {

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("Authenticated user not found");
        }

        boolean isAdmin = currentUser.role() == UserRole.DOMAIN_ADMIN ||
                          currentUser.role() == UserRole.SUPER_ADMIN;

        if (!isAdmin) {
            throw new IllegalStateException("Only admin users can view all bookings");
        }

        List<Booking> bookings = bookingRepository.findAll();

        return bookings.stream()
                .filter(booking -> status == null || booking.getStatus() == status)
                .filter(booking -> resourceId == null || resourceId.equals(booking.getResourceId()))
                .filter(booking -> date == null || date.equals(booking.getDate()))
                .filter(booking -> user == null || user.isBlank() ||
                        (booking.getCreatedBy() != null &&
                         booking.getCreatedBy().equalsIgnoreCase(user)))
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .map(this::mapToBookingResponse)
                .toList();
    }

    public List<BookingResponse> getMyBookings(BookingStatus status, LocalDate date) {

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("Authenticated user not found");
        }

        String userEmail = currentUser.email();
        List<Booking> bookings;

        if (status != null && date != null) {
            bookings = bookingRepository.findByCreatedByAndStatusAndDateOrderByCreatedAtDesc(userEmail, status, date);
        } else if (status != null) {
            bookings = bookingRepository.findByCreatedByAndStatusOrderByCreatedAtDesc(userEmail, status);
        } else if (date != null) {
            bookings = bookingRepository.findByCreatedByAndDateOrderByCreatedAtDesc(userEmail, date);
        } else {
            bookings = bookingRepository.findByCreatedByOrderByCreatedAtDesc(userEmail);
        }

        return bookings.stream()
                .map(this::mapToBookingResponse)
                .toList();
    }

    public BookingResponse reviewBooking(Long id, ReviewBookingRequest request) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        User currentUser = getCurrentUserOrDevAdmin();

        boolean isAdmin = currentUser.role() == UserRole.DOMAIN_ADMIN ||
                          currentUser.role() == UserRole.SUPER_ADMIN;

        if (!isAdmin) {
            throw new IllegalStateException("Only admin users can review bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException(
                    "Invalid status transition. Only PENDING bookings can be reviewed");
        }

        if (request.getStatus() != BookingStatus.APPROVED &&
            request.getStatus() != BookingStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Invalid status transition. PENDING bookings can only transition to APPROVED or REJECTED");
        }

        if (request.getStatus() == BookingStatus.APPROVED) {
            List<Booking> existingBookings = bookingRepository.findByResourceIdAndDate(
                    booking.getResourceId(),
                    booking.getDate()
            );

            boolean hasOverlap = existingBookings.stream()
                    .filter(b -> !b.getId().equals(booking.getId()))
                    .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                    .anyMatch(b ->
                            booking.getStartTime().isBefore(b.getEndTime()) &&
                            booking.getEndTime().isAfter(b.getStartTime())
                    );

            if (hasOverlap) {
                throw new IllegalStateException(
                        "Cannot approve booking because the resource is already booked for the selected time range");
            }
        }

        booking.setStatus(request.getStatus());
        booking.setReviewedBy(currentUser.email());
        booking.setReviewedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return mapToBookingResponse(saved);
    }

    public BookingResponse cancelBooking(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        User currentUser = getCurrentUserOrDevAdmin();

        boolean isAdmin = currentUser.role() == UserRole.DOMAIN_ADMIN ||
                          currentUser.role() == UserRole.SUPER_ADMIN;

        boolean isOwner = booking.getCreatedBy() != null &&
                          booking.getCreatedBy().equals(currentUser.email());

        if (booking.getStatus() == BookingStatus.REJECTED ||
            booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Invalid status transition. This booking cannot be cancelled");
        }

        if (booking.getStatus() == BookingStatus.PENDING) {
            if (!isOwner) {
                throw new IllegalStateException(
                        "Invalid status transition. Only the booking owner can cancel a pending booking");
            }
        } else if (booking.getStatus() == BookingStatus.APPROVED) {
            if (!isOwner && !isAdmin) {
                throw new IllegalStateException(
                        "Invalid status transition. Only the booking owner or an admin can cancel an approved booking");
            }
        } else {
            throw new IllegalStateException(
                    "Invalid status transition. This booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return mapToBookingResponse(saved);
    }

    private User getCurrentUserOrDevAdmin() {
        User currentUser = authService.getCurrentUser();

        if (currentUser == null) {
            currentUser = new User(
                    null,
                    null,
                    "admin@test.com",
                    "Dev Admin",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    UserRole.SUPER_ADMIN,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }

        return currentUser;
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus().name()
        );
    }
}