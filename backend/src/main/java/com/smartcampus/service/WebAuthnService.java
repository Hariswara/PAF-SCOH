package com.smartcampus.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.smartcampus.config.WebAuthnConfig;
import com.smartcampus.dto.PasskeyCredentialDto;
import com.smartcampus.model.PasskeyCredential;
import com.smartcampus.model.User;
import com.smartcampus.model.WebAuthnChallenge;
import com.smartcampus.repository.PasskeyCredentialRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.WebAuthnChallengeRepository;
import com.smartcampus.security.PasskeyAuthenticatedPrincipal;
import com.smartcampus.security.PasskeyAuthenticationToken;
import com.yubico.webauthn.*;
import com.yubico.webauthn.data.*;
import com.yubico.webauthn.exception.AssertionFailedException;
import com.yubico.webauthn.exception.RegistrationFailedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class WebAuthnService {

    private static final int CHALLENGE_TTL_SECONDS = 60;

    private final RelyingParty relyingParty;
    private final PasskeyCredentialRepository passkeyRepo;
    private final WebAuthnChallengeRepository challengeRepo;
    private final UserRepository userRepository;
    private final HttpSessionSecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public WebAuthnService(
            RelyingParty relyingParty,
            PasskeyCredentialRepository passkeyRepo,
            WebAuthnChallengeRepository challengeRepo,
            UserRepository userRepository
    ) {
        this.relyingParty = relyingParty;
        this.passkeyRepo = passkeyRepo;
        this.challengeRepo = challengeRepo;
        this.userRepository = userRepository;
    }

    // ─── Registration ────────────────────────────────────────────────────────

    @Transactional
    public String startRegistration(User user, String displayName) throws JsonProcessingException {
        // Clean up expired challenges
        challengeRepo.deleteByExpiresAtBefore(Instant.now());

        ByteArray userHandle = WebAuthnConfig.uuidToByteArray(user.id());

        StartRegistrationOptions options = StartRegistrationOptions.builder()
                .user(UserIdentity.builder()
                        .name(user.email())
                        .displayName(displayName != null ? displayName : user.fullName())
                        .id(userHandle)
                        .build())
                .authenticatorSelection(AuthenticatorSelectionCriteria.builder()
                        .residentKey(ResidentKeyRequirement.REQUIRED)
                        .userVerification(UserVerificationRequirement.PREFERRED)
                        .authenticatorAttachment(AuthenticatorAttachment.PLATFORM)
                        .build())
                .build();

        PublicKeyCredentialCreationOptions creationOptions = relyingParty.startRegistration(options);

        // Persist challenge + full options JSON (needed for finishRegistration)
        String challengeBase64 = creationOptions.getChallenge().getBase64Url();
        String optionsJson = creationOptions.toJson();

        WebAuthnChallenge challenge = new WebAuthnChallenge(
                null,
                challengeBase64,
                user.id(),
                "REGISTRATION",
                optionsJson,
                Instant.now(),
                Instant.now().plusSeconds(CHALLENGE_TTL_SECONDS)
        );
        challengeRepo.save(challenge);

        return creationOptions.toCredentialsCreateJson();
    }

    @Transactional
    public PasskeyCredentialDto finishRegistration(User user, String credentialJson, String displayName)
            throws IOException, RegistrationFailedException {

        PublicKeyCredential<AuthenticatorAttestationResponse, ClientRegistrationExtensionOutputs> pkc =
                PublicKeyCredential.parseRegistrationResponseJson(credentialJson);

        String challengeBase64 = pkc.getResponse().getClientData().getChallenge().getBase64Url();
        WebAuthnChallenge stored = challengeRepo.findByChallenge(challengeBase64)
                .orElseThrow(() -> new IllegalStateException("Challenge not found or already used"));

        try {
            if (stored.isExpired()) {
                throw new IllegalStateException("Challenge has expired");
            }
            if (!user.id().equals(stored.userId())) {
                throw new IllegalStateException("Challenge does not belong to this user");
            }

            // Deserialize the original options from the stored JSON
            PublicKeyCredentialCreationOptions originalOptions =
                    PublicKeyCredentialCreationOptions.fromJson(stored.requestJson());

            FinishRegistrationOptions finishOptions = FinishRegistrationOptions.builder()
                    .request(originalOptions)
                    .response(pkc)
                    .build();

            RegistrationResult result = relyingParty.finishRegistration(finishOptions);

            // Build transports JSON string
            Set<AuthenticatorTransport> transportSet = pkc.getResponse().getTransports();
            String transports;
            if (transportSet == null || transportSet.isEmpty()) {
                transports = "[]";
            } else {
                List<String> transportIds = transportSet.stream()
                        .map(AuthenticatorTransport::getId)
                        .toList();
                transports = "[\"" + String.join("\",\"", transportIds) + "\"]";
            }

            // Extract AAGUID (optional — some authenticators zero it for privacy)
            UUID aaguid = null;
            try {
                byte[] aaguidBytes = result.getAaguid().getBytes();
                if (aaguidBytes.length == 16) {
                    aaguid = WebAuthnConfig.byteArrayToUuid(result.getAaguid());
                }
            } catch (Exception ignored) {
                // AAGUID is optional; ignore failures
            }

            byte[] credId = result.getKeyId().getId().getBytes();
            String credIdBase64 = result.getKeyId().getId().getBase64Url();
            byte[] publicKeyCose = result.getPublicKeyCose().getBytes();
            String resolvedDisplayName = (displayName != null && !displayName.isBlank())
                    ? displayName : user.fullName() + "'s Passkey";

            PasskeyCredential credential = PasskeyCredential.createNew(
                    user.id(), credId, credIdBase64, publicKeyCose,
                    result.getSignatureCount(), resolvedDisplayName, aaguid, transports
            );
            PasskeyCredential saved = passkeyRepo.save(credential);
            return PasskeyCredentialDto.from(saved);

        } finally {
            challengeRepo.deleteById(stored.challengeId());
        }
    }

    // ─── Authentication ───────────────────────────────────────────────────────

    @Transactional
    public String startAuthentication() throws JsonProcessingException {
        challengeRepo.deleteByExpiresAtBefore(Instant.now());

        StartAssertionOptions options = StartAssertionOptions.builder()
                .userVerification(UserVerificationRequirement.PREFERRED)
                .build();

        AssertionRequest assertionRequest = relyingParty.startAssertion(options);
        String challengeBase64 = assertionRequest.getPublicKeyCredentialRequestOptions()
                .getChallenge().getBase64Url();

        WebAuthnChallenge challenge = new WebAuthnChallenge(
                null,
                challengeBase64,
                null,           // userId unknown until assertion is complete
                "AUTHENTICATION",
                null,           // requestJson not needed for authentication
                Instant.now(),
                Instant.now().plusSeconds(CHALLENGE_TTL_SECONDS)
        );
        challengeRepo.save(challenge);

        return assertionRequest.toCredentialsGetJson();
    }

    @Transactional
    public User finishAuthentication(
            String credentialJson,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException, AssertionFailedException {

        PublicKeyCredential<AuthenticatorAssertionResponse, ClientAssertionExtensionOutputs> pkc =
                PublicKeyCredential.parseAssertionResponseJson(credentialJson);

        String challengeBase64 = pkc.getResponse().getClientData().getChallenge().getBase64Url();
        WebAuthnChallenge stored = challengeRepo.findByChallenge(challengeBase64)
                .orElseThrow(() -> new IllegalStateException("Challenge not found or already used"));

        try {
            if (stored.isExpired()) {
                throw new IllegalStateException("Challenge has expired");
            }

            byte[] challengeBytes = Base64.getUrlDecoder().decode(challengeBase64);

            AssertionRequest assertionRequest = AssertionRequest.builder()
                    .publicKeyCredentialRequestOptions(
                            PublicKeyCredentialRequestOptions.builder()
                                    .challenge(new ByteArray(challengeBytes))
                                    .build())
                    .build();

            FinishAssertionOptions finishOptions = FinishAssertionOptions.builder()
                    .request(assertionRequest)
                    .response(pkc)
                    .build();

            AssertionResult result = relyingParty.finishAssertion(finishOptions);

            if (!result.isSuccess()) {
                throw new AssertionFailedException("Assertion verification failed");
            }

            // Update signature count and last used timestamp
            String credIdBase64 = result.getCredentialId().getBase64Url();
            PasskeyCredential storedCred = passkeyRepo.findByCredentialIdBase64(credIdBase64)
                    .orElseThrow(() -> new IllegalStateException("Credential not found"));

            PasskeyCredential updatedCred = new PasskeyCredential(
                    storedCred.id(), storedCred.userId(), storedCred.credentialId(),
                    storedCred.credentialIdBase64(), storedCred.publicKeyCose(),
                    result.getSignatureCount(), storedCred.displayName(), storedCred.aaguid(),
                    storedCred.transports(), storedCred.createdAt(), Instant.now()
            );
            passkeyRepo.save(updatedCred);

            // Load user
            User user = userRepository.findById(storedCred.userId())
                    .orElseThrow(() -> new IllegalStateException("User not found"));

            // Update last login
            User withLastLogin = new User(
                    user.id(), user.googleId(), user.email(), user.fullName(),
                    user.studentId(), user.department(), user.phone(), user.profilePicture(),
                    user.role(), user.status(), user.domainId(),
                    Instant.now(), user.createdAt(), null
            );
            userRepository.save(withLastLogin);

            // Build Spring Security authorities (same pattern as CustomOAuth2UserService)
            List<GrantedAuthority> authorities = new ArrayList<>();
            if (user.role() != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + user.role().name()));
            }
            if (user.status() != null) {
                authorities.add(new SimpleGrantedAuthority("STATUS_" + user.status().name()));
            }

            // Set and persist security context in HTTP session
            PasskeyAuthenticatedPrincipal principal = new PasskeyAuthenticatedPrincipal(user.id(), user.email());
            PasskeyAuthenticationToken auth = new PasskeyAuthenticationToken(principal, authorities);
            SecurityContext context = new SecurityContextImpl(auth);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            return withLastLogin;

        } finally {
            challengeRepo.deleteById(stored.challengeId());
        }
    }

    // ─── Credential Management ────────────────────────────────────────────────

    public List<PasskeyCredentialDto> listCredentials(UUID userId) {
        return passkeyRepo.findByUserId(userId)
                .stream()
                .map(PasskeyCredentialDto::from)
                .toList();
    }

    @Transactional
    public void deleteCredential(UUID credentialId, UUID userId) {
        passkeyRepo.deleteByIdAndUserId(credentialId, userId);
    }
}
