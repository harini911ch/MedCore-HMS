package com.medcore.medcore_backend.dto;

import com.medcore.medcore_backend.entity.Notification;

import java.util.UUID;

public class NotificationRequest {

    private UUID recipientUserId;
    private Notification.Type type;
    private String title;
    private String message;
    private String relatedEntityType;
    private UUID relatedEntityId;

    public UUID getRecipientUserId() {
        return recipientUserId;
    }

    public void setRecipientUserId(UUID recipientUserId) {
        this.recipientUserId = recipientUserId;
    }

    public Notification.Type getType() {
        return type;
    }

    public void setType(Notification.Type type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRelatedEntityType() {
        return relatedEntityType;
    }

    public void setRelatedEntityType(String relatedEntityType) {
        this.relatedEntityType = relatedEntityType;
    }

    public UUID getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(UUID relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }
}