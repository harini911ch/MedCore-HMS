import { apiGet, apiPost } from "./api";
import type { Hospital, HospitalRequest } from "../types/hospital";

export function getHospitals(): Promise<Hospital[]> {
  return apiGet<Hospital[]>("hospitals");
}

export function getHospitalById(id: string): Promise<Hospital> {
  return apiGet<Hospital>(`hospitals/${encodeURIComponent(id)}`);
}

export function createHospital(
  request: HospitalRequest,
): Promise<Hospital> {
  return apiPost<Hospital>("hospitals", request);
}
