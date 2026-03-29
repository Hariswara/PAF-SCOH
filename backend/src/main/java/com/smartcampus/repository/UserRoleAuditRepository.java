package com.smartcampus.repository;

import com.smartcampus.model.UserRoleAudit;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRoleAuditRepository extends ListCrudRepository<UserRoleAudit, UUID> {
    List<UserRoleAudit> findByUserIdOrderByChangedAtDesc(UUID userId);
    List<UserRoleAudit> findAllByOrderByChangedAtDesc();
}
