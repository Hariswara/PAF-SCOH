package com.smartcampus.repository;

import com.smartcampus.model.WebAuthnChallenge;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface WebAuthnChallengeRepository extends ListCrudRepository<WebAuthnChallenge, UUID> {

    Optional<WebAuthnChallenge> findByChallenge(String challenge);

    @Modifying
    @Query("DELETE FROM webauthn_challenges WHERE expires_at < :now")
    void deleteByExpiresAtBefore(Instant now);
}
