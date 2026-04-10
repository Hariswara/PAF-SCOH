package com.smartcampus.controller;

import com.smartcampus.dto.DuplicateCheckRequest;
import com.smartcampus.dto.DuplicateSuggestion;
import com.smartcampus.service.DuplicateDetectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Fix #8 — accepts location and domainId for richer duplicate matching.
 */
@RestController
@RequestMapping("/api/tickets/duplicates")
public class DuplicateDetectionController {

    private final DuplicateDetectionService detectionService;

    public DuplicateDetectionController(DuplicateDetectionService detectionService) {
        this.detectionService = detectionService;
    }

    @GetMapping("/check")
    public ResponseEntity<List<DuplicateSuggestion>> checkGet(
            @RequestParam String description,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String domainId,
            @RequestParam(required = false) String excludeTicketId) throws Exception {
        return ResponseEntity.ok(
                detectionService.findSimilar(description, location, category, domainId, excludeTicketId));
    }

    @PostMapping("/check")
    public ResponseEntity<List<DuplicateSuggestion>> checkPost(
            @Valid @RequestBody DuplicateCheckRequest request) throws Exception {
        return ResponseEntity.ok(
                detectionService.findSimilar(
                        request.description(), request.location(), request.category(),
                        request.domainId(), request.excludeTicketId()));
    }
}