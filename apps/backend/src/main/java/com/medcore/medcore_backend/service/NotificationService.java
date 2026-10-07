package com.medcore.medcore_backend.service;

import com.medcore.medcore_backend.dto.NotificationRequest;
import com.medcore.medcore_backend.dto.NotificationResponse;
import com.medcore.medcore_backend.entity.Notification;
import com.medcore.medcore_backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public NotificationResponse createNotification(NotificationRequest request) {

        if (request.getRecipientUserId() == null) {
            throw new RuntimeException("Recipient user ID is required");
        }

        if (request.getType() == null) {
            throw new RuntimeException("Notification type is required");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Notification title is required");
        }

        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new RuntimeException("Notification message is required");
        }

        Notification notification = new Notification();

        notification.setRecipientUserId(request.getRecipientUserId());
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setRelatedEntityType(request.getRelatedEntityType());
        notification.setRelatedEntityId(request.getRelatedEntityId());

        Notification saved = notificationRepository.save(notification);

        return new NotificationResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId) {

        return notificationRepository
                .findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(UUID userId) {

        return notificationRepository
                .findByRecipientUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {

        return notificationRepository
                .countByRecipientUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found")
                );

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return new NotificationResponse(notification);
    }

    @Transactional
    public int markAllAsRead(UUID userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByRecipientUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId);

        LocalDateTime now = LocalDateTime.now();

        for (Notification notification : notifications) {
            notification.setReadAt(now);
        }

        notificationRepository.saveAll(notifications);

        return notifications.size();
    }
}