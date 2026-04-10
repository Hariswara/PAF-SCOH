package com.smartcampus.repository;

import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.UserStatus;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends ListCrudRepository<User, UUID> {
    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByEmail(String email);

    long countByStatus(UserStatus status);

    /** Used by technician assignment dropdown. */
    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
}
