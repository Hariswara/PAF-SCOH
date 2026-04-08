package com.smartcampus.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.CreateTicketRequest;
import com.smartcampus.dto.TicketResponse;
import com.smartcampus.service.TicketService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // POST: /api/tickets — create a new ticket
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        TicketResponse response = ticketService.createTicket(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** GET /api/tickets — list all tickets (admin / domain admin) */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    /** GET /api/tickets/mine — tickets created by the authenticated user */
    @GetMapping("/mine")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(ticketService.getMyTickets(principal));
    }

    /**
     * GET /api/tickets/assigned — tickets assigned to the authenticated technician
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(ticketService.getAssignedTickets(principal));
    }

    /** GET /api/tickets/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

}
