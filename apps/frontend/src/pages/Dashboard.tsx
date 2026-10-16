import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession, getUserRole } from "../services/authService";
import { getHospitals } from "../services/hospitalService";
import {
  getPatientsByHospital,
  type Patient,
} from "../services/patientService";
import type { Hospital } from "../types/hospital";
import "./Dashboard.css";

interface HospitalSummary {
  hospital: Hospital;
  patientCount: number | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const role = getUserRole();

  const [hospitals, setHospitals] = useState<HospitalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientCount, setPatientCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const hospitalList = await getHospitals();

        const summaries = await Promise.all(
          hospitalList.map(async (hospital): Promise<HospitalSummary> => {
            try {
              const patients: Patient[] = await getPatientsByHospital(
                hospital.id,
              );

              return {
                hospital,
                patientCount: patients.length,
              };
            } catch {
              return {
                hospital,
                patientCount: null,
              };
            }
          }),
        );

        if (cancelled) return;

        setHospitals(summaries);

        const counts = summaries.map((item) => item.patientCount);
        setPatientCount(
          counts.every((count) => count !== null)
            ? counts.reduce<number>(
                (total, count) => total + (count ?? 0),
                0,
              )
            : null,
        );
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load hospital information.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  const roleTitle =
    role === "SUPER_ADMIN"
      ? "Platform Administration"
      : "Hospital Administration";

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <NavLink className="admin-brand" to="/app/dashboard" aria-label="MedCore home">
          <span className="admin-brand-icon" aria-hidden="true">{"\u2695"}</span>
          <span className="admin-brand-copy">
            <strong>MedCore</strong>
            <small>HEALTHCARE MANAGEMENT</small>
          </span>
        </NavLink>

        <nav className="admin-top-nav" aria-label="Dashboard navigation">
          <NavLink to="/app/dashboard" end className={({ isActive }) => `admin-top-link${isActive ? " active" : ""}`}>
            Overview
          </NavLink>
          <NavLink to="/app/admin/patients" className={({ isActive }) => `admin-top-link${isActive ? " active" : ""}`}>
            Patients
          </NavLink>
          <NavLink to="/app/admin/doctors" className={({ isActive }) => `admin-top-link${isActive ? " active" : ""}`}>
            Doctors
          </NavLink>
          <NavLink to="/app/admin/appointments" className={({ isActive }) => `admin-top-link${isActive ? " active" : ""}`}>
            Appointments
          </NavLink>
          <NavLink to="/app/admin/medical-records" className={({ isActive }) => `admin-top-link${isActive ? " active" : ""}`}>
            Records
          </NavLink>
          <NavLink to="/app/admin/pharmacy" className={({ isActive }) => `admin-top-link${isActive ? " active" : ""}`}>
            Pharmacy
          </NavLink>
          <NavLink to="/app/admin/laboratory" className={({ isActive }) => `admin-top-link${isActive ? " active" : ""}`}>
            Laboratory
          </NavLink>
          <NavLink to="/app/admin/billing" className={({ isActive }) => `admin-top-link${isActive ? " active" : ""}`}>
            Billing
          </NavLink>
        </nav>

        <div className="admin-header-actions">
          <span className="admin-role">
            {role?.replaceAll("_", " ") ?? "ADMIN"}
          </span>
          <button className="admin-logout" onClick={handleLogout}>
            Sign out <span aria-hidden="true">{"\u2192"}</span>
          </button>
        </div>
      </header>

      <div className="admin-content">
        <section className="admin-intro">
          <div>
            <p className="admin-eyebrow">HEALTHCARE MANAGEMENT SYSTEM</p>
            <h1>{roleTitle}</h1>
            <p className="admin-subtitle">
              Monitor hospital information and patient records from one place.
            </p>
          </div>

          <button
            className="admin-refresh"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            { "\u21BB" } Refresh data
          </button>
        </section>

        {error && (
          <section className="admin-error" role="alert">
            <strong>Dashboard data could not be loaded.</strong>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try again
            </button>
          </section>
        )}

