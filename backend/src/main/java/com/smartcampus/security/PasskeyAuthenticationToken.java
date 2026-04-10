package com.smartcampus.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class PasskeyAuthenticationToken extends AbstractAuthenticationToken {

    private final PasskeyAuthenticatedPrincipal principal;

    public PasskeyAuthenticationToken(
            PasskeyAuthenticatedPrincipal principal,
            Collection<? extends GrantedAuthority> authorities
    ) {
        super(authorities);
        this.principal = principal;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public PasskeyAuthenticatedPrincipal getPrincipal() {
        return principal;
    }
}
