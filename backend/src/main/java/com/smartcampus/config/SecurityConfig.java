package com.smartcampus.config;

import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService oauth2UserService;
    private final UserRepository userRepository;

    public SecurityConfig(CustomOAuth2UserService oauth2UserService, UserRepository userRepository) {
        this.oauth2UserService = oauth2UserService;
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(requestHandler)
                .ignoringRequestMatchers("/api/auth/logout")
            )
            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
            .addFilterAfter(new UserStatusFilter(userRepository), CsrfCookieFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/static/**", "/*.png", "/*.ico", "/*.json").permitAll()
                .requestMatchers("/api/auth/status").permitAll()
                .requestMatchers("/api/auth/register/**").hasAuthority("STATUS_PENDING_PROFILE")
                
                // Domain management - Write actions are SUPER_ADMIN only
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/domains").hasRole("SUPER_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/domains/**").hasRole("SUPER_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/domains/**").hasRole("SUPER_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/domains/**").hasRole("SUPER_ADMIN")
                
                .requestMatchers("/api/admin/**").hasRole("SUPER_ADMIN")
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
                .authenticationEntryPoint((request, response, authException) -> {
                    if (request.getRequestURI().startsWith("/api/")) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                    } else {
                        response.sendRedirect("/oauth2/authorization/google");
                    }
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> 
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: " + accessDeniedException.getMessage())
                )
            );

        return http.build();
    }
}
