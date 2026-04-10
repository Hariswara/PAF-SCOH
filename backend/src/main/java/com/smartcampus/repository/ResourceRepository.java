package com.smartcampus.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;

@Repository
public interface ResourceRepository extends ListCrudRepository<Resource, UUID> {

    List<Resource> findByDomainIdOrderByCreatedAtDesc(UUID domainId);

    List<Resource> findByStatusOrderByCreatedAtDesc(ResourceStatus status);

    List<Resource> findByDomainIdAndStatusOrderByCreatedAtDesc(UUID domainId, ResourceStatus status);

    long countByDomainId(UUID domainId);

    List<Resource> findAllByOrderByCreatedAtDesc();
}