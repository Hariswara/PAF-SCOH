package com.smartcampus.security;

import java.security.Principal;
import java.util.UUID;

public record PasskeyAuthenticatedPrincipal(UUID userId, String email) implements Principal {

    @Override
    public String getName() {
        return email;
    }
}
