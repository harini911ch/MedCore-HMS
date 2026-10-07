package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.NotificationRequest;
import com.medcore.medcore_backend.dto.NotificationResponse;
import com.medcore.medcore_backend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @RequestBody NotificationRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(notificationService.createNotification(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable UUID userId
    ) {
        Map<String, Long> response = new LinkedHashMap<>();

        response.put(
                "unreadCount",
                notificationService.getUnreadCount(userId)
        );

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID notificationId
    ) {
        return ResponseEntity.ok(
                notificationService.markAsRead(notificationId)
        );
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @PathVariable UUID userId
    ) {
        int updatedCount =
                notificationService.markAllAsRead(userId);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("message", "All notifications marked as read");
        response.put("updatedCount", updatedCount);

        return ResponseEntity.ok(response);
    }
}