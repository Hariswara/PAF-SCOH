package com.smartcampus.controller;

import com.smartcampus.dto.DomainRequest;
import com.smartcampus.model.Domain;
import com.smartcampus.service.DomainService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/domains")
public class DomainController {

    private final DomainService domainService;

    public DomainController(DomainService domainService) {
        this.domainService = domainService;
    }

    @GetMapping
    public List<Domain> getAllDomains() {
        return domainService.getAllDomains();
    }

    @GetMapping("/{id}")
    public Domain getDomain(@PathVariable UUID id) {
        return domainService.getDomainById(id);
    }

    @PostMapping
    public Domain createDomain(@Valid @RequestBody DomainRequest request) {
        return domainService.createDomain(request);
    }

    @PutMapping("/{id}")
    public Domain updateDomain(@PathVariable UUID id, @Valid @RequestBody DomainRequest request) {
        return domainService.updateDomain(id, request);
    }

    @PatchMapping("/{id}/toggle-status")
    public Domain toggleStatus(@PathVariable UUID id) {
        return domainService.toggleDomainStatus(id);
    }
}
