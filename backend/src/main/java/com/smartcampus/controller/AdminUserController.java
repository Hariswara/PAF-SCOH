package com.smartcampus.controller;

import com.smartcampus.dto.RolePromotionRequest;
import com.smartcampus.model.User;
import com.smartcampus.model.UserStatus;
import com.smartcampus.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminService adminService;

    public AdminUserController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public List<User> listUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable UUID id) {
        return adminService.getUserById(id);
    }

    @PutMapping("/{id}/role")
    public User promoteUser(@PathVariable UUID id, @Valid @RequestBody RolePromotionRequest request) {
        return adminService.promoteUser(id, request);
    }

    @PutMapping("/{id}/status")
    public User updateUserStatus(@PathVariable UUID id, @RequestParam UserStatus status) {
        return adminService.updateUserStatus(id, status);
    }

    @GetMapping("/audit-logs")
    public List<com.smartcampus.dto.AuditLogResponse> getAllAuditLogs() {
        return adminService.getAllAuditLogs();
    }

    @GetMapping("/{id}/audit")
    public List<com.smartcampus.dto.AuditLogResponse> getUserAuditLogs(@PathVariable UUID id) {
        return adminService.getUserAuditLogs(id);
    }

    @GetMapping("/dashboard/stats")
    public com.smartcampus.dto.DashboardStatsResponse getDashboardStats() {
        return adminService.getDashboardStats();
    }

    @GetMapping("/pending-activations")
    public List<User> getPendingActivations() {
        return adminService.getPendingActivations();
    }
}
