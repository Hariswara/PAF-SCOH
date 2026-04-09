package com.smartcampus.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

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

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

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
        return mapToBookingResponse(saved);
    }

    public BookingResponse cancelBooking(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("Authenticated user not found");
        }

        boolean isAdmin = currentUser.role() == UserRole.DOMAIN_ADMIN ||
                          currentUser.role() == UserRole.SUPER_ADMIN;

        boolean isOwner = booking.getCreatedBy() != null &&
                          booking.getCreatedBy().equals(currentUser.email());

        if (booking.getStatus() == BookingStatus.REJECTED ||
            booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("This booking cannot be cancelled");
        }

        if (booking.getStatus() == BookingStatus.PENDING) {
            if (!isOwner) {
                throw new IllegalStateException("Only the booking owner can cancel a pending booking");
            }
        }

        if (booking.getStatus() == BookingStatus.APPROVED) {
            if (!isOwner && !isAdmin) {
                throw new IllegalStateException("Only the booking owner or an admin can cancel this booking");
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return mapToBookingResponse(saved);
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