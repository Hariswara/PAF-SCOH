package com.smartcampus.service;

import com.smartcampus.dto.NotificationResponse;
import com.smartcampus.event.TicketEvent;
import com.smartcampus.event.UserEvent;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SseEmitterManager sseEmitterManager;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               SseEmitterManager sseEmitterManager) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.sseEmitterManager = sseEmitterManager;
    }

    // ── Event Listeners ──

    @Async
    @EventListener
    public void onTicketCreated(TicketEvent.Created event) {
        // Notify domain admins & super admins
        List<User> admins = userRepository.findByRoleAndStatus(UserRole.SUPER_ADMIN, UserStatus.ACTIVE);
        if (event.domainId() != null) {
            admins.addAll(
                userRepository.findByRoleAndStatus(UserRole.DOMAIN_ADMIN, UserStatus.ACTIVE).stream()
                    .filter(u -> event.domainId().equals(u.domainId()))
                    .toList()
            );
        }

        String creatorName = userRepository.findById(event.createdBy())
            .map(User::fullName).orElse("A user");

        for (User admin : admins) {
            if (admin.id().equals(event.createdBy())) continue;
            createAndPush(
                admin.id(),
                NotificationType.TICKET_CREATED,
                "New Ticket Created",
                creatorName + " submitted a new " + event.priority() + " " + event.category()
                    + " ticket at " + event.location(),
                event.ticketId().toString(),
                "TICKET"
            );
        }
    }

    @Async
    @EventListener
    public void onTicketAssigned(TicketEvent.Assigned event) {
        createAndPush(
            event.assignedTo(),
            NotificationType.TICKET_ASSIGNED,
            "Ticket Assigned to You",
            "You have been assigned a ticket at " + event.ticketLocation(),
            event.ticketId().toString(),
            "TICKET"
        );
    }

    @Async
    @EventListener
    public void onTicketStatusChanged(TicketEvent.StatusChanged event) {
        createAndPush(
            event.createdBy(),
            NotificationType.TICKET_STATUS_CHANGED,
            "Ticket Status Updated",
            "Your ticket at " + event.ticketLocation() + " has been moved to " + event.newStatus(),
            event.ticketId().toString(),
            "TICKET"
        );
    }

    @Async
    @EventListener
    public void onTicketCommentAdded(TicketEvent.CommentAdded event) {
        // Notify ticket creator
        if (event.ticketCreatedBy() != null && !event.ticketCreatedBy().equals(event.commentAuthorId())) {
            createAndPush(
                event.ticketCreatedBy(),
                NotificationType.TICKET_COMMENT_ADDED,
                "New Comment on Your Ticket",
                event.authorName() + " commented on your ticket at " + event.ticketLocation(),
                event.ticketId().toString(),
                "TICKET"
            );
        }
        // Notify assigned technician
        if (event.assignedTo() != null
                && !event.assignedTo().equals(event.commentAuthorId())
                && !event.assignedTo().equals(event.ticketCreatedBy())) {
            createAndPush(
                event.assignedTo(),
                NotificationType.TICKET_COMMENT_ADDED,
                "New Comment on Assigned Ticket",
                event.authorName() + " commented on a ticket at " + event.ticketLocation(),
                event.ticketId().toString(),
                "TICKET"
            );
        }
    }

    @Async
    @EventListener
    public void onUserRegistered(UserEvent.Registered event) {
        List<User> superAdmins = userRepository.findByRoleAndStatus(UserRole.SUPER_ADMIN, UserStatus.ACTIVE);
        for (User admin : superAdmins) {
            createAndPush(
                admin.id(),
                NotificationType.USER_REGISTERED,
                "New User Registration",
                event.fullName() + " (" + event.email() + ") registered as " + event.registrationType(),
                event.userId().toString(),
                "USER"
            );
        }
    }

    @Async
    @EventListener
    public void onUserActivated(UserEvent.Activated event) {
        createAndPush(
            event.userId(),
            NotificationType.USER_ACTIVATED,
            "Account Activated",
            "Your account has been activated. You now have full access to Smart Campus.",
            event.userId().toString(),
            "USER"
        );
    }

    @Async
    @EventListener
    public void onUserRoleChanged(UserEvent.RoleChanged event) {
        createAndPush(
            event.userId(),
            NotificationType.USER_ROLE_CHANGED,
            "Role Updated",
            "Your role has been changed from " + event.oldRole() + " to " + event.newRole(),
            event.userId().toString(),
            "USER"
        );
    }

    @Async
    @EventListener
    public void onUserSuspended(UserEvent.Suspended event) {
        createAndPush(
            event.userId(),
            NotificationType.USER_SUSPENDED,
            "Account Suspended",
            "Your account has been suspended. Please contact administration.",
            event.userId().toString(),
            "USER"
        );
    }

    // ── REST-facing methods ──

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(UUID userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false)
            .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, UUID userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!n.userId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to this user");
        }
        Notification updated = notificationRepository.save(n.withRead(true));
        return toResponse(updated);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    // ── Internal helpers ──

    private void createAndPush(UUID userId, String type, String title, String message,
                               String referenceId, String referenceType) {
        Notification notification = new Notification(
            null, userId, type, title, message, referenceId, referenceType, false, null
        );
        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);
        sseEmitterManager.sendToUser(userId, "notification", response);
        log.debug("Notification [{}] sent to user {}", type, userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
            n.id(), n.type(), n.title(), n.message(),
            n.referenceId(), n.referenceType(), n.isRead(), n.createdAt()
        );
    }

}
