package com.smartcampus.event;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public sealed interface BookingEvent {

    Long bookingId();
    String resourceName();
    LocalDate date();
    LocalTime startTime();
    LocalTime endTime();

    record Created(Long bookingId, UUID createdByUserId, String createdByName,
                   UUID resourceId, String resourceName,
                   LocalDate date, LocalTime startTime, LocalTime endTime,
                   String purpose, UUID resourceDomainId) implements BookingEvent {}

    record Approved(Long bookingId, UUID bookerUserId, String bookerName,
                    UUID resourceId, String resourceName,
                    LocalDate date, LocalTime startTime, LocalTime endTime,
                    String reviewerName) implements BookingEvent {}

    record Rejected(Long bookingId, UUID bookerUserId, String bookerName,
                    UUID resourceId, String resourceName,
                    LocalDate date, LocalTime startTime, LocalTime endTime,
                    String reviewerName) implements BookingEvent {}

    record Cancelled(Long bookingId, UUID bookerUserId, String bookerName,
                     UUID resourceId, String resourceName,
                     LocalDate date, LocalTime startTime, LocalTime endTime,
                     String cancelledByName, boolean cancelledByAdmin,
                     UUID resourceDomainId) implements BookingEvent {}
}
