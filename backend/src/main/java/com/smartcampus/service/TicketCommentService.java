package com.smartcampus.service;

import com.smartcampus.dto.CommentResponse;
import com.smartcampus.dto.CreateCommentRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedActionException;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketCommentService(TicketCommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse addComment(UUID ticketId, CreateCommentRequest request, OAuth2User principal) {
        User currentUser = resolveUser(principal);
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        TicketComment comment = new TicketComment(
                null, ticketId, currentUser.id(), request.body(), false, null, null);
        return toResponse(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(this::toResponse).toList();
    }

    public CommentResponse editComment(UUID ticketId, UUID commentId,
            CreateCommentRequest request, OAuth2User principal) {
        User currentUser = resolveUser(principal);
        TicketComment existing = findComment(ticketId, commentId);

        if (!existing.authorId().equals(currentUser.id())) {
            throw new UnauthorizedActionException("You can only edit your own comments");
        }

        TicketComment updated = new TicketComment(
                existing.id(), existing.ticketId(), existing.authorId(),
                request.body(), true, existing.createdAt(), null);
        return toResponse(commentRepository.save(updated));
    }

    public void deleteComment(UUID ticketId, UUID commentId, OAuth2User principal) {
        User currentUser = resolveUser(principal);
        TicketComment comment = findComment(ticketId, commentId);

        boolean isOwner = comment.authorId().equals(currentUser.id());
        boolean isAdmin = currentUser.role() == UserRole.SUPER_ADMIN
                || currentUser.role() == UserRole.DOMAIN_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedActionException("You can only delete your own comments");
        }
        commentRepository.deleteById(commentId);
    }

    private TicketComment findComment(UUID ticketId, UUID commentId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.ticketId().equals(ticketId)) {
            throw new ResourceNotFoundException("Comment does not belong to this ticket");
        }
        return comment;
    }

    private User resolveUser(OAuth2User principal) {
        String email = principal.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private CommentResponse toResponse(TicketComment c) {
        String authorName = userRepository.findById(c.authorId())
                .map(User::fullName).orElse("Unknown");
        return new CommentResponse(c.id(), c.ticketId(), c.authorId(), authorName,
                c.body(), c.edited(), c.createdAt(), c.updatedAt());
    }
}