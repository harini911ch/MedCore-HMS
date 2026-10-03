package com.medcore.medcore_backend.dto;

import java.util.UUID;

public class AuthResponse {

    private UUID userId;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String role;

    public AuthResponse(
            UUID userId,
            String accessToken,
            String refreshToken,
            String role
    ) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
        this.role = role;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getRole() {
        return role;
    }
}