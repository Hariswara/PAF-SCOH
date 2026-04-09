package com.smartcampus;

import com.smartcampus.model.*;
import com.smartcampus.repository.DomainRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.UserRoleAuditRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DomainRepository domainRepository;

    @Autowired
    private UserRoleAuditRepository auditRepository;

    @Test
    void testUserPersistence() {
        User user = new User(
            null, "google-123", "test@example.com", "Test User",
            null, null, null, null, null, null,
            UserRole.STUDENT, UserStatus.ACTIVE, null, null, null, null
        );

        User saved = userRepository.save(user);
        assertThat(saved.id()).isNotNull();
        assertThat(saved.email()).isEqualTo("test@example.com");

        Optional<User> found = userRepository.findByGoogleId("google-123");
        assertThat(found).isPresent();
        assertThat(found.get().fullName()).isEqualTo("Test User");
    }

    @Test
    void testDomainPersistence() {
        Domain domain = new Domain(
            null, "Main Library", "The central library of the campus",
            true, null, null, null
        );

        Domain saved = domainRepository.save(domain);
        assertThat(saved.id()).isNotNull();
        assertThat(saved.name()).isEqualTo("Main Library");
    }

    @Test
    void testUserRoleAuditPersistence() {
        // Create a user first
        User user = userRepository.save(new User(
            null, "google-456", "audit@example.com", "Audit User",
            null, null, null, null, null, null,
            UserRole.STUDENT, UserStatus.ACTIVE, null, null, null, null
        ));

        UserRoleAudit audit = new UserRoleAudit(
            null, user.id(), user.id(),
            null, UserRole.STUDENT, null, null,
            "Initial registration", null
        );

        UserRoleAudit saved = auditRepository.save(audit);
        assertThat(saved.id()).isNotNull();
        
        List<UserRoleAudit> history = auditRepository.findByUserIdOrderByChangedAtDesc(user.id());
        assertThat(history).hasSize(1);
        assertThat(history.get(0).reason()).isEqualTo("Initial registration");
    }
}
