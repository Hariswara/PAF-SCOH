package com.smartcampus.service;

import java.io.IOException;
import java.util.*;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.dto.AttachmentResponse;
import com.smartcampus.dto.CreateTicketRequest;
import com.smartcampus.dto.TicketResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.TicketAttachmentLimitException;
import com.smartcampus.exception.UnauthorizedActionException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.TicketAttachmentRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;

public class TicketService {

        private static final int MAX_ATTACHMENTS = 3;
        private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
                        "image/jpeg", "image/png", "image/webp", "image/gif");

        private final TicketRepository ticketRepository;
        private final TicketAttachmentRepository attachmentRepository;
        private final TicketCommentRepository commentRepository;
        private final UserRepository userRepository;
        private final CloudinaryService cloudinaryService;

        public TicketService(TicketRepository ticketRepository,
                        TicketAttachmentRepository attachmentRepository,
                        TicketCommentRepository commentRepository,
                        UserRepository userRepository,
                        CloudinaryService cloudinaryService,
                        AuthService authService) {
                this.ticketRepository = ticketRepository;
                this.attachmentRepository = attachmentRepository;
                this.commentRepository = commentRepository;
                this.userRepository = userRepository;
                this.cloudinaryService = cloudinaryService;
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

        // UPLOAD ATTACHMENT

        public AttachmentResponse addAttachment(UUID ticketId, MultipartFile file, OAuth2User principal)
                        throws IOException {
                User currentUser = resolveUser(principal);
                Ticket ticket = findTicket(ticketId);

                // Only ticket creator (or admin) can attach files
                if (!ticket.createdBy().equals(currentUser.id()) && !isAdmin(currentUser)) {
                        throw new UnauthorizedActionException("Only the ticket creator can add attachments");
                }

                long existing = attachmentRepository.countByTicketId(ticketId);
                if (existing >= MAX_ATTACHMENTS) {
                        throw new TicketAttachmentLimitException(
                                        "A ticket can have at most " + MAX_ATTACHMENTS + " attachments");
                }

                if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
                        throw new IllegalArgumentException("Only JPEG, PNG, WEBP and GIF images are allowed");
                }

                Map<String, String> upload = cloudinaryService.upload(file);

                TicketAttachment attachment = new TicketAttachment(
                                null,
                                ticketId,
                                currentUser.id(),
                                file.getOriginalFilename(),
                                file.getContentType(),
                                upload.get("public_id"),
                                upload.get("secure_url"),
                                file.getSize(),
                                null);
                TicketAttachment saved = attachmentRepository.save(attachment);
                return toAttachmentResponse(saved);
        }

        // READ

        @Transactional(readOnly = true)
        public TicketResponse getTicket(UUID id) {
                return buildResponse(findTicket(id));
        }

        @Transactional(readOnly = true)
        public List<TicketResponse> getAllTickets() {
                return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                                .map(this::buildResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<TicketResponse> getMyTickets(OAuth2User principal) {
                User currentUser = resolveUser(principal);
                return ticketRepository.findByCreatedByOrderByCreatedAtDesc(currentUser.id()).stream()
                                .map(this::buildResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<TicketResponse> getAssignedTickets(OAuth2User principal) {
                User currentUser = resolveUser(principal);
                return ticketRepository.findByAssignedToOrderByCreatedAtDesc(currentUser.id()).stream()
                                .map(this::buildResponse)
                                .toList();
        }

        // HELPER METHODS
        private Ticket findTicket(UUID id) {
                return ticketRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
        }

        private User resolveUser(OAuth2User principal) {
                String email = principal.getAttribute("email");
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        }

        private boolean isAdmin(User user) {
                return user.role() == UserRole.SUPER_ADMIN || user.role() == UserRole.DOMAIN_ADMIN;
        }

        TicketResponse buildResponse(Ticket t) {
                String createdByName = userRepository.findById(t.createdBy())
                                .map(User::fullName).orElse("Unknown");
                String assignedToName = t.assignedTo() == null ? null
                                : userRepository.findById(t.assignedTo()).map(User::fullName).orElse(null);

                List<AttachmentResponse> attachments = attachmentRepository.findByTicketId(t.id())
                                .stream().map(this::toAttachmentResponse).toList();

                long commentCount = commentRepository.countByTicketId(t.id());

                return new TicketResponse(
                                t.id(), t.createdBy(), createdByName, t.domainId(), t.resourceId(),
                                t.location(), t.category(), t.description(), t.priority(),
                                t.preferredContact(), t.status(), t.rejectionReason(),
                                t.assignedTo(), assignedToName, t.resolutionNotes(),
                                t.linkedTicketId(), t.linkedReportersCount(),
                                attachments, commentCount, t.createdAt(), t.updatedAt());
        }

        private AttachmentResponse toAttachmentResponse(TicketAttachment a) {
                return new AttachmentResponse(a.id(), a.ticketId(), a.filename(),
                                a.contentType(), a.publicUrl(), a.fileSize(), a.createdAt());
        }

}
