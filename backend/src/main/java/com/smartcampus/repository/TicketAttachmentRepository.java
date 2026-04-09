package com.smartcampus.repository;

import com.smartcampus.model.TicketAttachment;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketAttachmentRepository extends ListCrudRepository<TicketAttachment, UUID> {
    List<TicketAttachment> findByTicketId(UUID ticketId);

    long countByTicketId(UUID ticketId);
}
