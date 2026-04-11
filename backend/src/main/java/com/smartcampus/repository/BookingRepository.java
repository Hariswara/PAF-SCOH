package com.smartcampus.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.repository.ListCrudRepository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;

public interface BookingRepository extends ListCrudRepository<Booking, Long> {

    List<Booking> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    List<Booking> findByCreatedByAndStatusOrderByCreatedAtDesc(String createdBy, BookingStatus status);

    List<Booking> findByCreatedByAndDateOrderByCreatedAtDesc(String createdBy, LocalDate date);

    List<Booking> findByCreatedByAndStatusAndDateOrderByCreatedAtDesc(
            String createdBy,
            BookingStatus status,
            LocalDate date
    );

    List<Booking> findByResourceIdAndDate(UUID resourceId, LocalDate date);

    List<Booking> findByResourceIdIn(Collection<UUID> resourceIds);

    boolean existsByResourceIdAndDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNotIn(
            UUID resourceId,
            LocalDate date,
            LocalTime endTime,
            LocalTime startTime,
            Collection<BookingStatus> statuses
    );
}