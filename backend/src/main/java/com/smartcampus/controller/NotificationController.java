package com.smartcampus.controller;

import com.smartcampus.dto.NotificationResponse;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.NotificationService;
import com.smartcampus.service.SseEmitterManager;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterManager sseEmitterManager;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService,
                                  SseEmitterManager sseEmitterManager,
                                  AuthService authService) {
        this.notificationService = notificationService;
        this.sseEmitterManager = sseEmitterManager;
        this.authService = authService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        User user = requireUser();
        return sseEmitterManager.createEmitter(user.id());
    }

    @GetMapping
    public List<NotificationResponse> getAll() {
        return notificationService.getUserNotifications(requireUser().id());
    }

    @GetMapping("/unread")
    public List<NotificationResponse> getUnread() {
        return notificationService.getUnreadNotifications(requireUser().id());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        long count = notificationService.getUnreadCount(requireUser().id());
        return Map.of("count", count);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable UUID id) {
        return notificationService.markAsRead(id, requireUser().id());
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllAsRead(requireUser().id());
        return ResponseEntity.ok().build();
    }

    private User requireUser() {
        User user = authService.getCurrentUser();
        if (user == null) throw new IllegalStateException("Not authenticated");
        return user;
    }
}
