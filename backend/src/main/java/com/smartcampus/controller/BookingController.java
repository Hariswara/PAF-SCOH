package com.smartcampus.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.BookingResponse;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.dto.ReviewBookingRequest;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponse createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    public List<BookingResponse> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String user) {
        return bookingService.getAllBookings(status, resourceId, date, user);
    }

    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return bookingService.getMyBookings(status, date);
    }

    @PatchMapping("/{id}/review")
    public BookingResponse reviewBooking(
            @PathVariable Long id,
            @Valid @RequestBody ReviewBookingRequest request) {
        return bookingService.reviewBooking(id, request);
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }
}