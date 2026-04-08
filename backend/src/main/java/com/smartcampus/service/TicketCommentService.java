package com.smartcampus.service;

import com.smartcampus.dto.CommentResponse;
import com.smartcampus.dto.CreateCommentRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
