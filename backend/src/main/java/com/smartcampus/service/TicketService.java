package com.smartcampus.service;

import com.smartcampus.dto.*;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.TicketAttachmentLimitException;
import com.smartcampus.exception.UnauthorizedActionException;
import com.smartcampus.model.*;
import com.smartcampus.repository.*;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@Transactional
public class TicketService {

        private static final int MAX_ATTACHMENTS = 3;
        private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
                        "image/jpeg", "image/png", "image/webp", "image/gif");

        private final TicketRepository ticketRepository;
        private final TicketAttachmentRepository attachmentRepository;
        private final TicketCommentRepository commentRepository;
        private final UserRepository userRepository;
        private final CloudinaryService cloudinaryService;
        private final AuthService authService;

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
                this.authService = authService;
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

        // WORKFLOW

        public TicketResponse updateStatus(UUID ticketId, UpdateTicketStatusRequest request, OAuth2User principal) {
                User currentUser = resolveUser(principal);
                Ticket ticket = findTicket(ticketId);

                validateStatusTransition(ticket.status(), request.status(), currentUser);

                String rejectionReason = ticket.rejectionReason();
                if (request.status() == TicketStatus.REJECTED) {
                        if (request.rejectionReason() == null || request.rejectionReason().isBlank()) {
                                throw new IllegalArgumentException("A rejection reason is required");
                        }
                        rejectionReason = request.rejectionReason();
                }

                Ticket updated = new Ticket(
                                ticket.id(), ticket.createdBy(), ticket.domainId(), ticket.resourceId(),
                                ticket.location(), ticket.category(), ticket.description(), ticket.priority(),
                                ticket.preferredContact(), request.status(), rejectionReason,
                                ticket.assignedTo(), ticket.resolutionNotes(), ticket.linkedTicketId(),
                                ticket.linkedReportersCount(), ticket.createdAt(), null);
                return buildResponse(ticketRepository.save(updated));
        }

        public TicketResponse assignTechnician(UUID ticketId, UUID technicianId, OAuth2User principal) {
                User currentUser = resolveUser(principal);
                if (!isDomainAdminOrSuper(currentUser)) {
                        throw new UnauthorizedActionException(
                                        "Only Domain Admin or Super Admin can assign technicians");
                }

                Ticket ticket = findTicket(ticketId);
                User technician = userRepository.findById(technicianId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Technician not found: " + technicianId));

                if (technician.role() != UserRole.TECHNICIAN) {
                        throw new IllegalArgumentException("User is not a TECHNICIAN");
                }

                Ticket updated = new Ticket(
                                ticket.id(), ticket.createdBy(), ticket.domainId(), ticket.resourceId(),
                                ticket.location(), ticket.category(), ticket.description(), ticket.priority(),
                                ticket.preferredContact(), ticket.status(), ticket.rejectionReason(),
                                technicianId, ticket.resolutionNotes(), ticket.linkedTicketId(),
                                ticket.linkedReportersCount(), ticket.createdAt(), null);
                return buildResponse(ticketRepository.save(updated));
        }

        public TicketResponse addResolutionNotes(UUID ticketId, ResolutionNotesRequest request, OAuth2User principal) {
                User currentUser = resolveUser(principal);
                Ticket ticket = findTicket(ticketId);

                boolean isTechnicianOnTicket = currentUser.role() == UserRole.TECHNICIAN
                                && currentUser.id().equals(ticket.assignedTo());

                if (!isTechnicianOnTicket && !isAdmin(currentUser)) {
                        throw new UnauthorizedActionException(
                                        "Only the assigned technician or admin can add resolution notes");
                }

                Ticket updated = new Ticket(
                                ticket.id(), ticket.createdBy(), ticket.domainId(), ticket.resourceId(),
                                ticket.location(), ticket.category(), ticket.description(), ticket.priority(),
                                ticket.preferredContact(), ticket.status(), ticket.rejectionReason(),
                                ticket.assignedTo(), request.resolutionNotes(), ticket.linkedTicketId(),
                                ticket.linkedReportersCount(), ticket.createdAt(), null);
                return buildResponse(ticketRepository.save(updated));
        }

        // HELPERS

        private void validateStatusTransition(TicketStatus current, TicketStatus next, User actor) {
                // Technicians can move OPEN→IN_PROGRESS→RESOLVED
                // Admins can do all transitions including REJECTED and CLOSED
                boolean isAdmin = isAdmin(actor);
                boolean isTechnician = actor.role() == UserRole.TECHNICIAN;

                switch (next) {
                        case IN_PROGRESS -> {
                                if (current != TicketStatus.OPEN)
                                        throw new IllegalStateException("Ticket must be OPEN to move to IN_PROGRESS");
                        }
                        case RESOLVED -> {
                                if (current != TicketStatus.IN_PROGRESS)
                                        throw new IllegalStateException(
                                                        "Ticket must be IN_PROGRESS to move to RESOLVED");
                                if (!isTechnician && !isAdmin)
                                        throw new UnauthorizedActionException(
                                                        "Only assigned technician or admin can resolve tickets");
                        }
                        case CLOSED -> {
                                if (current != TicketStatus.RESOLVED)
                                        throw new IllegalStateException("Ticket must be RESOLVED before CLOSED");
                                if (!isAdmin)
                                        throw new UnauthorizedActionException("Only admin can close tickets");
                        }
                        case REJECTED -> {
                                if (!isAdmin)
                                        throw new UnauthorizedActionException("Only admin can reject tickets");
                        }
                        default -> throw new IllegalStateException("Invalid target status: " + next);
                }
        }

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

        private boolean isDomainAdminOrSuper(User user) {
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