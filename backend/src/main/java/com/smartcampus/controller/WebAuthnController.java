package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.WebAuthnService;
import com.yubico.webauthn.exception.AssertionFailedException;
import com.yubico.webauthn.exception.RegistrationFailedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/passkey")
public class WebAuthnController {

    private final WebAuthnService webAuthnService;
    private final AuthService authService;

    public WebAuthnController(WebAuthnService webAuthnService, AuthService authService) {
        this.webAuthnService = webAuthnService;
        this.authService = authService;
    }

    // ─── Registration ─────────────────────────────────────────────────────────

    @PostMapping("/register/start")
    public ResponseEntity<String> registrationStart(
            @RequestBody(required = false) PasskeyRegistrationStartRequest body
    ) throws Exception {
        User user = requireActiveUser();
        String displayName = (body != null) ? body.displayName() : null;
        String optionsJson = webAuthnService.startRegistration(user, displayName);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(optionsJson);
    }

    @PostMapping("/register/finish")
    public PasskeyCredentialDto registrationFinish(
            @Valid @RequestBody PasskeyRegistrationFinishRequest body,
            @RequestParam(required = false) String displayName
    ) throws IOException, RegistrationFailedException {
        User user = requireActiveUser();
        return webAuthnService.finishRegistration(user, body.credentialJson(), displayName);
    }

    // ─── Authentication ───────────────────────────────────────────────────────

    @PostMapping("/login/start")
    public ResponseEntity<String> loginStart() throws Exception {
        String optionsJson = webAuthnService.startAuthentication();
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(optionsJson);
    }

    @PostMapping("/login/finish")
    public Map<String, Object> loginFinish(
            @Valid @RequestBody PasskeyLoginFinishRequest body,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException, AssertionFailedException {
        User user = webAuthnService.finishAuthentication(body.credentialJson(), request, response);
        return Map.of("authenticated", true, "user", user);
    }

    // ─── Credential Management ────────────────────────────────────────────────

    @GetMapping("/credentials")
    public List<PasskeyCredentialDto> listCredentials() {
        User user = requireActiveUser();
        return webAuthnService.listCredentials(user.id());
    }

    @DeleteMapping("/credentials/{credentialId}")
    public ResponseEntity<Void> deleteCredential(@PathVariable UUID credentialId) {
        User user = requireActiveUser();
        webAuthnService.deleteCredential(credentialId, user.id());
        return ResponseEntity.noContent().build();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User requireActiveUser() {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Not authenticated");
        }
        return user;
    }
}
