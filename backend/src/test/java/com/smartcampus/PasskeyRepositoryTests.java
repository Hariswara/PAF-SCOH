package com.smartcampus;

import com.smartcampus.model.*;
import com.smartcampus.repository.PasskeyCredentialRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.WebAuthnChallengeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PasskeyRepositoryTests {

    @Autowired
    private PasskeyCredentialRepository passkeyRepo;

    @Autowired
    private WebAuthnChallengeRepository challengeRepo;

    @Autowired
    private UserRepository userRepository;

    private User savedUser(String email) {
        return userRepository.save(new User(
                null, null, email, "Test User",
                null, null, null, null, null, null,
                UserRole.STUDENT, UserStatus.ACTIVE, null, null, null, null
        ));
    }

    @Test
    void testPasskeyCredentialPersistenceAndLookup() {
        User user = savedUser("passkey-test@example.com");
        byte[] credId = "test-credential-id".getBytes();
        String credIdBase64 = "dGVzdC1jcmVkZW50aWFsLWlk"; // base64url of above
        byte[] pubKey = "test-public-key-cose".getBytes();

        PasskeyCredential saved = passkeyRepo.save(PasskeyCredential.createNew(
                user.id(), credId, credIdBase64, pubKey, 0L,
                "My MacBook", null, "[\"internal\"]"
        ));

        assertThat(saved.id()).isNotNull();
        assertThat(saved.userId()).isEqualTo(user.id());
        assertThat(saved.displayName()).isEqualTo("My MacBook");
        assertThat(saved.signatureCount()).isEqualTo(0L);

        Optional<PasskeyCredential> found = passkeyRepo.findByCredentialIdBase64(credIdBase64);
        assertThat(found).isPresent();
        assertThat(found.get().transports()).isEqualTo("[\"internal\"]");
    }

    @Test
    void testFindByUserId() {
        User user = savedUser("multi-passkey@example.com");
        byte[] credId1 = "cred-one".getBytes();
        byte[] credId2 = "cred-two".getBytes();

        passkeyRepo.save(PasskeyCredential.createNew(
                user.id(), credId1, "Y3JlZC1vbmU", "pubkey1".getBytes(),
                0L, "MacBook", null, null));
        passkeyRepo.save(PasskeyCredential.createNew(
                user.id(), credId2, "Y3JlZC10d28", "pubkey2".getBytes(),
                0L, "iPhone", null, null));

        List<PasskeyCredential> creds = passkeyRepo.findByUserId(user.id());
        assertThat(creds).hasSize(2);
    }

    @Test
    void testDeleteByIdAndUserId() {
        User user = savedUser("delete-passkey@example.com");
        PasskeyCredential cred = passkeyRepo.save(PasskeyCredential.createNew(
                user.id(), "del-cred".getBytes(), "ZGVsLWNyZWQ",
                "pubkey".getBytes(), 0L, "My Key", null, null));

        UUID credId = cred.id();
        passkeyRepo.deleteByIdAndUserId(credId, user.id());

        assertThat(passkeyRepo.findById(credId)).isEmpty();
    }

    @Test
    void testChallengePersistenceAndLookup() {
        User user = savedUser("challenge-test@example.com");
        String challengeValue = "random-base64url-challenge-string";

        WebAuthnChallenge challenge = new WebAuthnChallenge(
                null, challengeValue, user.id(), "REGISTRATION",
                "{\"challenge\":\"" + challengeValue + "\"}", // minimal requestJson stub
                Instant.now(), Instant.now().plusSeconds(60)
        );
        WebAuthnChallenge saved = challengeRepo.save(challenge);
        assertThat(saved.challengeId()).isNotNull();

        Optional<WebAuthnChallenge> found = challengeRepo.findByChallenge(challengeValue);
        assertThat(found).isPresent();
        assertThat(found.get().challengeType()).isEqualTo("REGISTRATION");
        assertThat(found.get().isExpired()).isFalse();
    }

    @Test
    void testExpiredChallengeCleanup() {
        User user = savedUser("cleanup-test@example.com");

        // Expired challenge
        challengeRepo.save(new WebAuthnChallenge(
                null, "expired-challenge", user.id(), "AUTHENTICATION",
                null, Instant.now().minusSeconds(120), Instant.now().minusSeconds(60)
        ));

        // Valid challenge
        challengeRepo.save(new WebAuthnChallenge(
                null, "valid-challenge", user.id(), "AUTHENTICATION",
                null, Instant.now(), Instant.now().plusSeconds(60)
        ));

        challengeRepo.deleteByExpiresAtBefore(Instant.now());

        assertThat(challengeRepo.findByChallenge("expired-challenge")).isEmpty();
        assertThat(challengeRepo.findByChallenge("valid-challenge")).isPresent();
    }

    @Test
    void testPasskeysCascadeDeleteWithUser() {
        User user = savedUser("cascade-test@example.com");
        passkeyRepo.save(PasskeyCredential.createNew(
                user.id(), "cascade-cred".getBytes(), "Y2FzY2FkZS1jcmVk",
                "pubkey".getBytes(), 0L, "My Device", null, null));

        assertThat(passkeyRepo.findByUserId(user.id())).hasSize(1);

        userRepository.deleteById(user.id());
        assertThat(passkeyRepo.findByUserId(user.id())).isEmpty();
    }
}
