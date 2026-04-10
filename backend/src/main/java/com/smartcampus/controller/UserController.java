package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * General user queries accessible to any active user.
 * (Admin-specific user management stays in AdminUserController under
 * /api/admin/users)
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * GET /api/users/technicians
     * Returns all ACTIVE technicians — used by DOMAIN_ADMIN and SUPER_ADMIN.
     */
    @GetMapping("/technicians")
    public List<User> getActiveTechnicians() {
        return userRepository.findByRoleAndStatus(UserRole.TECHNICIAN, UserStatus.ACTIVE);
    }
}