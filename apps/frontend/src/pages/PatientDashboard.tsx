
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyPatientProfile,
  type Patient,
} from "../services/patientService";
import { clearAuthSession } from "../services/authService";
import "./RoleDashboard.css";

export default function PatientDashboard() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    getMyPatientProfile()
      .then((profile) => {
        if (active) setPatient(profile);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your patient profile.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <main className="role-dashboard">
      <header className="role-dashboard-header">
        <Link className="role-dashboard-brand" to="/app/patient/dashboard">
          ✚ MedCore
        </Link>
        <button className="role-logout" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <section className="role-dashboard-content">
        <p className="role-dashboard-eyebrow">YOUR HEALTHCARE SPACE</p>
        <h1>Patient Dashboard</h1>
        <p className="role-dashboard-description">
          Keep your profile and healthcare activities organized in one place.
        </p>

        <section className="role-welcome-card">
          <div className="role-welcome-icon">✚</div>
          <div>
            <h2>
              {loading
                ? "Loading your profile..."
                : patient
                  ? `Welcome, ${patient.fullName}`
                  : "Welcome to MedCore"}
            </h2>
            <p>
              {patient?.patientNumber
                ? `Patient ID: ${patient.patientNumber}`
                : "Your healthcare information at a glance."}
            </p>
          </div>
        </section>

        {error && (
          <div role="alert" className="role-dashboard-note">
            <strong>Profile unavailable:</strong> {error}
            <p>
              Please sign in again if your session has expired. If this
              continues, check that your account has a linked patient profile.
            </p>
          </div>
        )}

        {patient && (
          <>
            <h2 className="role-section-title">Your profile</h2>
            <div className="role-feature-grid">
              <article className="role-feature-card">
                <span className="role-feature-mark">✦</span>
                <h3>Blood group</h3>
                <p>{patient.bloodGroup || "Not added yet"}</p>
              </article>
              <article className="role-feature-card">
                <span className="role-feature-mark">✦</span>
                <h3>Phone</h3>
                <p>{patient.phone || "Not added yet"}</p>
              </article>
              <article className="role-feature-card">
                <span className="role-feature-mark">✦</span>
                <h3>Email</h3>
                <p>{patient.email || "Not added yet"}</p>
              </article>
            </div>
          </>
        )}

        <h2 className="role-section-title">Your healthcare</h2>
        <div className="role-feature-grid">
          <Link className="role-feature-card" to="/app/find-doctor">
            <span className="role-feature-mark">✚</span>
            <h3>Find a Doctor</h3>
            <p>Explore specialties and request an appointment.</p>
          </Link>
          <Link className="role-feature-card" to="/app/appointments">
            <span className="role-feature-mark">▣</span>
            <h3>Appointments</h3>
            <p>Open your appointments workspace.</p>
          </Link>
          <Link className="role-feature-card" to="/app/medical-records">
            <span className="role-feature-mark">✚</span>
            <h3>Medical records</h3>
            <p>Open the medical-records workspace.</p>
          </Link>
          <Link className="role-feature-card" to="/app/billing">
            <span className="role-feature-mark">₹</span>
            <h3>Billing</h3>
            <p>Open your billing workspace.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
