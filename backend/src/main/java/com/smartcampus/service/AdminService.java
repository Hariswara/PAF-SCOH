package com.smartcampus.service;

import com.smartcampus.dto.RolePromotionRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.UserRoleAudit;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.UserRoleAuditRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final UserRoleAuditRepository auditRepository;
    private final AuthService authService;

    public AdminService(UserRepository userRepository, UserRoleAuditRepository auditRepository, AuthService authService) {
        this.userRepository = userRepository;
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

        // 1. Create Audit Log
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

        // 2. Update User
        User updated = new User(
            targetUser.id(),
            targetUser.googleId(),
            targetUser.email(),
            targetUser.fullName(),
            targetUser.studentId(),
            targetUser.department(),
            targetUser.phone(),
            targetUser.profilePicture(),
            request.newRole(),
            UserStatus.ACTIVE, // Activating user upon role assignment
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
}
