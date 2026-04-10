package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    /** GET /api/resources — all resources (any active user) */
    @GetMapping
    public List<ResourceResponse> getAll() {
        return resourceService.getAllResources();
    }

    /** GET /api/resources/{id} */
    @GetMapping("/{id}")
    public ResourceResponse getById(@PathVariable UUID id) {
        return resourceService.getById(id);
    }

    /**
     * GET /api/resources/search
     * Query params: domainId, resourceType, status, minCapacity, location, query
     */
    @GetMapping("/search")
    public List<ResourceResponse> search(
            @RequestParam(required = false) UUID domainId,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String query) {
        return resourceService.search(domainId, resourceType, status, minCapacity, location, query);
    }

    /** POST /api/resources — SUPER_ADMIN or DOMAIN_ADMIN */
    @PostMapping
    public ResponseEntity<ResourceResponse> create(
            @Valid @RequestBody CreateResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.create(request));
    }

    /** PUT /api/resources/{id} — SUPER_ADMIN or owning DOMAIN_ADMIN */
    @PutMapping("/{id}")
    public ResourceResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateResourceRequest request) {
        return resourceService.update(id, request);
    }

    /**
     * PATCH /api/resources/{id}/status — SUPER_ADMIN (any) or DOMAIN_ADMIN (own
     * domain)
     */
    @PatchMapping("/{id}/status")
    public ResourceResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateResourceStatusRequest request) {
        return resourceService.updateStatus(id, request);
    }

    /** DELETE /api/resources/{id} — SUPER_ADMIN or owning DOMAIN_ADMIN */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}