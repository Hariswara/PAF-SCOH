package com.smartcampus.repository;

import com.smartcampus.model.Domain;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DomainRepository extends ListCrudRepository<Domain, UUID> {
    long countByIsActive(boolean isActive);
}
