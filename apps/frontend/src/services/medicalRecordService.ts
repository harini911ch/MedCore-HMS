import { getAccessToken } from "./authService";

const API_URL = "http://localhost:8081/api/medical-records";

export interface MedicalRecord {
  id: string;
  hospitalId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string | null;
  chiefComplaints?: string | null;
  symptoms?: string | null;
  diagnoses?: string | null;
  treatmentPlan?: string | null;
  allergies?: string | null;
  vaccinationHistory?: string | null;
  familyHistory?: string | null;
  temperature?: number | null;
  heartRate?: number | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  respiratoryRate?: number | null;
  oxygenSaturation?: number | null;
  weight?: number | null;
  height?: number | null;
  createdAt?: string;
}

export interface MedicalRecordRequest {
  hospitalId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  chiefComplaints?: string;
  symptoms?: string;
  diagnoses?: string;
  treatmentPlan?: string;
  allergies?: string;
  vaccinationHistory?: string;
  familyHistory?: string;
  temperature?: number;
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function createMedicalRecord(
  data: MedicalRecordRequest,
): Promise<MedicalRecord> {
  return request<MedicalRecord>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMedicalRecord(
  recordId: string,
): Promise<MedicalRecord> {
  return request<MedicalRecord>(
    `${API_URL}/${encodeURIComponent(recordId)}`,
  );
}

export function getMedicalRecordsByPatient(
  patientId: string,
): Promise<MedicalRecord[]> {
  return request<MedicalRecord[]>(
    `${API_URL}/patient/${encodeURIComponent(patientId)}`,
  );
}

export function getMedicalRecordsByDoctor(
  doctorId: string,
): Promise<MedicalRecord[]> {
  return request<MedicalRecord[]>(
    `${API_URL}/doctor/${encodeURIComponent(doctorId)}`,
  );
}

export function getMedicalRecordsByHospital(
  hospitalId: string,
): Promise<MedicalRecord[]> {
  return request<MedicalRecord[]>(
    `${API_URL}/hospital/${encodeURIComponent(hospitalId)}`,
  );
}
