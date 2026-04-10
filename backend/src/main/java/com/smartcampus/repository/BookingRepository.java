package com.smartcampus.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.UUID;
import java.util.List;

import org.springframework.data.repository.ListCrudRepository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;

public interface BookingRepository extends ListCrudRepository<Booking, Long> {

    boolean existsByResourceIdAndDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNotIn(
            UUID resourceId,
            LocalDate date,
            LocalTime endTime,
            LocalTime startTime,
            Collection<BookingStatus> statuses
    );
}//
    List<Booking> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    List<Booking> findByCreatedByAndStatusOrderByCreatedAtDesc(String createdBy, BookingStatus status);

    List<Booking> findByCreatedByAndDateOrderByCreatedAtDesc(String createdBy, LocalDate date);

    List<Booking> findByCreatedByAndStatusAndDateOrderByCreatedAtDesc(
            String createdBy,
            BookingStatus status,
            LocalDate date
    );
}
