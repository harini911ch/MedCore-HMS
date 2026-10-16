import { getAccessToken } from "./authService";

const API_BASE = "http://localhost:8081/api";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body || `Request failed (${response.status})`;
    try {
      const parsed = JSON.parse(body);
      message = parsed.message || parsed.error || message;
    } catch {
      // Keep the response text when it is not JSON.
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Your session may have expired. Sign out and sign in again, then retry.");
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export interface Medicine {
  id: string;
  hospitalId: string;
  name: string;
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  active: boolean;
}

export interface PharmacyBatch {
  id: string;
  hospitalId: string;
  medicineId: string;
  medicineName: string;
  medicineStrength?: string;
  batchNumber: string;
  expiryDate: string;
  quantityAvailable: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  lowStock: boolean;
  expired: boolean;
}

export interface PharmacyDispense {
  id: string;
  medicineName: string;
  batchNumber: string;
  quantityDispensed: number;
  remainingQuantity: number;
  lowStock: boolean;
  dispensedAt: string;
  patientName?: string;
  patientId?: string;
  prescriptionId?: string;
}

export interface MedicineInput {
  hospitalId: string;
  name: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
}

export interface BatchInput {
  hospitalId: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantityAvailable: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
}

export const pharmacyService = {
  getHospitals: () => request<any[]>("/hospitals"),
  getMedicines: (hospitalId: string) =>
    request<Medicine[]>(`/medicines/hospital/${hospitalId}`),
  createMedicine: (data: MedicineInput) =>
    request<Medicine>("/medicines", { method: "POST", body: JSON.stringify(data) }),
  getBatches: (hospitalId: string) =>
    request<PharmacyBatch[]>(`/pharmacy/batches/hospital/${hospitalId}`),
  createBatch: (data: BatchInput) =>
    request<PharmacyBatch>("/pharmacy/batches", { method: "POST", body: JSON.stringify(data) }),
  dispense: (batchId: string, quantity: number) =>
    request<PharmacyDispense>(`/pharmacy/batches/${batchId}/dispense`, {
      method: "POST", body: JSON.stringify({ quantity }),
    }),
  dispensePrescription: (batchId: string, prescriptionItemId: string, quantity: number) =>
    request<PharmacyDispense>(`/pharmacy/batches/${batchId}/dispense-prescription`, {
      method: "POST", body: JSON.stringify({ prescriptionItemId, quantity }),
    }),
  getHistory: (hospitalId: string) =>
    request<PharmacyDispense[]>(`/pharmacy/dispenses/hospital/${hospitalId}`),
};
