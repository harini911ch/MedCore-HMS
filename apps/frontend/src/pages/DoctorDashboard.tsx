
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDoctorProfile, type Doctor } from "../services/doctorService";
import { clearAuthSession } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./RoleDashboard.css";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    getMyDoctorProfile()
      .then((profile) => {
        if (active) setDoctor(profile);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your doctor profile.",
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
        <Link className="role-dashboard-brand" to="/app/doctor/dashboard">
          ✚ MedCore
        </Link>
        <button className="role-logout" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <section className="role-dashboard-content">
        <p className="role-dashboard-eyebrow">CLINICAL WORKSPACE</p>
        <h1>Doctor Dashboard</h1>
        <p className="role-dashboard-description">
          Your workspace for appointments, patient care, and clinical activities.
        </p>

        <section className="role-welcome-card">
          <div className="role-welcome-icon">✚</div>
          <div>
            <h2>
              {loading
                ? "Loading your profile..."
                : doctor
                  ? `Welcome, Dr. ${doctor.doctorName}`
                  : "Welcome to MedCore"}
            </h2>
            <p>
              {doctor?.specialization ||
                "Your clinical workspace in one place."}
            </p>
          </div>
        </section>

        {error && (
          <div role="alert" className="role-dashboard-note">
            <strong>Profile unavailable:</strong> {error}
            <p>
              Please sign in again if your session has expired. If this
              continues, check that your account has a linked doctor profile.
            </p>
          </div>
        )}

        {doctor && (
          <>
            <h2 className="role-section-title">Your profile</h2>
            <div className="role-feature-grid">
              <article className="role-feature-card">
                <span className="role-feature-mark">✦</span>
                <h3>Specialization</h3>
                <p>{doctor.specialization || "Not added yet"}</p>
              </article>
              <article className="role-feature-card">
                <span className="role-feature-mark">✦</span>
                <h3>Qualification</h3>
                <p>{doctor.qualification || "Not added yet"}</p>
              </article>
              <article className="role-feature-card">
                <span className="role-feature-mark">✦</span>
                <h3>Experience</h3>
                <p>{doctor.experience || "Not added yet"}</p>
              </article>
            </div>
          </>
        )}

        <h2 className="role-section-title">Clinical workspace</h2>
        <div className="role-feature-grid">
          <Link className="role-feature-card" to="/app/appointments">
            <span className="role-feature-mark">▣</span>
            <h3>Appointments</h3>
            <p>Open the appointments workspace.</p>
          </Link>
          <Link className="role-feature-card" to="/app/patients">
            <span className="role-feature-mark">♙</span>
            <h3>Patients</h3>
            <p>Open patient management and records.</p>
          </Link>
          <Link className="role-feature-card" to="/app/medical-records">
            <span className="role-feature-mark">✚</span>
            <h3>Medical records</h3>
            <p>Access the medical-records workspace.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}