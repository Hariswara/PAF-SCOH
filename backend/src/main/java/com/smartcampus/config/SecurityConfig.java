package com.smartcampus.config;

import com.smartcampus.service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService oauth2UserService;

    public SecurityConfig(CustomOAuth2UserService oauth2UserService) {
        this.oauth2UserService = oauth2UserService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                .ignoringRequestMatchers("/api/auth/logout")
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/", "/index.html", "/static/**", "/*.png", "/*.ico", "/*.json").permitAll()
                .requestMatchers("/api/auth/status").permitAll()
                
                // Registration endpoints - only for users needing profile completion
                .requestMatchers("/api/auth/register/**").hasAuthority("STATUS_PENDING_PROFILE")
                
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("SUPER_ADMIN")
                
                // All other API functional endpoints require ACTIVE status
                .requestMatchers("/api/**").hasAuthority("STATUS_ACTIVE")
                
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(oauth2UserService))
                .defaultSuccessUrl("http://localhost:5173/dashboard", true)
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutRequestMatcher(new AntPathRequestMatcher("/api/auth/logout"))
                .logoutSuccessUrl("http://localhost:5173/login")
                .deleteCookies("JSESSIONID")
                .invalidateHttpSession(true)
            )
            .exceptionHandling(ex -> ex
                // For API requests, return 401 instead of redirecting to login page
                .defaultAuthenticationEntryPointFor(
                    (request, response, authException) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED),
                    new AntPathRequestMatcher("/api/**")
                )
                .accessDeniedHandler((request, response, accessDeniedException) -> 
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: " + accessDeniedException.getMessage())
                )
            );

        return http.build();
    }
}
