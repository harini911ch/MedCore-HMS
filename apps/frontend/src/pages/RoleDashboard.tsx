import { clearAuthSession, getUserRole } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./RoleDashboard.css";

type Props = {
  role: string;
};

const roleDetails: Record<string, { title: string; description: string; features: string[] }> = {
  SUPER_ADMIN: {
    title: "Platform Administration",
    description: "Manage and oversee the MedCore healthcare platform.",
    features: ["Hospital oversight", "User access management", "Platform operations"],
  },
  HOSPITAL_ADMIN: {
    title: "Hospital Administration",
    description: "Manage hospital operations from one place.",
    features: ["Patient management", "Doctor and staff coordination", "Billing and inventory"],
  },
  DOCTOR: {
    title: "Doctor Dashboard",
    description: "Your workspace for patient care and clinical activities.",
    features: ["Patient records", "Appointments", "Prescriptions and lab reports"],
  },
  PATIENT: {
    title: "Patient Dashboard",
    description: "Keep track of your healthcare information and visits.",
    features: ["Appointments", "Medical records", "Prescriptions and invoices"],
  },
  NURSE: {
    title: "Nursing Dashboard",
    description: "Your workspace for nursing and patient-care activities.",
    features: ["Patient care coordination", "Clinical observations", "Care updates"],
  },
  RECEPTIONIST: {
    title: "Reception Dashboard",
    description: "Coordinate front-desk and appointment activities.",
    features: ["Patient registration", "Appointment coordination", "Front-desk workflow"],
  },
  LAB_TECHNICIAN: {
    title: "Laboratory Dashboard",
    description: "Your workspace for laboratory operations.",
    features: ["Lab requests", "Test processing", "Result management"],
  },
  PHARMACIST: {
    title: "Pharmacy Dashboard",
    description: "Manage pharmacy-related work and medication inventory.",
    features: ["Medicine inventory", "Prescription dispensing", "Stock monitoring"],
  },
  ACCOUNTANT: {
    title: "Accounts Dashboard",
    description: "Your workspace for hospital financial operations.",
    features: ["Invoices", "Payments", "Billing records"],
  },
};

export default function RoleDashboard({ role }: Props) {
  const navigate = useNavigate();
  const details = roleDetails[role];

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  if (!details || getUserRole() !== role) {
    return (
      <main className="role-dashboard">
        <p>Your session or account role could not be verified.</p>
        <button onClick={handleLogout}>Return to sign in</button>
      </main>
    );
  }

  return (
    <main className="role-dashboard">
      <header className="role-dashboard-header">
        <a className="role-dashboard-brand" href="/">✚ MedCore</a>
        <button className="role-logout" onClick={handleLogout}>Sign out</button>
      </header>

      <section className="role-dashboard-content">
        <p className="role-dashboard-eyebrow">HEALTHCARE MANAGEMENT SYSTEM</p>
        <h1>{details.title}</h1>
        <p className="role-dashboard-description">{details.description}</p>

        <section className="role-welcome-card">
          <div className="role-welcome-icon">✚</div>
          <div>
            <h2>Welcome to MedCore</h2>
            <p>You are signed in with the {role.replaceAll("_", " ").toLowerCase()} role.</p>
          </div>
        </section>

        <h2 className="role-section-title">Your workspace</h2>
        <div className="role-feature-grid">
          {details.features.map((feature) => (
            <article className="role-feature-card" key={feature}>
              <span className="role-feature-mark">✦</span>
              <h3>{feature}</h3>
              <p>Access to this workflow can be connected here.</p>
            </article>
          ))}
        </div>

        <p className="role-dashboard-note">
          Your dashboard is ready. Feature access and live data will be connected
          to the existing MedCore services in the next stage.
        </p>
      </section>
    </main>
  );
}
