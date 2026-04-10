package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends ListCrudRepository<Ticket, UUID> {
    List<Ticket> findByCreatedByOrderByCreatedAtDesc(UUID createdBy);

    List<Ticket> findByAssignedToOrderByCreatedAtDesc(UUID assignedTo);

    List<Ticket> findAllByOrderByCreatedAtDesc();

    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<Ticket> findByStatusIn(List<TicketStatus> statuses);

    long countByStatus(TicketStatus status);

    /** Used to scope all-tickets view for DOMAIN_ADMIN. */
    List<Ticket> findByDomainIdOrderByCreatedAtDesc(UUID domainId);

    List<Ticket> findByLinkedTicketIdOrderByCreatedAtDesc(UUID linkedTicketId);

    long countByLinkedTicketId(UUID linkedTicketId);
}