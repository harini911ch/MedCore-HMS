package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.NotificationRequest;
import com.medcore.medcore_backend.dto.NotificationResponse;
import com.medcore.medcore_backend.entity.User;
import com.medcore.medcore_backend.repository.UserRepository;
import com.medcore.medcore_backend.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository
    ) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @RequestBody NotificationRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(notificationService.createNotification(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        requireOwnUserId(userId, authentication);

        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        requireOwnUserId(userId, authentication);

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        requireOwnUserId(userId, authentication);

        Map<String, Long> response = new LinkedHashMap<>();
        response.put("unreadCount", notificationService.getUnreadCount(userId));

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {
        UUID currentUserId = getCurrentUserId(authentication);

        return ResponseEntity.ok(
                notificationService.markAsRead(notificationId, currentUserId)
        );
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        requireOwnUserId(userId, authentication);

        int updatedCount = notificationService.markAllAsRead(userId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "All notifications marked as read");
        response.put("updatedCount", updatedCount);

        return ResponseEntity.ok(response);
    }

    private UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new AccessDeniedException("Authenticated user not found")
                );

        return user.getId();
    }

    private void requireOwnUserId(
            UUID requestedUserId,
            Authentication authentication
    ) {
        if (!getCurrentUserId(authentication).equals(requestedUserId)) {
            throw new AccessDeniedException(
                    "You cannot access another user's notifications"
            );
        }
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role ->
                        role.equals("ROLE_SUPER_ADMIN")
                                || role.equals("ROLE_HOSPITAL_ADMIN")
                );

        if (!isAdmin) {
            throw new AccessDeniedException(
                    "Only hospital administrators can create notifications through this endpoint"
            );
        }
    }
}
