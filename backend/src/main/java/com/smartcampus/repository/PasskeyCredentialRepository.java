package com.smartcampus.repository;

import com.smartcampus.model.PasskeyCredential;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PasskeyCredentialRepository extends ListCrudRepository<PasskeyCredential, UUID> {

    List<PasskeyCredential> findByUserId(UUID userId);

    Optional<PasskeyCredential> findByCredentialIdBase64(String credentialIdBase64);

    @Modifying
    @Query("DELETE FROM passkey_credentials WHERE id = :id AND user_id = :userId")
    void deleteByIdAndUserId(UUID id, UUID userId);
}
