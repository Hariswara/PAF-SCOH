package com.smartcampus;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.dto.CreateCommentRequest;
import com.smartcampus.model.*;
import com.smartcampus.repository.*;
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

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TicketCommentTests {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private ObjectMapper objectMapper;

    private User activeUser;
    private Ticket ticket;

    @BeforeEach
    void setup() {
        activeUser = userRepository.save(new User(
                null, "google-comment-test", "comment-test@example.com", "Comment Tester",
                null, null, null, null, null, null,
                UserRole.STUDENT, UserStatus.ACTIVE, null, null, null, null));
        ticket = ticketRepository.save(new Ticket(
                null, activeUser.id(), null, null, "Lab 302",
                TicketCategory.NETWORK, "Wi-Fi keeps dropping in lab 302",
                TicketPriority.MEDIUM, "comment-test@example.com",
                TicketStatus.OPEN, null, null, null, null, 0, null, null));
    }

    @Test
    void addComment_shouldReturn201() throws Exception {
        CreateCommentRequest req = new CreateCommentRequest("This is a test comment");

        mockMvc.perform(post("/api/tickets/{ticketId}/comments", ticket.id())
                .with(csrf())
                .with(oauth2Login()
                        .authorities(new SimpleGrantedAuthority("STATUS_ACTIVE"))
                        .attributes(a -> {
                            a.put("sub", "google-comment-test");
                            a.put("email", "comment-test@example.com");
                        }))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.body").value("This is a test comment"))
                .andExpect(jsonPath("$.edited").value(false));
    }

    @Test
    void getComments_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/tickets/{ticketId}/comments", ticket.id())
                .with(oauth2Login()
                        .authorities(new SimpleGrantedAuthority("STATUS_ACTIVE"))
                        .attributes(a -> {
                            a.put("sub", "google-comment-test");
                            a.put("email", "comment-test@example.com");
                        })))
                .andExpect(status().isOk());
    }

    @Test
    void addComment_blankBody_shouldReturn400() throws Exception {
        CreateCommentRequest req = new CreateCommentRequest("");

        mockMvc.perform(post("/api/tickets/{ticketId}/comments", ticket.id())
                .with(csrf())
                .with(oauth2Login()
                        .authorities(new SimpleGrantedAuthority("STATUS_ACTIVE"))
                        .attributes(a -> {
                            a.put("sub", "google-comment-test");
                            a.put("email", "comment-test@example.com");
                        }))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}