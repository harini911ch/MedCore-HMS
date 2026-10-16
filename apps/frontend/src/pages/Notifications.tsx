import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserId } from "../services/authService";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "../services/notificationService";
import "./Notifications.css";

type FilterType = "all" | "unread";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function iconForType(type: string): string {
  if (type.startsWith("APPOINTMENT")) return "▣";
  if (type.startsWith("PRESCRIPTION")) return "✚";
  if (type.startsWith("LAB_RESULT")) return "⚗";
  if (type.startsWith("INVOICE") || type.startsWith("PAYMENT")) return "₹";
  return "●";
}

export default function Notifications() {
  const userId = getUserId();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setError("Your user session does not contain a user ID. Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getNotifications(userId);
      setNotifications(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((item) => !item.read)
        : notifications,
    [filter, notifications],
  );

  async function handleMarkRead(item: NotificationItem) {
    if (item.read) return;

    setBusyId(item.id);
    setError("");

    try {
      const updated = await markNotificationAsRead(item.id);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === updated.id ? updated : notification,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this notification.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkAllRead() {
    if (!userId || unreadCount === 0) return;

    setMarkingAll(true);
    setError("");

    try {
      await markAllNotificationsAsRead(userId);
      setNotifications((current) =>
        current.map((item) =>
          item.read
            ? item
            : { ...item, read: true, readAt: new Date().toISOString() },
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <main className="notifications-page">
      <section className="notifications-hero">
        <div className="notifications-hero-copy">
          <span className="notifications-eyebrow">YOUR WORKSPACE</span>
          <h1>Notifications</h1>
          <p>Stay informed about your healthcare updates and activity.</p>
        </div>

        <div className="notifications-hero-icon" aria-hidden="true">
          <span>♧</span>
          {unreadCount > 0 && (
            <span className="notifications-hero-count">{unreadCount}</span>
          )}
        </div>
      </section>

      <section className="notifications-summary" aria-label="Notification summary">
        <div className="notifications-summary-icon">●</div>
        <div>
          <span className="notifications-summary-label">Unread notifications</span>
          <strong>{unreadCount}</strong>
        </div>
        <span className="notifications-summary-caption">
          {unreadCount === 0 ? "You're all caught up" : "Updates waiting for you"}
        </span>
      </section>

      <section className="notifications-panel">
        <div className="notifications-panel-header">
          <div>
            <h2>Recent activity</h2>
            <p>Review your latest updates.</p>
          </div>

          <button
            type="button"
            className="notifications-mark-all"
            onClick={() => void handleMarkAllRead()}
            disabled={unreadCount === 0 || markingAll || loading}
          >
            {markingAll ? "Updating..." : "Mark all as read"}
          </button>
        </div>

        <div className="notifications-toolbar">
          <div className="notifications-filters" role="group" aria-label="Filter notifications">
            <button
              type="button"
              className={filter === "all" ? "selected" : ""}
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All <span>{notifications.length}</span>
            </button>
            <button
              type="button"
              className={filter === "unread" ? "selected" : ""}
              aria-pressed={filter === "unread"}
              onClick={() => setFilter("unread")}
            >
              Unread <span>{unreadCount}</span>
            </button>
          </div>

          <button
            type="button"
            className="notifications-refresh"
            onClick={() => void loadNotifications()}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="notifications-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadNotifications()}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="notifications-state">
            <span className="notifications-spinner" />
            <p>Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-state">
            <div className="notifications-empty-icon">✓</div>
            <h3>{filter === "unread" ? "You're all caught up" : "No notifications yet"}</h3>
            <p>
              {filter === "unread"
                ? "You have no unread updates at the moment."
                : "New updates will appear here when they become available."}
            </p>
            {filter === "unread" && notifications.length > 0 && (
              <button type="button" onClick={() => setFilter("all")}>
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((item) => (
              <article
                key={item.id}
                className={`notification-item${item.read ? "" : " notification-unread"}`}
              >
                <div className={`notification-type-icon notification-type-${item.type.split("_")[0].toLowerCase()}`}>
                  {iconForType(item.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{item.title}</h3>
                    {!item.read && <span className="notification-unread-dot" aria-label="Unread" />}
                  </div>
                  <p>{item.message}</p>
                  <div className="notification-meta">
                    <span>{formatDate(item.createdAt)}</span>
                    <span className="notification-type-label">
                      {item.type.replaceAll("_", " ").toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="notification-actions">
                  {item.read ? (
                    <span className="notification-read-label">✓ Read</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleMarkRead(item)}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id ? "Saving..." : "Mark as read"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="notifications-footer-note">
        <span>●</span> Your notifications are private to your signed-in account.
      </p>
    </main>
  );
}
