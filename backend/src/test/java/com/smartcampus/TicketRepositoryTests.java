package com.smartcampus;

import com.smartcampus.model.*;
import com.smartcampus.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TicketRepositoryTests {

    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setup() {
        testUser = userRepository.save(new User(
                null, "google-ticket-test", "ticket-test@example.com", "Ticket Tester",
                null, null, null, null,
                UserRole.STUDENT, UserStatus.ACTIVE, null, null, null, null));
    }

    private Ticket buildTicket() {
        return new Ticket(
                null, testUser.id(), null, null,
                "Lab 301", TicketCategory.EQUIPMENT,
                "Projector not working", TicketPriority.HIGH,
                "ticket-test@example.com", TicketStatus.OPEN,
                null, null, null, null, 0, null, null);
    }

    @Test
    void testTicketPersistence() {
        Ticket saved = ticketRepository.save(buildTicket());
        assertThat(saved.id()).isNotNull();
        assertThat(saved.status()).isEqualTo(TicketStatus.OPEN);
    }

    @Test
    void testFindByCreatedBy() {
        ticketRepository.save(buildTicket());
        ticketRepository.save(buildTicket());
        List<Ticket> tickets = ticketRepository.findByCreatedByOrderByCreatedAtDesc(testUser.id());
        assertThat(tickets).hasSize(2);
    }

    @Test
    void testFindByStatus() {
        ticketRepository.save(buildTicket());
        List<Ticket> open = ticketRepository.findByStatusOrderByCreatedAtDesc(TicketStatus.OPEN);
        assertThat(open).isNotEmpty();
    }

    @Test
    void testCountByStatus() {
        ticketRepository.save(buildTicket());
        ticketRepository.save(buildTicket());
        long count = ticketRepository.countByStatus(TicketStatus.OPEN);
        assertThat(count).isGreaterThanOrEqualTo(2);
    }
}