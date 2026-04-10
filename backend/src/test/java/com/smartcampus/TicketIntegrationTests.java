package com.smartcampus;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.dto.CreateTicketRequest;
import com.smartcampus.model.*;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TicketIntegrationTests {

        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private ObjectMapper objectMapper;

        private User activeUser;

        @BeforeEach
        void setup() {
                activeUser = userRepository.save(new User(
                                null, "google-int-test", "int-test@example.com", "Integration Tester",
                                "IT21001", "IT", "0771234567", null,
                                UserRole.STUDENT, UserStatus.ACTIVE, null, null, null, null));
        }

        @Test
        void createTicket_shouldReturn201() throws Exception {
                CreateTicketRequest request = new CreateTicketRequest(
                                null,
                                "Projector Issue", // title
                                "Projector lamp is broken and flickers constantly", // ✅ description (ADDED)
                                TicketCategory.EQUIPMENT,
                                "Lab 401", // location
                                TicketPriority.HIGH,
                                "int-test@example.com", // attachment or contact
                                null);

                mockMvc.perform(post("/api/tickets")
                                .with(csrf())
                                .with(oauth2Login()
                                                .authorities(new SimpleGrantedAuthority("STATUS_ACTIVE"))
                                                .attributes(a -> {
                                                        a.put("sub", "google-int-test");
                                                        a.put("email", "int-test@example.com");
                                                }))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").isNotEmpty())
                                .andExpect(jsonPath("$.status").value("OPEN"))
                                .andExpect(jsonPath("$.location").value("Lab 401"));
        }

        @Test
        void createTicket_missingLocation_shouldReturn400() throws Exception {
                CreateTicketRequest request = new CreateTicketRequest(
                                null,
                                "Projector Issue",
                                "Projector broken", // ✅ description (ADDED)
                                TicketCategory.EQUIPMENT,
                                "", // invalid location
                                TicketPriority.HIGH,
                                "int-test@example.com",
                                null);

                mockMvc.perform(post("/api/tickets")
                                .with(csrf())
                                .with(oauth2Login()
                                                .authorities(new SimpleGrantedAuthority("STATUS_ACTIVE"))
                                                .attributes(a -> {
                                                        a.put("sub", "google-int-test");
                                                        a.put("email", "int-test@example.com");
                                                }))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void getTickets_unauthenticated_shouldReturn401() throws Exception {
                mockMvc.perform(get("/api/tickets"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getMyTickets_shouldReturn200() throws Exception {
                mockMvc.perform(get("/api/tickets/mine")
                                .with(oauth2Login()
                                                .authorities(new SimpleGrantedAuthority("STATUS_ACTIVE"))
                                                .attributes(a -> {
                                                        a.put("sub", "google-int-test");
                                                        a.put("email", "int-test@example.com");
                                                })))
                                .andExpect(status().isOk());
        }
}