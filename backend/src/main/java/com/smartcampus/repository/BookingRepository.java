package com.smartcampus.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import org.springframework.data.repository.ListCrudRepository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;

public interface BookingRepository extends ListCrudRepository<Booking, Long> {

    boolean existsByResourceIdAndDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
            UUID resourceId,
            LocalDate date,
            LocalTime endTime,
            LocalTime startTime,
            BookingStatus status
    );
}