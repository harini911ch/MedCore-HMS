import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyPatientProfile, type Patient } from "../services/patientService";
import {
  getMedicalRecordsByPatient,
  type MedicalRecord,
} from "../services/medicalRecordService";
import "./RoleDashboard.css";
import "./PatientWorkspace.css";

function display(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === ""
    ? "Not recorded"
    : String(value);
}

export default function PatientMedicalRecords() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const profile = await getMyPatientProfile();
        if (!active) return;
        setPatient(profile);

        const result = await getMedicalRecordsByPatient(profile.id);
        if (!active) return;
        setRecords(result);
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load medical records.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  return (
    <main className="role-dashboard">
      <header className="role-dashboard-header">
        <Link className="role-dashboard-brand" to="/app/patient/dashboard">MedCore</Link>
        <nav className="patient-workspace-nav" aria-label="Patient navigation">
          <Link to="/app/patient/dashboard">Dashboard</Link>
          <Link to="/app/appointments">Appointments</Link>
          <Link to="/app/medical-records" aria-current="page">Medical records</Link>
          <Link to="/app/billing">Billing</Link>
        </nav>
      </header>

      <section className="role-dashboard-content">
        <p className="role-dashboard-eyebrow">YOUR HEALTHCARE SPACE</p>
        <h1>My Medical Records</h1>
        <p className="role-dashboard-description">
          Review the medical information recorded for your visits.
        </p>

        <section className="role-welcome-card">
          <div className="role-welcome-icon">+</div>
          <div>
            <h2>{patient ? `Hello, ${patient.fullName}` : "Your medical history"}</h2>
            <p>Patient ID: {patient?.patientNumber ?? "Loading..."}</p>
          </div>
        </section>

        {loading && <div className="patient-workspace-message">Loading your medical records...</div>}

        {error && (
          <div className="patient-workspace-message patient-workspace-error" role="alert">
            <strong>Unable to load medical records.</strong>
            <p>{error}</p>
            <p>Please sign in again if your session has expired.</p>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="patient-workspace-empty">
            <h2>No medical records yet</h2>
            <p>Medical records created for your visits will appear here.</p>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="patient-record-list">
            {records.map((record) => (
              <article className="patient-record-card" key={record.id}>
                <div className="patient-appointment-top">
                  <div>
                    <p className="patient-workspace-label">DIAGNOSIS</p>
                    <h2>{display(record.diagnoses)}</h2>
                  </div>
                  <span className="patient-status">
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleDateString("en-IN")
                      : "Date not recorded"}
                  </span>
                </div>

                <div className="patient-record-grid">
                  <div>
                    <span className="patient-workspace-label">DOCTOR</span>
                    <p>{display(record.doctorName)}</p>
                  </div>
                  <div>
                    <span className="patient-workspace-label">CHIEF COMPLAINTS</span>
                    <p>{display(record.chiefComplaints)}</p>
                  </div>
                  <div>
                    <span className="patient-workspace-label">SYMPTOMS</span>
                    <p>{display(record.symptoms)}</p>
                  </div>
                  <div>
                    <span className="patient-workspace-label">TREATMENT PLAN</span>
                    <p>{display(record.treatmentPlan)}</p>
                  </div>
                  <div>
                    <span className="patient-workspace-label">ALLERGIES</span>
                    <p>{display(record.allergies)}</p>
                  </div>
                  <div>
                    <span className="patient-workspace-label">VACCINATION HISTORY</span>
                    <p>{display(record.vaccinationHistory)}</p>
                  </div>
                  <div>
                    <span className="patient-workspace-label">FAMILY HISTORY</span>
                    <p>{display(record.familyHistory)}</p>
                  </div>
                </div>

                <h3 className="patient-vitals-heading">Recorded vitals</h3>
                <div className="patient-record-grid patient-vitals-grid">
                  <div><span className="patient-workspace-label">TEMPERATURE</span><p>{display(record.temperature)}</p></div>
                  <div><span className="patient-workspace-label">HEART RATE</span><p>{display(record.heartRate)}</p></div>
                  <div><span className="patient-workspace-label">BLOOD PRESSURE</span><p>{record.systolicBp != null && record.diastolicBp != null ? `${record.systolicBp}/${record.diastolicBp}` : "Not recorded"}</p></div>
                  <div><span className="patient-workspace-label">RESPIRATORY RATE</span><p>{display(record.respiratoryRate)}</p></div>
                  <div><span className="patient-workspace-label">OXYGEN SATURATION</span><p>{display(record.oxygenSaturation)}</p></div>
                  <div><span className="patient-workspace-label">WEIGHT</span><p>{display(record.weight)}</p></div>
                  <div><span className="patient-workspace-label">HEIGHT</span><p>{display(record.height)}</p></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
