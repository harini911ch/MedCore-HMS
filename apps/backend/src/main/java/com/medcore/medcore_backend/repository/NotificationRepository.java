package com.medcore.medcore_backend.repository;

import com.medcore.medcore_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(UUID recipientUserId);

    List<Notification> findByRecipientUserIdAndReadAtIsNullOrderByCreatedAtDesc(
            UUID recipientUserId
    );

    long countByRecipientUserIdAndReadAtIsNull(UUID recipientUserId);
}