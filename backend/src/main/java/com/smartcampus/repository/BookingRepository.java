package com.smartcampus.repository;
import org.springframework.data.repository.ListCrudRepository;

import com.smartcampus.model.Booking;

public interface BookingRepository extends ListCrudRepository<Booking, Long> {
}