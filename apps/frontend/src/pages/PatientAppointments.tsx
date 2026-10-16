
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyPatientProfile,
  type Patient,
} from "../services/patientService";
import {
  getAppointmentsByPatient,
  type Appointment,
} from "../services/appointmentService";
import "./RoleDashboard.css";
import "./PatientWorkspace.css";

export default function PatientAppointments() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      try {
        setLoading(true);
        setError("");

        const profile = await getMyPatientProfile();
        if (!active) return;

        setPatient(profile);

        const data = await getAppointmentsByPatient(profile.id);
        if (!active) return;

        setAppointments(data);
      } catch (err: unknown) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your appointments.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAppointments();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="role-dashboard">
      <header className="role-dashboard-header">
        <Link className="role-dashboard-brand" to="/app/patient/dashboard">
          ✚ MedCore
        </Link>
        <Link className="patient-back-link" to="/app/patient/dashboard">
          ← Patient Dashboard
        </Link>
      </header>

      <section className="role-dashboard-content">
        <p className="role-dashboard-eyebrow">YOUR HEALTHCARE SPACE</p>
        <h1>My Appointments</h1>
        <p className="role-dashboard-description">
          View your scheduled visits and appointment details.
        </p>

        <section className="role-welcome-card">
          <div className="role-welcome-icon">▣</div>
          <div>
            <h2>{patient ? `Hello, ${patient.fullName}` : "Your appointments"}</h2>
            <p>
              {appointments.length} appointment
              {appointments.length === 1 ? "" : "s"} found
            </p>
          </div>
        </section>

        {loading && <p className="patient-workspace-message">Loading your appointments...</p>}

        {error && (
          <div className="patient-workspace-message patient-workspace-error" role="alert">
            <strong>Unable to load appointments.</strong>
            <p>{error}</p>
            <p>Please sign in again if your session has expired.</p>
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="patient-workspace-empty">
            <span className="role-feature-mark">▣</span>
            <h2>No appointments yet</h2>
            <p>Your scheduled appointments will appear here.</p>
          </div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="patient-appointment-list">
            {appointments.map((appointment) => (
              <article className="patient-appointment-card" key={appointment.id}>
                <div className="patient-appointment-top">
                  <div>
                    <p className="patient-workspace-label">DOCTOR</p>
                    <h2>{appointment.doctorName || "Doctor not specified"}</h2>
                  </div>
                  <span
                    className={`patient-status patient-status-${appointment.status
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {appointment.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="patient-appointment-details">
                  <div>
                    <span className="patient-workspace-label">DATE</span>
                    <p>{appointment.appointmentDate}</p>
                  </div>
                  <div>
                    <span className="patient-workspace-label">TIME</span>
                    <p>
                      {appointment.startTime} – {appointment.endTime}
                    </p>
                  </div>
                  <div>
                    <span className="patient-workspace-label">REASON</span>
                    <p>{appointment.reason || "Not specified"}</p>
                  </div>
                </div>

                {appointment.emergency && (
                  <p className="patient-emergency-note">Emergency appointment</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}