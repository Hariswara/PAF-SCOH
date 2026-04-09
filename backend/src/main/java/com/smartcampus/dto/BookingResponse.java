package com.smartcampus.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BookingResponse {

    private Long id;
    private UUID resourceId;

    @JsonProperty("bookingDate")
    private LocalDate date;

    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private int expectedAttendees;
    private String status;

    public BookingResponse(
            Long id,
            UUID resourceId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String purpose,
            int expectedAttendees,
            String status
    ) {
        this.id = id;
        this.resourceId = resourceId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public UUID getResourceId() {
        return resourceId;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public int getExpectedAttendees() {
        return expectedAttendees;
    }

    public String getStatus() {
        return status;
    }
}