package com.smartcampus.service;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    // Update existing user with latest info from Google
                    User updated = new User(
                        existingUser.id(),
                        googleId,
                        email,
                        name,
                        existingUser.studentId(),
                        existingUser.department(),
                        existingUser.phone(),
                        existingUser.contactEmail(),
                        existingUser.gender(),
                        picture,
                        existingUser.role(),
                        existingUser.status(),
                        existingUser.domainId(),
                        Instant.now(),
                        existingUser.createdAt(),
                        null
                    );
                    return userRepository.save(updated);
                })
                .orElseGet(() -> {
                    // Create new user if not found
                    User newUser = User.createNew(googleId, email, name, picture);
                    return userRepository.save(newUser);
                });

        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.role() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.role().name()));
        }
        if (user.status() != null) {
            authorities.add(new SimpleGrantedAuthority("STATUS_" + user.status().name()));
        }

        return new DefaultOAuth2User(authorities, oAuth2User.getAttributes(), "email");
    }
}
