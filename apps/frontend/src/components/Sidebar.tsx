import { NavLink } from "react-router-dom";
import { getUserRole } from "../services/authService";
import "./Sidebar.css";

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
}

const allStaffRoles = [
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
  "DOCTOR",
  "PATIENT",
  "NURSE",
  "RECEPTIONIST",
  "LAB_TECHNICIAN",
  "PHARMACIST",
  "ACCOUNTANT",
];

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/app/dashboard",
    icon: "\u25A6",
    roles: allStaffRoles,
  },
  {
    label: "Patients",
    path: "/app/admin/patients",
    icon: "\u2659",
    roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN"],
  },
  {
    label: "Doctors",
    path: "/app/admin/doctors",
    icon: "\u2695",
    roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN"],
  },
  {
    label: "Appointments",
    path: "/app/admin/appointments",
    icon: "\u25F7",
    roles: allStaffRoles,
  },
  {
    label: "Medical Records",
    path: "/app/admin/medical-records",
    icon: "\u25A4",
    roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "NURSE"],
  },
  {
    label: "Prescriptions",
    path: "/app/admin/pharmacy",
    icon: "\u2695",
    roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "PHARMACIST"],
  },
  {
    label: "Laboratory",
    path: "/app/admin/laboratory",
    icon: "\u2697",
    roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "LAB_TECHNICIAN"],
  },
  {
    label: "Pharmacy",
    path: "/app/admin/pharmacy",
    icon: "\u25A5",
    roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "PHARMACIST"],
  },
  {
    label: "Billing",
    path: "/app/admin/billing",
    icon: "\u20B9",
    roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "ACCOUNTANT"],
  },
  {
    label: "Notifications",
    path: "/app/notifications",
    icon: "\u25C9",
    roles: allStaffRoles,
  },
  {
    label: "Settings",
    path: "/app/admin/settings",
    icon: "\u2699",
    roles: allStaffRoles,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const role = getUserRole() ?? "";
  const items = navigation.filter((item) =>
    item.roles.includes(role),
  );

  return (
    <aside className="medcore-sidebar">
      <NavLink
        to="/app/dashboard"
        className="medcore-sidebar-brand"
        onClick={onNavigate}
      >
        <span className="medcore-sidebar-logo" aria-hidden="true">
          <span>{"\u2695"}</span>
        </span>
        <span className="medcore-brand-copy">
          <strong>MedCore</strong>
          <small>HEALTHCARE SYSTEM</small>
        </span>
      </NavLink>

      <div className="medcore-sidebar-section-label">
        <span className="medcore-section-dot" />
        WORKSPACE
      </div>

      <nav className="medcore-sidebar-nav" aria-label="Main navigation">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === "/app/dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `medcore-nav-link${isActive ? " active" : ""}`
            }
          >
            <span className="medcore-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="medcore-nav-label">{item.label}</span>
            <span className="medcore-nav-indicator" />
          </NavLink>
        ))}
      </nav>

      <div className="medcore-sidebar-footer">
        <span className="medcore-sidebar-footer-icon" aria-hidden="true">
          {"\u2713"}
        </span>
        <div className="medcore-footer-copy">
          <strong>MedCore HMS</strong>
          <small>Healthcare workspace</small>
        </div>
        <span className="medcore-footer-status" title="Workspace" />
      </div>
    </aside>
  );
}