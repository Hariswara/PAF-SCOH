package com.smartcampus;

import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
        // Create a user in DB
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
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.user.email").value("auth-test@example.com"));
    }

    @Test
    void accessingProtectedRouteWithoutLoginShouldFail() throws Exception {
        mockMvc.perform(get("/api/greet"))
                .andExpect(status().isForbidden()); // Entry point returns 403 for unauthorized
    }
}
