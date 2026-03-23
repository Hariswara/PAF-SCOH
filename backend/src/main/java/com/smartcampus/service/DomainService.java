package com.smartcampus.service;

import com.smartcampus.dto.DomainRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Domain;
import com.smartcampus.model.User;
import com.smartcampus.repository.DomainRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class DomainService {

    private final DomainRepository domainRepository;
    private final AuthService authService;

    public DomainService(DomainRepository domainRepository, AuthService authService) {
        this.domainRepository = domainRepository;
        this.authService = authService;
    }

    public List<Domain> getAllDomains() {
        return domainRepository.findAll();
    }

    public Domain getDomainById(UUID id) {
        return domainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found with id: " + id));
    }

    @Transactional
    public Domain createDomain(DomainRequest request) {
        User currentUser = authService.getCurrentUser();
        
        Domain domain = new Domain(
            null,
            request.name(),
            request.description(),
            true,
            currentUser != null ? currentUser.id() : null,
            Instant.now(),
            Instant.now()
        );
        
        return domainRepository.save(domain);
    }

    @Transactional
    public Domain updateDomain(UUID id, DomainRequest request) {
        Domain existing = getDomainById(id);
        
        Domain updated = new Domain(
            existing.id(),
            request.name(),
            request.description(),
            existing.isActive(),
            existing.createdBy(),
            existing.createdAt(),
            Instant.now()
        );
        
        return domainRepository.save(updated);
    }

    @Transactional
    public Domain toggleDomainStatus(UUID id) {
        Domain existing = getDomainById(id);
        
        Domain updated = new Domain(
            existing.id(),
            existing.name(),
            existing.description(),
            !existing.isActive(),
            existing.createdBy(),
            existing.createdAt(),
            Instant.now()
        );
        
        return domainRepository.save(updated);
    }
}
