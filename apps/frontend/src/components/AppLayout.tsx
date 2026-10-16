import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getUserId, getUserRole } from "../services/authService";
import { getUnreadNotificationCount } from "../services/notificationService";
import "./AppLayout.css";

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  roles: string[];
}

const ADMIN_ROLES = ["SUPER_ADMIN", "HOSPITAL_ADMIN"];
const STAFF_ROLES = [
  "NURSE",
  "RECEPTIONIST",
  "LAB_TECHNICIAN",
  "PHARMACIST",
  "ACCOUNTANT",
];

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", path: "/app/admin/dashboard", roles: ADMIN_ROLES },
  { label: "Patients", path: "/app/admin/patients", roles: ADMIN_ROLES },
  { label: "Doctors", path: "/app/admin/doctors", roles: ADMIN_ROLES },
  { label: "Appointments", path: "/app/admin/appointments", roles: ADMIN_ROLES },
  {
    label: "Medical Records",
    path: "/app/admin/medical-records",
    roles: [...ADMIN_ROLES, "DOCTOR"],
  },
  {
    label: "Pharmacy",
    path: "/app/admin/pharmacy",
    roles: [...ADMIN_ROLES, "PHARMACIST"],
  },
  {
    label: "Laboratory",
    path: "/app/admin/laboratory",
    roles: [...ADMIN_ROLES, "DOCTOR", "LAB_TECHNICIAN"],
  },
  {
    label: "Billing",
    path: "/app/admin/billing",
    roles: [...ADMIN_ROLES, "ACCOUNTANT"],
  },
];

function homeForRole(role: string | null): string {
  if (role === "SUPER_ADMIN" || role === "HOSPITAL_ADMIN") {
    return "/app/admin/dashboard";
  }
  if (role === "DOCTOR") return "/app/doctor/dashboard";
  if (role === "PATIENT") return "/app/patient/dashboard";
  if (role && STAFF_ROLES.includes(role)) return "/app/staff/dashboard";
  return "/login";
}

export default function AppLayout({ children }: AppLayoutProps) {
  const role = getUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [softTheme, setSoftTheme] = useState(true);
  const [motionEnabled, setMotionEnabled] = useState(true);

  const homePath = homeForRole(role);

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      const userId = getUserId();

      if (!userId) {
        if (!cancelled) setUnreadCount(0);
        return;
      }

      try {
        const count = await getUnreadNotificationCount(userId);
        if (!cancelled) setUnreadCount(count);
      } catch {
        // Preserve the last displayed count if a temporary request fails.
      }
    };

    void loadUnreadCount();
    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [location.pathname, notificationsOpen]);

  const items =
    role === "PATIENT"
      ? [
          { label: "My Dashboard", path: homePath, roles: ["PATIENT"] },
          { label: "Find a Doctor", path: "/app/find-doctor", roles: ["PATIENT"] },
          { label: "Appointments", path: "/app/appointments", roles: ["PATIENT"] },
          { label: "Medical Records", path: "/app/medical-records", roles: ["PATIENT"] },
          { label: "Billing", path: "/app/billing", roles: ["PATIENT"] },
        ]
      : role === "DOCTOR"
        ? [
            { label: "My Dashboard", path: homePath, roles: ["DOCTOR"] },
            ...NAV_ITEMS.filter((item) => item.roles.includes("DOCTOR")),
          ]
        : role && STAFF_ROLES.includes(role)
          ? [
              { label: "My Dashboard", path: homePath, roles: STAFF_ROLES },
              ...NAV_ITEMS.filter((item) => item.roles.includes(role)),
            ]
          : NAV_ITEMS.filter((item) => item.roles.includes(role ?? ""));

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(homePath, { replace: true });
    }
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <div
      className={[
        "app-shell",
        softTheme ? "" : "app-shell-neutral",
        motionEnabled ? "" : "app-shell-reduced-motion",
      ].filter(Boolean).join(" ")}
    >
      <header className="app-topbar">
        <NavLink className="app-brand" to={homePath} aria-label="MedCore home">
          <span className="app-brand-mark" aria-hidden="true">
            {"\u2695"}
          </span>
          <span className="app-brand-text">
            <strong>MedCore</strong>
            <small>HEALTHCARE MANAGEMENT</small>
          </span>
        </NavLink>

        <nav className="app-nav-links" aria-label="Main navigation">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `app-nav-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-toolbar">
          <button
            className="app-icon-button"
            type="button"
            aria-label="Go back"
            title="Go back"
            onClick={goBack}
          >
            {"\u2190"}
          </button>

          <button
            className="app-icon-button"
            type="button"
            aria-label="Home"
            title="Home"
            onClick={() => navigate(homePath)}
          >
            {"\u2302"}
          </button>

          <div className="app-menu-anchor">
            <button
              className={`app-icon-button${notificationsOpen ? " selected" : ""}`}
              type="button"
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
                setSettingsOpen(false);
              }}
            >
              {"\u2667"}
              {unreadCount > 0 && (
                <span className="app-notification-badge" aria-hidden="true">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <section className="app-popover app-notification-panel">
                <h3>Notifications</h3>
                <p>View your healthcare updates and alerts.</p>
                <button
                  className="app-menu-action"
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/app/notifications");
                  }}
                >
                  Open notifications
                </button>
              </section>
            )}
          </div>

          <div className="app-menu-anchor">
            <button
              className={`app-profile-button${profileOpen ? " selected" : ""}`}
              type="button"
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
                setSettingsOpen(false);
              }}
            >
              <span className="app-avatar" aria-hidden="true">
                {"\u263A"}
              </span>
              <span className="app-profile-label">
                <strong>My Account</strong>
                <small>{role?.replaceAll("_", " ") ?? "User"}</small>
              </span>
              <span aria-hidden="true">{"\u2304"}</span>
            </button>

            {profileOpen && (
              <section className="app-popover app-profile-panel">
                <div className="app-profile-summary">
                  <span className="app-avatar app-avatar-large" aria-hidden="true">
                    {"\u263A"}
                  </span>
                  <div>
                    <strong>My Account</strong>
                    <p>{role?.replaceAll("_", " ") ?? "User"}</p>
                  </div>
                </div>
                <button
                  className="app-menu-action"
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setSettingsOpen(true);
                  }}
                >
                  <span aria-hidden="true">{"\u2699"}</span> Appearance & settings
                </button>
                <button
                  className="app-menu-action app-signout-action"
                  type="button"
                  onClick={handleLogout}
                >
                  <span aria-hidden="true">{"\u2197"}</span> Sign out
                </button>
              </section>
            )}
          </div>
        </div>
      </header>

      {settingsOpen && (
        <section className="app-settings-strip" aria-label="Appearance settings">
          <div>
            <strong>Appearance</strong>
            <p>Personalize the look and motion of MedCore on this page.</p>
          </div>
          <label className="app-setting-option">
            <input
              type="checkbox"
              checked={softTheme}
              onChange={(event) => setSoftTheme(event.target.checked)}
            />
            Soft blue theme
          </label>
          <label className="app-setting-option">
            <input
              type="checkbox"
              checked={motionEnabled}
              onChange={(event) => setMotionEnabled(event.target.checked)}
            />
            Smooth transitions
          </label>
          <button
            className="app-settings-close"
            type="button"
            onClick={() => setSettingsOpen(false)}
          >
            Close
          </button>
        </section>
      )}

      <div
        key={location.pathname}
        className="app-layout-content"
      >
        {children}
      </div>
    </div>
  );
}
