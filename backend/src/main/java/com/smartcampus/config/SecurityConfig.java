package com.smartcampus.config;

import com.smartcampus.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

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
                .ignoringRequestMatchers("/api/auth/logout") // Logout typically needs CSRF but we'll start simple
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/static/**", "/*.png", "/*.ico", "/*.json").permitAll()
                .requestMatchers("/api/auth/status").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(oauth2UserService))
                .defaultSuccessUrl("http://localhost:5173/dashboard", true)
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutRequestMatcher(new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/auth/logout")) // Defaults to any method if not specified
                .logoutSuccessUrl("http://localhost:5173/login")
                .deleteCookies("JSESSIONID")
                .invalidateHttpSession(true)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new Http403ForbiddenEntryPoint())
            );

        return http.build();
    }
}
