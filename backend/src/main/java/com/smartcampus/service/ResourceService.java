package com.smartcampus.service;

import com.smartcampus.dto.CreateResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.dto.UpdateResourceRequest;
import com.smartcampus.dto.UpdateResourceStatusRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedActionException;
import com.smartcampus.model.Domain;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.DomainRepository;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final DomainRepository domainRepository;
    private final AuthService authService;

    public ResourceService(ResourceRepository resourceRepository,
            DomainRepository domainRepository,
            AuthService authService) {
        this.resourceRepository = resourceRepository;
        this.domainRepository = domainRepository;
        this.authService = authService;
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ResourceResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    /**
     * In-memory filtering — avoids the NULL/CONCAT issue in PostgreSQL @Query.
     * Fine for typical campus resource counts (hundreds, not millions).
     */
    public List<ResourceResponse> search(
            UUID domainId,
            String resourceType,
            String status,
            Integer minCapacity,
            String location,
            String query) {

        Stream<Resource> stream = resourceRepository.findAllByOrderByCreatedAtDesc().stream();

        if (domainId != null) {
            stream = stream.filter(r -> domainId.equals(r.domainId()));
        }
        if (resourceType != null && !resourceType.isBlank()) {
            stream = stream.filter(r -> resourceType.equalsIgnoreCase(r.resourceType()));
        }
        if (status != null && !status.isBlank()) {
            stream = stream.filter(r -> status.equalsIgnoreCase(r.status()));
        }
        if (minCapacity != null) {
            stream = stream.filter(r -> r.capacity() != null && r.capacity() >= minCapacity);
        }
        if (location != null && !location.isBlank()) {
            String loc = location.toLowerCase();
            stream = stream.filter(r -> r.location().toLowerCase().contains(loc));
        }
        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase();
            stream = stream.filter(r -> r.name().toLowerCase().contains(q) ||
                    r.location().toLowerCase().contains(q));
        }

        return stream.map(this::toResponse).toList();
    }
// ── Write ─────────────────────────────────────────────────────────────────

    @Transactional
    public ResourceResponse create(CreateResourceRequest req) {
        User actor = requireActiveUser();
        assertCanManageDomain(actor, req.domainId());

        // Validate the domain exists
        domainRepository.findById(req.domainId())
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found: " + req.domainId()));

        Resource resource = new Resource(
                null,
                req.domainId(),
                req.resourceType().name(), // store enum as String
                req.name(),
                req.description(),
                req.location(),
                req.capacity(),
                ResourceStatus.ACTIVE.name(), // store enum as String
                req.metadata(),
                actor.id(),
                null,
                null);
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public ResourceResponse update(UUID id, UpdateResourceRequest req) {
        User actor = requireActiveUser();
        Resource existing = findOrThrow(id);
        assertCanManageDomain(actor, existing.domainId());

        Resource updated = new Resource(
                existing.id(),
                existing.domainId(),
                req.resourceType().name(), // store enum as String
                req.name(),
                req.description(),
                req.location(),
                req.capacity(),
                existing.status(), // keep existing status
                req.metadata(),
                existing.createdBy(),
                existing.createdAt(),
                null);
        return toResponse(resourceRepository.save(updated));
    }

    @Transactional
    public ResourceResponse updateStatus(UUID id, UpdateResourceStatusRequest req) {
        User actor = requireActiveUser();
        Resource existing = findOrThrow(id);

        if (actor.role() == UserRole.DOMAIN_ADMIN) {
            if (!existing.domainId().equals(actor.domainId())) {
                throw new UnauthorizedActionException(
                        "Domain admins can only change status of resources in their own domain");
            }
        }

        Resource updated = new Resource(
                existing.id(),
                existing.domainId(),
                existing.resourceType(),
                existing.name(),
                existing.description(),
                existing.location(),
                existing.capacity(),
                req.status().name(), // store enum as String
                existing.metadata(),
                existing.createdBy(),
                existing.createdAt(),
                null);
        return toResponse(resourceRepository.save(updated));
    }

    @Transactional
    public void delete(UUID id) {
        User actor = requireActiveUser();
        Resource existing = findOrThrow(id);
        assertCanManageDomain(actor, existing.domainId());
        resourceRepository.deleteById(id);
    }

       // ── Helpers ───────────────────────────────────────────────────────────────

    private Resource findOrThrow(UUID id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }

    private User requireActiveUser() {
        User u = authService.getCurrentUser();
        if (u == null)
            throw new IllegalStateException("Not authenticated");
        return u;
    }

    /**
     * SUPER_ADMIN → any domain.
     * DOMAIN_ADMIN → only their own domain.
     * Others → denied.
     */
    private void assertCanManageDomain(User actor, UUID targetDomainId) {
        if (actor.role() == UserRole.SUPER_ADMIN)
            return;
        if (actor.role() == UserRole.DOMAIN_ADMIN
                && targetDomainId != null
                && targetDomainId.equals(actor.domainId()))
            return;
        throw new UnauthorizedActionException(
                "You do not have permission to manage resources in this domain");
    }

    private ResourceResponse toResponse(Resource r) {
        String domainName = domainRepository.findById(r.domainId())
                .map(Domain::name)
                .orElse(null);

        // Safe enum parsing — fall back to OTHER/ACTIVE if DB has unexpected value
        ResourceType type;
        try {
            type = ResourceType.valueOf(r.resourceType());
        } catch (IllegalArgumentException e) {
            type = ResourceType.OTHER;
        }

        ResourceStatus status;
        try {
            status = ResourceStatus.valueOf(r.status());
        } catch (IllegalArgumentException e) {
            status = ResourceStatus.ACTIVE;
        }

        return new ResourceResponse(
                r.id(),
                r.domainId(),
                domainName,
                type,
                r.name(),
                r.description(),
                r.location(),
                r.capacity(),
                status,
                r.metadata(),
                r.createdBy(),
                r.createdAt(),
                r.updatedAt());
    }
}