package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Notification;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationResponse {

    private UUID id;
    private UUID recipientUserId;
    private Notification.Type type;
    private String title;
    private String message;
    private String relatedEntityType;
    private UUID relatedEntityId;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private boolean read;

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.recipientUserId = notification.getRecipientUserId();
        this.type = notification.getType();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.relatedEntityType = notification.getRelatedEntityType();
        this.relatedEntityId = notification.getRelatedEntityId();
        this.readAt = notification.getReadAt();
        this.createdAt = notification.getCreatedAt();
        this.read = notification.getReadAt() != null;
    }

    public UUID getId() {
        return id;
    }

    public UUID getRecipientUserId() {
        return recipientUserId;
    }

    public Notification.Type getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getRelatedEntityType() {
        return relatedEntityType;
    }

    public UUID getRelatedEntityId() {
        return relatedEntityId;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isRead() {
        return read;
    }
}