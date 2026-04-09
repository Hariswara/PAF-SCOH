package com.smartcampus.config;

import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class UserStatusFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public UserStatusFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.getPrincipal() instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            
            if (email != null) {
                userRepository.findByEmail(email).ifPresent(user -> {
                    if (user.status() == UserStatus.SUSPENDED) {
                        SecurityContextHolder.clearContext();
                        request.getSession().invalidate();
                        try {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Account is suspended");
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    }
                });
                
                if (response.isCommitted()) {
                    return;
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