        <section className="admin-stats" aria-label="Hospital statistics">
          <button type="button" className="admin-stat-card admin-stat-clickable" aria-label="Open hospital administration" onClick={() => navigate("/app/admin/doctors")}>
            <div className="admin-stat-top">
              <span>Registered hospitals</span>
              <span className="admin-stat-icon hospital-icon">{"\u271A"}</span>
            </div>
            <strong className="admin-stat-value">
              {loading ? "\u2026" : error ? "\u2014" : hospitals.length}
            </strong>
            <span className="admin-stat-caption">Hospitals returned by the API</span>
          </button>

          <button type="button" className="admin-stat-card admin-stat-clickable" aria-label="View patients" onClick={() => navigate("/app/admin/patients")}>
            <div className="admin-stat-top">
              <span>Total patients</span>
              <span className="admin-stat-icon patient-icon">{"\u2665"}</span>
            </div>
            <strong className="admin-stat-value">
              {loading
                ? "\u2026"
                : error || patientCount === null
                  ? "\u2014"
                  : patientCount}
            </strong>
            <span className="admin-stat-caption">
              {loading
                ? "Retrieving patient records"
                : patientCount === null && hospitals.length > 0
                  ? "Some patient totals could not be retrieved"
                  : "Based on retrieved hospital records"}
            </span>
          </button>

          <button
            type="button"
            className="admin-stat-card admin-stat-clickable"
            aria-label="View data connection details"
            onClick={() => {
              window.alert(
                `MedCore connection status: ${loading ? "Loading" : error ? "Error" : "Responding"}\n\nHospital API: ${error ? "Request failed" : loading ? "Checking..." : "Request completed"}\nPatient data: ${patientCount === null ? "Unavailable or still loading" : `${patientCount} patient(s) retrieved`}${error ? `\n\nError: ${error}` : ""}`,
              );
            }}
          >
            <div className="admin-stat-top">
              <span>Data connection</span>
              <span className="admin-stat-icon connection-icon">{"\u2311"}</span>
            </div>
            <strong className="admin-stat-value admin-connection-value">
              {loading ? "Loading" : error ? "Error" : "Responding"}
            </strong>
            <span className="admin-stat-caption">
              {loading
                ? "Contacting the backend"
                : error
                  ? "Hospital request failed"
                  : "Click to view connection details"}
            </span>
          </button>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Hospital overview</h2>
              <p>Hospital details retrieved from MedCore.</p>
            </div>
            {!loading && !error && (
              <span className="admin-record-count">
                {hospitals.length} {hospitals.length === 1 ? "hospital" : "hospitals"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="admin-empty-state">
              <span className="admin-spinner" />
              <p>Loading hospital information\u2026</p>
            </div>
          ) : !error && hospitals.length === 0 ? (
            <div className="admin-empty-state">
              <span className="admin-empty-icon">{"\u271A"}</span>
              <h3>No hospitals found</h3>
              <p>The backend returned an empty hospital list.</p>
            </div>
          ) : !error ? (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hospital</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Patients</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map(({ hospital, patientCount: count }) => (
                    <tr key={hospital.id}>
                      <td>
                        <div className="admin-hospital-name">
                          <span className="admin-hospital-avatar">{"\u271A"}</span>
                          <div>
                            <strong>{hospital.name}</strong>
                            <small>{hospital.email || "No email provided"}</small>
                          </div>
                        </div>
                      </td>
                      <td>{hospital.phone || "\u2014"}</td>
                      <td>{hospital.address || "\u2014"}</td>
                      <td>
                        <span
                          className={
                            count === null
                              ? "admin-patient-count unavailable"
                              : "admin-patient-count"
                          }
                        >
                          {count === null ? "Unavailable" : count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <p className="admin-footer">
          MedCore HMS {"\u00B7"} Dashboard figures are based on backend responses.
        </p>
      </div>
    </main>
  );
}
