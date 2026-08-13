package com.sportzone.config;

import com.sportzone.entity.User;
import com.sportzone.entity.UserRole;
import com.sportzone.entity.UserStatus;
import com.sportzone.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Configuration
public class AppConfig {

    private final UserRepository userRepository;

    public AppConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public CommandLineRunner initUsers(PasswordEncoder passwordEncoder) {
        return args -> {
            // Guarantee admin@sportzone.com exists with password123
            userRepository.findByEmail("admin@sportzone.com").ifPresentOrElse(
                admin -> {
                    admin.setPasswordHash(passwordEncoder.encode("password123"));
                    userRepository.save(admin);
                },
                () -> userRepository.save(User.builder()
                        .id(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                        .email("admin@sportzone.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .firstName("Admin")
                        .lastName("SportZone")
                        .role(UserRole.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .build())
            );

            // Guarantee user@sportzone.com exists with password123
            userRepository.findByEmail("user@sportzone.com").ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode("password123"));
                    userRepository.save(user);
                },
                () -> userRepository.save(User.builder()
                        .id(UUID.fromString("00000000-0000-0000-0000-000000000002"))
                        .email("user@sportzone.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .firstName("Demo")
                        .lastName("User")
                        .role(UserRole.USER)
                        .status(UserStatus.ACTIVE)
                        .build())
            );
        };
    }



    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
