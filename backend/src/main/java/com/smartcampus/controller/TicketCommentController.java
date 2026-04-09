package com.smartcampus.controller;

import com.smartcampus.dto.CommentResponse;
import com.smartcampus.dto.CreateCommentRequest;
import com.smartcampus.service.TicketCommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class TicketCommentController {

    private final TicketCommentService commentService;

    public TicketCommentController(TicketCommentService commentService) {
        this.commentService = commentService;
    }

    /** POST: /api/tickets/{ticketId}/comments */
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(ticketId, request, principal));
    }

    /** GET: /api/tickets/{ticketId}/comments */
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    /** PUT: /api/tickets/{ticketId}/comments/{commentId} */
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> editComment(
            @PathVariable UUID ticketId,
            @PathVariable UUID commentId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(commentService.editComment(ticketId, commentId, request, principal));
    }

    /** DELETE: /api/tickets/{ticketId}/comments/{commentId} */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID ticketId,
            @PathVariable UUID commentId,
            @AuthenticationPrincipal OAuth2User principal) {
        commentService.deleteComment(ticketId, commentId, principal);
        return ResponseEntity.noContent().build();
    }
}
