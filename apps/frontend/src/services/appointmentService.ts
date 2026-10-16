import { apiGet, apiPost, apiPatch } from "./api";

export interface Appointment {
  id: string;
  hospitalId: string;
  doctorId: string;
  doctorName?: string;
  patientId: string;
  patientName?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  emergency: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentRequest {
  hospitalId: string;
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  emergency: boolean;
}

export function getAppointmentsByHospital(
  hospitalId: string,
): Promise<Appointment[]> {
  return apiGet<Appointment[]>(
    `appointments/hospital/${encodeURIComponent(hospitalId)}`,
  );
}

export function createAppointment(
  request: AppointmentRequest,
): Promise<Appointment> {
  return apiPost<Appointment>("appointments", request);
}

export function updateAppointmentStatus(
  appointmentId: string,
  status: string,
): Promise<Appointment> {
  return apiPatch<Appointment>(
    `appointments/${encodeURIComponent(appointmentId)}/status?status=${encodeURIComponent(status)}`,
  );
}
export function getAppointmentsByPatient(
  patientId: string,
): Promise<Appointment[]> {
  return apiGet<Appointment[]>(
    `appointments/patient/${encodeURIComponent(patientId)}`,
  );
}
