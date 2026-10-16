import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/api";
import { getHospitals } from "../services/hospitalService";
import { getPatientsByHospital, type Patient } from "../services/patientService";
import {
  createMedicalRecord,
  getMedicalRecordsByHospital,
  type MedicalRecord,
  type MedicalRecordRequest,
} from "../services/medicalRecordService";
import type { Hospital } from "../types/hospital";
import "./MedicalRecords.css";

interface Doctor {
  id: string;
  doctorName: string;
  hospitalId: string;
  specialization?: string | null;
  departmentName?: string | null;
}

const initialForm = {
  patientId: "",
  doctorId: "",
  chiefComplaints: "",
  symptoms: "",
  diagnoses: "",
  treatmentPlan: "",
  allergies: "",
  vaccinationHistory: "",
  familyHistory: "",
  temperature: "",
  heartRate: "",
  systolicBp: "",
  diastolicBp: "",
  respiratoryRate: "",
  oxygenSaturation: "",
  weight: "",
  height: "",
};

function displayDate(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString();
}

export default function MedicalRecords() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [activeDirectory, setActiveDirectory] = useState<"patients" | "doctors" | null>(null);

  const loadHospitals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getHospitals();
      setHospitals(result);
      if (result.length > 0) {
        setHospitalId((current) =>
          current && result.some((hospital) => hospital.id === current)
            ? current
            : result[0].id,
        );
      }
      if (result.length === 0) setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load hospitals.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHospitals();
  }, [loadHospitals]);

  const loadHospitalData = useCallback(async () => {
    if (!hospitalId) return;
    setLoading(true);
    setError("");
    setNotice("");
    setSelectedRecord(null);

    try {
      const [patientResult, doctorResult, recordResult] = await Promise.all([
        getPatientsByHospital(hospitalId),
        apiGet<Doctor[]>(`doctors/hospital/${encodeURIComponent(hospitalId)}`),
        getMedicalRecordsByHospital(hospitalId),
      ]);
      setPatients(patientResult);
      setDoctors(doctorResult);
      setRecords(recordResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load medical records. Please sign in again if your session expired.",
      );
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    void loadHospitalData();
  }, [loadHospitalData]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesPatient =
        selectedPatient === "all" || record.patientId === selectedPatient;
      const matchesSearch =
        !query ||
        [
          record.patientName,
          record.doctorName,
          record.chiefComplaints,
          record.diagnoses,
          record.treatmentPlan,
        ].some((value) => value?.toLowerCase().includes(query));
      return matchesPatient && matchesSearch;
    });
  }, [records, search, selectedPatient]);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hospitalId || !form.patientId || !form.doctorId) {
      setError("Please select a patient and doctor.");
      return;
    }

    const numericFields = [
      "temperature",
      "heartRate",
      "systolicBp",
      "diastolicBp",
      "respiratoryRate",
      "oxygenSaturation",
      "weight",
      "height",
    ] as const;

    const payload: MedicalRecordRequest = {
      hospitalId,
      patientId: form.patientId,
      doctorId: form.doctorId,
      chiefComplaints: form.chiefComplaints.trim(),
      symptoms: form.symptoms.trim(),
      diagnoses: form.diagnoses.trim(),
      treatmentPlan: form.treatmentPlan.trim(),
      allergies: form.allergies.trim(),
      vaccinationHistory: form.vaccinationHistory.trim(),
      familyHistory: form.familyHistory.trim(),
    };

    for (const field of numericFields) {
      const value = form[field].trim();
      if (value !== "") {
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue) || numberValue < 0) {
          setError(`Please enter a valid non-negative value for ${field}.`);
          return;
        }
        payload[field] = numberValue;
      }
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createMedicalRecord(payload);
      setNotice("Medical record created successfully.");
      setForm(initialForm);
      setShowForm(false);
      await loadHospitalData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the medical record.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="medical-page">
      <section className="medical-hero">
        <div>
          <span className="medical-eyebrow">CLINICAL MANAGEMENT</span>
          <h1>Medical Records</h1>
          <p>Patient histories, clinical notes and vital signs in one place.</p>
        </div>
        <button
          className="medical-primary-button"
          onClick={() => {
            setError("");
            setNotice("");
            setForm(initialForm);
            setShowForm((current) => !current);
          }}
          disabled={!hospitalId || loading}
        >
          {showForm ? "Close form" : "+ New medical record"}
        </button>
      </section>

      <section className="medical-stats">
  <button type="button" className="medical-stat-card medical-stat-clickable"
    onClick={() => document.getElementById("clinical-record-history")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
    <span className="medical-stat-icon">▤</span>
    <div><p>Total records</p><strong>{records.length}</strong><small>View record history →</small></div>
  </button>
  <button type="button" className="medical-stat-card medical-stat-clickable"
    onClick={() => setActiveDirectory("patients")}>
    <span className="medical-stat-icon">♙</span>
    <div><p>Registered patients</p><strong>{patients.length}</strong><small>View patient list →</small></div>
  </button>
  <button type="button" className="medical-stat-card medical-stat-clickable"
    onClick={() => setActiveDirectory("doctors")}>
    <span className="medical-stat-icon">✚</span>
    <div><p>Available doctors</p><strong>{doctors.length}</strong><small>View doctor list →</small></div>
  </button>
</section>

{activeDirectory && (
  <div className="medical-directory-overlay" onClick={() => setActiveDirectory(null)}>
    <section className="medical-directory-modal" role="dialog" aria-modal="true"
      aria-labelledby="medical-directory-title" onClick={(event) => event.stopPropagation()}>
      <div className="medical-directory-heading">
        <div>
          <span className="medical-eyebrow">HOSPITAL DIRECTORY</span>
          <h2 id="medical-directory-title">{activeDirectory === "patients" ? "Registered patients" : "Available doctors"}</h2>
          <p>{activeDirectory === "patients" ? `${patients.length} registered patient(s)` : `${doctors.length} registered doctor(s)`}</p>
        </div>
        <button type="button" className="medical-directory-close" onClick={() => setActiveDirectory(null)} aria-label="Close">×</button>
      </div>
      <div className="medical-directory-list">
        {activeDirectory === "patients" ? (
          patients.length ? patients.map((patient) => (
            <article className="medical-directory-item" key={patient.id}>
              <span className="medical-directory-avatar">{(patient.fullName || "P").charAt(0).toUpperCase()}</span>
              <div><strong>{patient.fullName}</strong>
                <p>{patient.patientNumber || "Patient number unavailable"}</p>
                <p>{patient.email || patient.phone || "No contact details available"}</p>
              </div>
            </article>
          )) : <p className="medical-directory-empty">No patients registered at this hospital.</p>
        ) : (
          doctors.length ? doctors.map((doctor) => (
            <article className="medical-directory-item" key={doctor.id}>
              <span className="medical-directory-avatar doctor-directory-avatar">{(doctor.doctorName || "D").charAt(0).toUpperCase()}</span>
              <div><strong>{doctor.doctorName}</strong>
                <p>{doctor.specialization || "Specialization not specified"}</p>
              </div>
            </article>
          )) : <p className="medical-directory-empty">No doctors registered at this hospital.</p>
        )}
      </div>
      <div className="medical-directory-footer">
        <button type="button" className="medical-secondary-button" onClick={() => setActiveDirectory(null)}>Close</button>
      </div>
    </section>
  </div>
)}

      {error && <div className="medical-alert medical-alert-error" role="alert">{error}</div>}
      {notice && <div className="medical-alert medical-alert-success" role="status">{notice}</div>}

      {showForm && (
        <section className="medical-panel medical-form-panel">
          <div className="medical-section-heading">
            <div><span className="medical-eyebrow">NEW ENTRY</span><h2>Create medical record</h2></div>
            <span className="medical-required-note">* Required fields</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="medical-form-grid">
              <label>
                Patient *
                <select required value={form.patientId} onChange={(event) => updateField("patientId", event.target.value)}>
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName} — {patient.patientNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Doctor *
                <select required value={form.doctorId} onChange={(event) => updateField("doctorId", event.target.value)}>
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.doctorName}{doctor.specialization ? ` — ${doctor.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="medical-field-wide">
                Chief complaints
                <textarea rows={2} value={form.chiefComplaints} onChange={(event) => updateField("chiefComplaints", event.target.value)} placeholder="Reason for the visit..." />
              </label>
              <label className="medical-field-wide">
                Symptoms
                <textarea rows={2} value={form.symptoms} onChange={(event) => updateField("symptoms", event.target.value)} placeholder="Symptoms reported by the patient..." />
              </label>
              <label className="medical-field-wide">
                Diagnosis
                <textarea rows={2} value={form.diagnoses} onChange={(event) => updateField("diagnoses", event.target.value)} placeholder="Clinical assessment..." />
              </label>
              <label className="medical-field-wide">
                Treatment plan
                <textarea rows={3} value={form.treatmentPlan} onChange={(event) => updateField("treatmentPlan", event.target.value)} placeholder="Recommended treatment and follow-up..." />
              </label>
              <label>
                Allergies
                <input value={form.allergies} onChange={(event) => updateField("allergies", event.target.value)} placeholder="Known allergies or none reported" />
              </label>
              <label>
                Vaccination history
                <input value={form.vaccinationHistory} onChange={(event) => updateField("vaccinationHistory", event.target.value)} placeholder="Vaccination details" />
              </label>
              <label className="medical-field-wide">
                Family history
                <textarea rows={2} value={form.familyHistory} onChange={(event) => updateField("familyHistory", event.target.value)} placeholder="Relevant family medical history..." />
              </label>
            </div>

            <div className="medical-vitals-heading"><h3>Vital signs</h3><span>All fields optional</span></div>
            <div className="medical-form-grid medical-vitals-grid">
              {([
                ["temperature", "Temperature (°C)", "0.1"],
                ["heartRate", "Heart rate (bpm)", "1"],
                ["systolicBp", "Systolic BP (mmHg)", "1"],
                ["diastolicBp", "Diastolic BP (mmHg)", "1"],
                ["respiratoryRate", "Respiratory rate", "1"],
                ["oxygenSaturation", "Oxygen saturation (%)", "0.1"],
                ["weight", "Weight (kg)", "0.1"],
                ["height", "Height (cm)", "0.1"],
              ] as const).map(([field, label, step]) => (
                <label key={field}>
                  {label}
                  <input type="number" min="0" step={step} value={form[field]} onChange={(event) => updateField(field, event.target.value)} />
                </label>
              ))}
            </div>
            <div className="medical-form-actions">
              <button type="button" className="medical-secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="medical-primary-button" disabled={saving || patients.length === 0 || doctors.length === 0}>
                {saving ? "Saving..." : "Save medical record"}
              </button>
            </div>
            {(patients.length === 0 || doctors.length === 0) && (
              <p className="medical-helper-text">A patient and a doctor must be registered at this hospital before a record can be created.</p>
            )}
          </form>
        </section>
      )}

      <section className="medical-panel" id="clinical-record-history">
        <div className="medical-section-heading">
          <div><span className="medical-eyebrow">PATIENT CARE</span><h2>Clinical record history</h2></div>
          <span className="medical-record-count">{filteredRecords.length} records</span>
        </div>
        <div className="medical-toolbar">
          <label className="medical-hospital-select">
            Hospital
            <select value={hospitalId} onChange={(event) => setHospitalId(event.target.value)}>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
              ))}
            </select>
          </label>
          <label>
            Patient
            <select value={selectedPatient} onChange={(event) => setSelectedPatient(event.target.value)}>
              <option value="all">All patients</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}
            </select>
          </label>
          <label className="medical-search">
            Search records
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Patient, doctor or diagnosis..." />
          </label>
          <button type="button" className="medical-secondary-button medical-refresh-button" onClick={() => void loadHospitalData()} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="medical-empty-state"><span className="medical-spinner" /><p>Loading clinical records...</p></div>
        ) : filteredRecords.length === 0 ? (
          <div className="medical-empty-state">
            <span className="medical-empty-icon">▤</span>
            <h3>No medical records found</h3>
            <p>{records.length === 0 ? "No records have been created for this hospital yet." : "Try changing your search or patient filter."}</p>
            {records.length === 0 && <button className="medical-primary-button" onClick={() => setShowForm(true)}>Create first record</button>}
          </div>
        ) : (
          <div className="medical-record-list">
            {filteredRecords.map((record) => (
              <article className="medical-record-card" key={record.id}>
                <div className="medical-record-avatar">{(record.patientName || "P").trim().charAt(0).toUpperCase()}</div>
                <div className="medical-record-main">
                  <div className="medical-record-title">
                    <div><h3>{record.patientName || "Unnamed patient"}</h3><p>Attending doctor: {record.doctorName || "Not specified"}</p></div>
                    <time>{displayDate(record.createdAt)}</time>
                  </div>
                  <div className="medical-record-tags">
                    {record.diagnoses && <span>{record.diagnoses}</span>}
                    {record.chiefComplaints && <span>Complaint recorded</span>}
                    {record.temperature != null && <span>{record.temperature} °C</span>}
                    {record.heartRate != null && <span>{record.heartRate} bpm</span>}
                  </div>
                  <button className="medical-text-button" onClick={() => setSelectedRecord(record)}>View full record <span>→</span></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedRecord && (
        <div className="medical-modal-backdrop" role="presentation" onClick={() => setSelectedRecord(null)}>
          <section className="medical-detail-modal" role="dialog" aria-modal="true" aria-labelledby="medical-detail-title" onClick={(event) => event.stopPropagation()}>
            <div className="medical-section-heading">
              <div><span className="medical-eyebrow">CLINICAL DETAILS</span><h2 id="medical-detail-title">{selectedRecord.patientName}</h2></div>
              <button className="medical-close-button" onClick={() => setSelectedRecord(null)} aria-label="Close record details">×</button>
            </div>
            <p className="medical-detail-meta">Doctor: {selectedRecord.doctorName} · {displayDate(selectedRecord.createdAt)}</p>
            <div className="medical-detail-grid">
              {([
                ["Chief complaints", selectedRecord.chiefComplaints],
                ["Symptoms", selectedRecord.symptoms],
                ["Diagnosis", selectedRecord.diagnoses],
                ["Treatment plan", selectedRecord.treatmentPlan],
                ["Allergies", selectedRecord.allergies],
                ["Vaccination history", selectedRecord.vaccinationHistory],
                ["Family history", selectedRecord.familyHistory],
                ["Temperature", selectedRecord.temperature == null ? null : `${selectedRecord.temperature} °C`],
                ["Heart rate", selectedRecord.heartRate == null ? null : `${selectedRecord.heartRate} bpm`],
                ["Blood pressure", selectedRecord.systolicBp == null && selectedRecord.diastolicBp == null ? null : `${selectedRecord.systolicBp ?? "—"}/${selectedRecord.diastolicBp ?? "—"} mmHg`],
                ["Respiratory rate", selectedRecord.respiratoryRate == null ? null : `${selectedRecord.respiratoryRate} breaths/min`],
                ["Oxygen saturation", selectedRecord.oxygenSaturation == null ? null : `${selectedRecord.oxygenSaturation}%`],
                ["Weight", selectedRecord.weight == null ? null : `${selectedRecord.weight} kg`],
                ["Height", selectedRecord.height == null ? null : `${selectedRecord.height} cm`],
              ] as const).map(([label, value]) => (
                <div className="medical-detail-item" key={label}><span>{label}</span><p>{value || "Not recorded"}</p></div>
              ))}
            </div>
            <div className="medical-form-actions"><button className="medical-primary-button" onClick={() => setSelectedRecord(null)}>Close details</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
