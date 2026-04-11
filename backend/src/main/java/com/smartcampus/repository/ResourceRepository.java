package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends ListCrudRepository<Resource, UUID> {

    List<Resource> findByDomainIdOrderByCreatedAtDesc(UUID domainId);

    List<Resource> findByStatusOrderByCreatedAtDesc(ResourceStatus status);

    List<Resource> findByDomainIdAndStatusOrderByCreatedAtDesc(UUID domainId, ResourceStatus status);

    long countByDomainId(UUID domainId);

    // NOTE: Search filtering is done in ResourceService.search() using Java streams
    // to avoid the NULL-in-CONCAT bug with Spring Data JDBC @Query on PostgreSQL.
    List<Resource> findAllByOrderByCreatedAtDesc();
}