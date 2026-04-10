package com.smartcampus.dto;

import com.smartcampus.model.BookingStatus;

import jakarta.validation.constraints.NotNull;

public class ReviewBookingRequest {

    @NotNull
    private BookingStatus status;

    private String reason;

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}