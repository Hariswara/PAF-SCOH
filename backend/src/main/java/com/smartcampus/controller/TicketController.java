package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

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

    /** GET: /api/tickets — list all tickets (admin / domain admin) */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    /** GET: /api/tickets/mine — tickets created by the authenticated user */
    @GetMapping("/mine")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(ticketService.getMyTickets(principal));
    }

    /**
     * GET: /api/tickets/assigned — tickets assigned to the authenticated technician
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(ticketService.getAssignedTickets(principal));
    }

    /** GET: /api/tickets/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    /** PATCH: /api/tickets/{id}/status */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, principal));
    }

    /** PATCH: /api/tickets/{id}/assign */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable UUID id,
            @Valid @RequestBody AssignTechnicianRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.technicianId(), principal));
    }

    /** PATCH: /api/tickets/{id}/resolution */
    @PatchMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> addResolutionNotes(
            @PathVariable UUID id,
            @Valid @RequestBody ResolutionNotesRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(ticketService.addResolutionNotes(id, request, principal));
    }

    // Attachments

    /** POST /api/tickets/{id}/attachments */
    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentResponse> addAttachment(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal OAuth2User principal) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addAttachment(id, file, principal));
    }

    /** GET /api/tickets/{id}/attachments */
    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getAttachments(id));
    }

    /** DELETE /api/tickets/{id}/attachments/{attachmentId} */
    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID id,
            @PathVariable UUID attachmentId,
            @AuthenticationPrincipal OAuth2User principal) throws IOException {
        ticketService.deleteAttachment(id, attachmentId, principal);
        return ResponseEntity.noContent().build();
    }

}
