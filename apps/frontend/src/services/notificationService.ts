import { apiGet, apiPatch } from "./api";

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  readAt: string | null;
  createdAt: string;
  read: boolean;
}

interface UnreadCountResponse {
  unreadCount: number;
}

interface MarkAllResponse {
  message: string;
  updatedCount: number;
}

export function getNotifications(userId: string): Promise<NotificationItem[]> {
  return apiGet<NotificationItem[]>(`notifications/user/${userId}`);
}

export function getUnreadNotificationCount(userId: string): Promise<number> {
  return apiGet<UnreadCountResponse>(
    `notifications/user/${userId}/unread-count`,
  ).then((result) => result.unreadCount);
}

export function markNotificationAsRead(
  notificationId: string,
): Promise<NotificationItem> {
  return apiPatch<NotificationItem>(
    `notifications/${notificationId}/read`,
  );
}

export function markAllNotificationsAsRead(
  userId: string,
): Promise<MarkAllResponse> {
  return apiPatch<MarkAllResponse>(
    `notifications/user/${userId}/read-all`,
  );
}
