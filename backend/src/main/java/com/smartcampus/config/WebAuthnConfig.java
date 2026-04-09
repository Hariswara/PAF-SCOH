package com.smartcampus.config;

import com.smartcampus.model.PasskeyCredential;
import com.smartcampus.model.User;
import com.smartcampus.repository.PasskeyCredentialRepository;
import com.smartcampus.repository.UserRepository;
import com.yubico.webauthn.CredentialRepository;
import com.yubico.webauthn.RegisteredCredential;
import com.yubico.webauthn.RelyingParty;
import com.yubico.webauthn.data.ByteArray;
import com.yubico.webauthn.data.RelyingPartyIdentity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.util.*;

@Configuration
public class WebAuthnConfig {

    @Value("${smartcampus.webauthn.rp-id:localhost}")
    private String rpId;

    @Value("${smartcampus.webauthn.rp-name:Smart Campus Hub}")
    private String rpName;

    @Value("${smartcampus.webauthn.rp-origin:http://localhost:5173}")
    private String rpOrigin;

    @Bean
    public RelyingParty relyingParty(SmartCampusCredentialRepository credentialRepository) {
        return RelyingParty.builder()
                .identity(RelyingPartyIdentity.builder()
                        .id(rpId)
                        .name(rpName)
                        .build())
                .credentialRepository(credentialRepository)
                .origins(Set.of(rpOrigin))
                .build();
    }

    /**
     * Converts a UUID to a ByteArray (user handle) consistently using big-endian bytes.
     */
    public static ByteArray uuidToByteArray(UUID uuid) {
        ByteBuffer buf = ByteBuffer.allocate(16);
        buf.putLong(uuid.getMostSignificantBits());
        buf.putLong(uuid.getLeastSignificantBits());
        return new ByteArray(buf.array());
    }

    /**
     * Converts a ByteArray user handle back to a UUID.
     */
    public static UUID byteArrayToUuid(ByteArray bytes) {
        ByteBuffer buf = ByteBuffer.wrap(bytes.getBytes());
        long msb = buf.getLong();
        long lsb = buf.getLong();
        return new UUID(msb, lsb);
    }

    @Component
    public static class SmartCampusCredentialRepository implements CredentialRepository {

        private final PasskeyCredentialRepository passkeyRepo;
        private final UserRepository userRepository;

        public SmartCampusCredentialRepository(
                PasskeyCredentialRepository passkeyRepo,
                UserRepository userRepository
        ) {
            this.passkeyRepo = passkeyRepo;
            this.userRepository = userRepository;
        }

        @Override
        public Set<com.yubico.webauthn.data.PublicKeyCredentialDescriptor> getCredentialIdsForUsername(String username) {
            return userRepository.findByEmail(username)
                    .map(user -> {
                        List<PasskeyCredential> creds = passkeyRepo.findByUserId(user.id());
                        Set<com.yubico.webauthn.data.PublicKeyCredentialDescriptor> result = new HashSet<>();
                        for (PasskeyCredential c : creds) {
                            result.add(com.yubico.webauthn.data.PublicKeyCredentialDescriptor.builder()
                                    .id(new ByteArray(c.credentialId()))
                                    .build());
                        }
                        return result;
                    })
                    .orElse(Collections.emptySet());
        }

        @Override
        public Optional<ByteArray> getUserHandleForUsername(String username) {
            return userRepository.findByEmail(username)
                    .map(user -> uuidToByteArray(user.id()));
        }

        @Override
        public Optional<String> getUsernameForUserHandle(ByteArray userHandle) {
            try {
                UUID userId = byteArrayToUuid(userHandle);
                return userRepository.findById(userId)
                        .map(User::email);
            } catch (Exception e) {
                return Optional.empty();
            }
        }

        @Override
        public Optional<RegisteredCredential> lookup(ByteArray credentialId, ByteArray userHandle) {
            String base64 = credentialId.getBase64Url();
            return passkeyRepo.findByCredentialIdBase64(base64)
                    .map(c -> RegisteredCredential.builder()
                            .credentialId(new ByteArray(c.credentialId()))
                            .userHandle(uuidToByteArray(c.userId()))
                            .publicKeyCose(new ByteArray(c.publicKeyCose()))
                            .signatureCount(c.signatureCount())
                            .build());
        }

        @Override
        public Set<RegisteredCredential> lookupAll(ByteArray credentialId) {
            String base64 = credentialId.getBase64Url();
            return passkeyRepo.findByCredentialIdBase64(base64)
                    .map(c -> {
                        RegisteredCredential rc = RegisteredCredential.builder()
                                .credentialId(new ByteArray(c.credentialId()))
                                .userHandle(uuidToByteArray(c.userId()))
                                .publicKeyCose(new ByteArray(c.publicKeyCose()))
                                .signatureCount(c.signatureCount())
                                .build();
                        return Collections.singleton(rc);
                    })
                    .orElse(Collections.emptySet());
        }
    }
}
