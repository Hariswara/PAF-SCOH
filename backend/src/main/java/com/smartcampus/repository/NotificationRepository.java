package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends ListCrudRepository<Notification, UUID> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(UUID userId, boolean read);

    long countByUserIdAndRead(UUID userId, boolean read);

    @Modifying
    @Query("UPDATE notifications SET is_read = true WHERE user_id = :userId AND is_read = false")
    void markAllReadByUserId(UUID userId);
}
