package com.smartcampus.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.UUID;

@Table("ticket_comments")
public record TicketComment(
    @Id UUID id,
    UUID ticketId,
    UUID authorId,
    String body,
    boolean edited,
    @CreatedDate Instant createdAt,
    @LastModifiedDate Instant updatedAt
) {}
