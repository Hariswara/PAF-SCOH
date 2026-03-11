package com.smartcampus.controller;

import com.smartcampus.dto.NonStudentRegistrationRequest;
import com.smartcampus.dto.StudentRegistrationRequest;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Map.of("authenticated", false);
        }

        User user = authService.getCurrentUser();
        if (user == null) {
            return Map.of("authenticated", false);
        }

        return Map.of(
                "authenticated", true,
                "user", user
        );
    }

    @PostMapping("/register/student")
    public User registerStudent(@Valid @RequestBody StudentRegistrationRequest request) {
        return authService.registerStudent(request);
    }

    @PostMapping("/register/non-student")
    public User registerNonStudent(@Valid @RequestBody NonStudentRegistrationRequest request) {
        return authService.registerNonStudent(request);
    }
}
