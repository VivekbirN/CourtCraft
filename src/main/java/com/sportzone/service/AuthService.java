package com.sportzone.service;

import com.sportzone.dto.AuthDto;
import com.sportzone.entity.User;
import com.sportzone.entity.UserRole;
import com.sportzone.entity.UserStatus;
import com.sportzone.exception.BusinessRuleViolationException;
import com.sportzone.repository.UserRepository;
import com.sportzone.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }


    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleViolationException("Email address already registered");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.USER;

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        String jwtToken = jwtService.generateToken(savedUser);

        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserSummary(savedUser))
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessRuleViolationException("Invalid email or password"));

        String jwtToken = jwtService.generateToken(user);

        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserSummary(user))
                .build();
    }

    private AuthDto.UserSummary mapToUserSummary(User user) {
        return AuthDto.UserSummary.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }
}
