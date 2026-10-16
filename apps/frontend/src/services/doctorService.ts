import { apiGet, apiPost } from "./api";

export interface Doctor {
  id: string;
  userId: string;
  doctorName: string;
  hospitalId: string;
  departmentId: string;
  departmentName?: string | null;
  specialization?: string | null;
  licenseNumber?: string | null;
  qualification?: string | null;
  experience?: string | null;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorRequest {
  userId: string;
  departmentId: string;
  hospitalId: string;
  specialization: string;
  licenseNumber: string;
  qualification: string;
  experience: string;
  bio: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DoctorAvailabilityRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export function getDoctorsByHospital(hospitalId: string): Promise<Doctor[]> {
  return apiGet<Doctor[]>(`doctors/hospital/${encodeURIComponent(hospitalId)}`);
}

export function createDoctor(request: DoctorRequest): Promise<Doctor> {
  return apiPost<Doctor>("doctors", request);
}

export function getDoctorAvailability(doctorId: string): Promise<DoctorAvailability[]> {
  return apiGet<DoctorAvailability[]>(`doctors/${encodeURIComponent(doctorId)}/availability`);
}

export function createDoctorAvailability(
  doctorId: string,
  request: DoctorAvailabilityRequest,
): Promise<DoctorAvailability> {
  return apiPost<DoctorAvailability>(
    `doctors/${encodeURIComponent(doctorId)}/availability`,
    request,
  );
}

export function getMyDoctorProfile(): Promise<Doctor> {
  return apiGet<Doctor>("doctors/me");
}
