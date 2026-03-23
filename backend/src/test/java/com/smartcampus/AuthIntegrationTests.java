package com.smartcampus;

import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void unauthenticatedStatusShouldReturnFalse() throws Exception {
        mockMvc.perform(get("/api/auth/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false));
    }

    @Test
    void authenticatedStatusShouldReturnUser() throws Exception {
        userRepository.save(new User(
                null, "google-123", "auth-test@example.com", "Auth Test User",
                null, null, null, null,
                UserRole.STUDENT, UserStatus.ACTIVE, null, null, null, null
        ));

        mockMvc.perform(get("/api/auth/status")
                .with(oauth2Login()
                        .attributes(attrs -> {
                            attrs.put("sub", "google-123");
                            attrs.put("email", "auth-test@example.com");
                            attrs.put("name", "Auth Test User");
                        })))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true));
    }

    @Test
    void unauthenticatedApiAccessShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/greet"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void pendingProfileUserCanAccessRegistrationButNotGreet() throws Exception {
        userRepository.save(new User(
                null, "google-pending", "pending@example.com", "Pending User",
                null, null, null, null,
                null, UserStatus.PENDING_PROFILE, null, null, null, null
        ));

        // Can access registration
        mockMvc.perform(post("/api/auth/register/student")
                .with(csrf()) // Add CSRF token for POST
                .with(oauth2Login()
                        .authorities(new SimpleGrantedAuthority("STATUS_PENDING_PROFILE"))
                        .attributes(attrs -> {
                            attrs.put("sub", "google-pending");
                            attrs.put("email", "pending@example.com");
                        })))
                .andExpect(status().isOk());

        // Cannot access greet
        mockMvc.perform(get("/api/greet")
                .with(oauth2Login()
                        .authorities(new SimpleGrantedAuthority("STATUS_PENDING_PROFILE"))
                        .attributes(attrs -> {
                            attrs.put("sub", "google-pending");
                            attrs.put("email", "pending@example.com");
                        })))
                .andExpect(status().isForbidden());
    }

    @Test
    void activeUserCanAccessGreet() throws Exception {
        userRepository.save(new User(
                null, "google-active", "active@example.com", "Active User",
                null, null, null, null,
                UserRole.STUDENT, UserStatus.ACTIVE, null, null, null, null
        ));

        mockMvc.perform(get("/api/greet")
                .with(oauth2Login()
                        .authorities(new SimpleGrantedAuthority("STATUS_ACTIVE"))
                        .attributes(attrs -> {
                            attrs.put("sub", "google-active");
                            attrs.put("email", "active@example.com");
                        })))
                .andExpect(status().isOk());
    }
}
