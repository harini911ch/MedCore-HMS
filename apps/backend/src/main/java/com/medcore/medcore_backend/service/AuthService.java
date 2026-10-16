package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.*;
import com.medcore.medcore_backend.entity.Hospital;
import com.medcore.medcore_backend.entity.RefreshToken;
import com.medcore.medcore_backend.entity.Role;
import com.medcore.medcore_backend.entity.User;

import com.medcore.medcore_backend.repository.HospitalRepository;
import com.medcore.medcore_backend.repository.RefreshTokenRepository;
import com.medcore.medcore_backend.repository.UserRepository;

import com.medcore.medcore_backend.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            HospitalRepository hospitalRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "User with this email already exists"
            );
        }

        // Public registration must never grant privileged roles.
        // Staff and hospital accounts require an authorized workflow.
        Role role = Role.PATIENT;
        Hospital hospital = null;

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setPhone(request.getPhone());
        user.setRole(role);
        user.setHospital(hospital);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        return createAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        return createAuthResponse(user);
    }

    public AuthResponse refreshToken(
            RefreshRequest request
    ) {

        RefreshToken oldToken =
                refreshTokenRepository
                        .findByToken(request.getRefreshToken())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid refresh token"
                                )
                        );

        if (oldToken.isRevoked()) {
            throw new RuntimeException(
                    "Refresh token has been revoked"
            );
        }

        if (oldToken.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Refresh token has expired"
            );
        }

        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        return createAuthResponse(oldToken.getUser());
    }

    public void logout(RefreshRequest request) {

        refreshTokenRepository
                .findByToken(request.getRefreshToken())
                .ifPresent(token -> {

                    token.setRevoked(true);

                    refreshTokenRepository.save(token);
                });
    }

    private AuthResponse createAuthResponse(User user) {

        String accessToken =
                jwtService.generateAccessToken(user);

        String refreshTokenValue =
                UUID.randomUUID().toString();

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(
                LocalDateTime.now().plusDays(7)
        );

        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
        user.getId(),
        accessToken,
        refreshToken.getToken(),
        user.getRole().name()
);
    }
}
