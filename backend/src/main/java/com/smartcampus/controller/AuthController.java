package com.smartcampus.controller;

import com.smartcampus.dto.NonStudentRegistrationRequest;
import com.smartcampus.dto.StudentRegistrationRequest;
import com.smartcampus.dto.UpdateProfileRequest;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        User user = authService.getCurrentUser();
        if (user == null) {
            return Map.of("authenticated", false);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", true);
        response.put("user", user);
        String domainName = authService.getDomainName(user.domainId());
        if (domainName != null) {
            response.put("domainName", domainName);
        }
        return response;
    }

    @PostMapping("/register/student")
    public User registerStudent(@Valid @RequestBody StudentRegistrationRequest request) {
        return authService.registerStudent(request);
    }

    @PostMapping("/register/non-student")
    public User registerNonStudent(@Valid @RequestBody NonStudentRegistrationRequest request) {
        return authService.registerNonStudent(request);
    }

    @PutMapping("/profile")
    public User updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(request);
    }
}
