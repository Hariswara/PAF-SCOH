package com.smartcampus.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("users")
public record User(
    @Id UUID id,
    String googleId,
    String email,
    String fullName,
    String studentId,
    String department,
    String phone,
    String contactEmail,
    String gender,
    String profilePicture,
    UserRole role,
    UserStatus status,
    UUID domainId,
    Instant lastLoginAt,
    @CreatedDate Instant createdAt,
    @LastModifiedDate Instant updatedAt
) {
    public static User createNew(String googleId, String email, String fullName, String profilePicture) {
        return new User(
            null, googleId, email, fullName, null, null, null, null, null, profilePicture,
            null, UserStatus.PENDING_PROFILE, null, null, null, null
        );
    }
}
