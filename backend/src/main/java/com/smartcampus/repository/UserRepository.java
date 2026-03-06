package com.smartcampus.repository;

import com.smartcampus.model.User;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends ListCrudRepository<User, UUID> {
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByEmail(String email);
}
