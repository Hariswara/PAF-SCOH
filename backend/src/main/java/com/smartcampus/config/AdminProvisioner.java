package com.smartcampus.config;

import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminProvisioner {

    private static final Logger log = LoggerFactory.getLogger(AdminProvisioner.class);

    @Value("${smartcampus.auth.initial-admin-email}")
    private String initialAdminEmail;

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail(initialAdminEmail).isEmpty()) {
                log.info("Provisioning initial SUPER_ADMIN user: {}", initialAdminEmail);
                User admin = new User(
                    null,
                    "INITIAL_ADMIN_PLACEHOLDER", // Will be updated on first Google login
                    initialAdminEmail,
                    "System Administrator",
                    null, null, null, null,
                    UserRole.SUPER_ADMIN,
                    UserStatus.ACTIVE,
                    null, null, null, null
                );
                userRepository.save(admin);
                log.info("Initial SUPER_ADMIN provisioned successfully.");
            } else {
                log.info("Initial admin user already exists.");
            }
        };
    }
}
