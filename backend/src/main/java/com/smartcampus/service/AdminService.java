package com.smartcampus.service;

import com.smartcampus.dto.AuditLogResponse;
import com.smartcampus.dto.DashboardStatsResponse;
import com.smartcampus.dto.RolePromotionRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.DomainRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.UserRoleAuditRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DomainRepository domainRepository;
    private final UserRoleAuditRepository auditRepository;
    private final AuthService authService;

    public AdminService(UserRepository userRepository, DomainRepository domainRepository, 
                        UserRoleAuditRepository auditRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.domainRepository = domainRepository;
        this.auditRepository = auditRepository;
        this.authService = authService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public User promoteUser(UUID id, RolePromotionRequest request) {
        User targetUser = getUserById(id);
        User admin = authService.getCurrentUser();

        if (targetUser.role() == UserRole.SUPER_ADMIN) {
            throw new IllegalStateException("SUPER_ADMIN role cannot be modified");
        }

        UserRoleAudit audit = new UserRoleAudit(
            null,
            targetUser.id(),
            admin.id(),
            targetUser.role(),
            request.newRole(),
            targetUser.domainId(),
            request.domainId(),
            request.reason(),
            Instant.now()
        );
        auditRepository.save(audit);

        User updated = new User(
            targetUser.id(),
            targetUser.googleId(),
            targetUser.email(),
            targetUser.fullName(),
            targetUser.studentId(),
            targetUser.department(),
            targetUser.phone(),
            targetUser.contactEmail(),
            targetUser.gender(),
            targetUser.profilePicture(),
            request.newRole(),
            UserStatus.ACTIVE,
            request.domainId(),
            targetUser.lastLoginAt(),
            targetUser.createdAt(),
            null
        );

        return userRepository.save(updated);
    }

    @Transactional
    public User updateUserStatus(UUID id, UserStatus newStatus) {
        User targetUser = getUserById(id);
        if (targetUser.role() == UserRole.SUPER_ADMIN) {
            throw new IllegalStateException("SUPER_ADMIN status cannot be modified");
        }

        User updated = new User(
            targetUser.id(),
            targetUser.googleId(),
            targetUser.email(),
            targetUser.fullName(),
            targetUser.studentId(),
            targetUser.department(),
            targetUser.phone(),
            targetUser.contactEmail(),
            targetUser.gender(),
            targetUser.profilePicture(),
            targetUser.role(),
            newStatus,
            targetUser.domainId(),
            targetUser.lastLoginAt(),
            targetUser.createdAt(),
            null
        );

        return userRepository.save(updated);
    }

    public List<AuditLogResponse> getAllAuditLogs() {
        return mapLogsToResponses(auditRepository.findAllByOrderByChangedAtDesc());
    }

    public List<AuditLogResponse> getUserAuditLogs(UUID userId) {
        return mapLogsToResponses(auditRepository.findByUserIdOrderByChangedAtDesc(userId));
    }

    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeDomains = domainRepository.countByIsActive(true);
        long pendingActivations = userRepository.countByStatus(UserStatus.PENDING_ACTIVATION);
        long systemAlerts = userRepository.countByStatus(UserStatus.SUSPENDED);

        return new DashboardStatsResponse(totalUsers, activeDomains, pendingActivations, systemAlerts);
    }

    public List<User> getPendingActivations() {
        return userRepository.findAll().stream()
                .filter(u -> u.status() == UserStatus.PENDING_ACTIVATION)
                .collect(Collectors.toList());
    }

    /**
     * Optimized batch mapper to solve the N+1 problem.
     */
    private List<AuditLogResponse> mapLogsToResponses(List<UserRoleAudit> logs) {
        if (logs.isEmpty()) return Collections.emptyList();

        // 1. Collect all unique User and Domain IDs
        Set<UUID> userIds = logs.stream()
                .flatMap(log -> Stream.of(log.userId(), log.changedBy()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> domainIds = logs.stream()
                .flatMap(log -> Stream.of(log.oldDomainId(), log.newDomainId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 2. Fetch all required entities in single queries
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::id, u -> u));

        Map<UUID, Domain> domainMap = domainRepository.findAllById(domainIds).stream()
                .collect(Collectors.toMap(Domain::id, d -> d));

        // 3. Map to DTO using the in-memory maps
        return logs.stream().map(log -> {
            User target = userMap.get(log.userId());
            User admin = userMap.get(log.changedBy());
            Domain oldD = domainMap.get(log.oldDomainId());
            Domain newD = domainMap.get(log.newDomainId());

            return new AuditLogResponse(
                log.id(),
                log.userId(),
                target != null ? target.fullName() : "Unknown User",
                target != null ? target.email() : "Unknown Email",
                log.changedBy(),
                admin != null ? admin.fullName() : "System Admin",
                log.oldRole(),
                log.newRole(),
                log.oldDomainId(),
                oldD != null ? oldD.name() : null,
                log.newDomainId(),
                newD != null ? newD.name() : null,
                log.reason(),
                log.changedAt()
            );
        }).collect(Collectors.toList());
    }
}
