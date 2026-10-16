import { apiGet, apiPost } from "./api";

export interface Patient {
  id: string;
  userId?: string | null;
  hospitalId: string;
  patientNumber: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientRequest {
  userId?: string | null;
  hospitalId: string;
  patientNumber: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
}

export function getPatientsByHospital(
  hospitalId: string,
): Promise<Patient[]> {
  return apiGet<Patient[]>(
    `patients/hospital/${encodeURIComponent(hospitalId)}`,
  );
}

export function getPatientById(id: string): Promise<Patient> {
  return apiGet<Patient>(`patients/${encodeURIComponent(id)}`);
}

export function createPatient(
  request: PatientRequest,
): Promise<Patient> {
  return apiPost<Patient>("patients", request);
}

export function getMyPatientProfile(): Promise<Patient> {
  return apiGet<Patient>("patients/me");
}
