package com.smartcampus.service;


import java.io.IOException;
import java.util.*;

import org.springframework.security.oauth2.core.user.OAuth2User;

import com.smartcampus.dto.CreateTicketRequest;
import com.smartcampus.dto.TicketResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketAttachmentRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;

public class TicketService {

        private final TicketRepository ticketRepository;
        private final TicketCommentRepository commentRepository;
        private final UserRepository userRepository;


        public TicketService(TicketRepository ticketRepository,
                        TicketAttachmentRepository attachmentRepository,
                        TicketCommentRepository commentRepository,
                        UserRepository userRepository,
                        CloudinaryService cloudinaryService,
                        AuthService authService) {
                this.ticketRepository = ticketRepository;
                this.commentRepository = commentRepository;
                this.userRepository = userRepository;
        }

        // CREATE TICKET

        public TicketResponse createTicket(CreateTicketRequest request, OAuth2User principal) {
                User currentUser = resolveUser(principal);

                Ticket ticket = new Ticket(
                                null,
                                currentUser.id(),
                                currentUser.domainId(),
                                request.resourceId(),
                                request.location(),
                                request.category(),
                                request.description(),
                                request.priority(),
                                request.preferredContact(),
                                TicketStatus.OPEN,
                                null,
                                null,
                                null,
                                request.linkedTicketId(),
                                0,
                                null,
                                null);
                Ticket saved = ticketRepository.save(ticket);

                // If user chose to link to existing ticket, increment that ticket's reporter
                // count
                if (request.linkedTicketId() != null) {
                        ticketRepository.findById(request.linkedTicketId()).ifPresent(parent -> {
                                Ticket updated = new Ticket(
                                                parent.id(), parent.createdBy(), parent.domainId(), parent.resourceId(),
                                                parent.location(), parent.category(), parent.description(),
                                                parent.priority(),
                                                parent.preferredContact(), parent.status(), parent.rejectionReason(),
                                                parent.assignedTo(), parent.resolutionNotes(), parent.linkedTicketId(),
                                                parent.linkedReportersCount() + 1,
                                                parent.createdAt(), null);
                                ticketRepository.save(updated);
                        });
                }

                return buildResponse(saved);
        }

        private User resolveUser(OAuth2User principal) {
                String email = principal.getAttribute("email");
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        }

        TicketResponse buildResponse(Ticket t) {
                String createdByName = userRepository.findById(t.createdBy())
                                .map(User::fullName).orElse("Unknown");
                String assignedToName = t.assignedTo() == null ? null
                                : userRepository.findById(t.assignedTo()).map(User::fullName).orElse(null);


                long commentCount = commentRepository.countByTicketId(t.id());

                return new TicketResponse(
                                t.id(), t.createdBy(), createdByName, t.domainId(), t.resourceId(),
                                t.location(), t.category(), t.description(), t.priority(),
                                t.preferredContact(), t.status(), t.rejectionReason(),
                                t.assignedTo(), assignedToName, t.resolutionNotes(),
                                t.linkedTicketId(), t.linkedReportersCount(),
                                null, commentCount, t.createdAt(), t.updatedAt());
        }

}
