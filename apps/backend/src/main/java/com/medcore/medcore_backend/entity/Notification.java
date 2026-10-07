package com.medcore.medcore_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notification_recipient", columnList = "recipient_user_id"),
                @Index(name = "idx_notification_read_at", columnList = "read_at"),
                @Index(name = "idx_notification_created_at", columnList = "created_at")
        }
)
public class Notification {

    public enum Type {
        APPOINTMENT_CREATED,
        APPOINTMENT_CONFIRMED,
        APPOINTMENT_CANCELLED,
        APPOINTMENT_REMINDER,
        PRESCRIPTION_CREATED,
        LAB_RESULT_READY,
        INVOICE_CREATED,
        PAYMENT_RECEIVED,
        SYSTEM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "recipient_user_id", nullable = false)
    private UUID recipientUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Type type;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private UUID relatedEntityId;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getRecipientUserId() {
        return recipientUserId;
    }

    public void setRecipientUserId(UUID recipientUserId) {
        this.recipientUserId = recipientUserId;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
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

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}