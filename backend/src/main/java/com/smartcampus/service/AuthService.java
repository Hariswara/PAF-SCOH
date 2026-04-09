package com.smartcampus.service;

import com.smartcampus.dto.NonStudentRegistrationRequest;
import com.smartcampus.dto.StudentRegistrationRequest;
import com.smartcampus.dto.UpdateProfileRequest;
import com.smartcampus.model.Domain;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.DomainRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.PasskeyAuthenticatedPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DomainRepository domainRepository;

    public AuthService(UserRepository userRepository, DomainRepository domainRepository) {
        this.userRepository = userRepository;
        this.domainRepository = domainRepository;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        if (auth.getPrincipal() instanceof OAuth2User principal) {
            String email = principal.getAttribute("email");
            return userRepository.findByEmail(email).orElse(null);
        }
        if (auth.getPrincipal() instanceof PasskeyAuthenticatedPrincipal principal) {
            return userRepository.findById(principal.userId()).orElse(null);
        }
        return null;
    }

    @Transactional
    public User registerStudent(StudentRegistrationRequest request) {
        User user = getCurrentUser();
        if (user == null || user.status() != UserStatus.PENDING_PROFILE) {
            throw new IllegalStateException("Only users with PENDING_PROFILE status can register");
        }

        User updated = new User(
            user.id(),
            user.googleId(),
            user.email(),
            request.fullName(),
            request.studentId(),
            request.department(),
            request.phone(),
            user.contactEmail(),
            user.gender(),
            user.profilePicture(),
            UserRole.STUDENT,
            UserStatus.ACTIVE,
            null,
            Instant.now(),
            user.createdAt(),
            null
        );

        return userRepository.save(updated);
    }

    @Transactional
    public User registerNonStudent(NonStudentRegistrationRequest request) {
        User user = getCurrentUser();
        if (user == null || user.status() != UserStatus.PENDING_PROFILE) {
            throw new IllegalStateException("Only users with PENDING_PROFILE status can register");
        }

        User updated = new User(
            user.id(),
            user.googleId(),
            user.email(),
            request.fullName(),
            null, null,
            request.phone(),
            user.contactEmail(),
            user.gender(),
            user.profilePicture(),
            null,
            UserStatus.PENDING_ACTIVATION,
            null,
            Instant.now(),
            user.createdAt(),
            null
        );

        return userRepository.save(updated);
    }

    @Transactional
    public User updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Not authenticated");
        }

        User updated = new User(
            user.id(),
            user.googleId(),
            user.email(),
            request.fullName(),
            user.studentId(),
            request.department() != null ? request.department() : user.department(),
            request.phone(),
            request.contactEmail(),
            request.gender(),
            user.profilePicture(),
            user.role(),
            user.status(),
            user.domainId(),
            user.lastLoginAt(),
            user.createdAt(),
            null
        );

        return userRepository.save(updated);
    }

    public String getDomainName(UUID domainId) {
        if (domainId == null) return null;
        return domainRepository.findById(domainId)
                .map(Domain::name)
                .orElse(null);
    }
}
