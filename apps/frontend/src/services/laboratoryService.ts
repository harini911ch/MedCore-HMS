import { getAccessToken } from "./authService";

const API_BASE = "http://localhost:8081/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.text();
  let data: unknown = null;
  if (body) {
    try { data = JSON.parse(body); } catch { data = body; }
  }
  if (!response.ok) {
    const message =
      typeof data === "string" ? data :
      data && typeof data === "object" && "message" in data ? String((data as {message: unknown}).message) :
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export interface Hospital {
  id: string;
  name: string;
  city?: string;
  state?: string;
}
export interface LabTest {
  id: string;
  hospitalId: string;
  name: string;
  description?: string;
  sampleType: string;
  price: number;
  active: boolean;
  createdAt?: string;
}
export interface LabOrder {
  id: string;
  hospitalId: string;
  patientId: string;
  doctorId: string;
  medicalRecordId?: string | null;
  status: string;
  clinicalNotes?: string;
  orderedAt?: string;
  completedAt?: string | null;
}
export interface LabResult {
  id: string;
  labOrderId: string;
  labTestId: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  remarks?: string;
  status: string;
  resultedAt?: string;
  createdAt?: string;
}
export interface CreateTestPayload {
  hospitalId: string;
  name: string;
  description: string;
  sampleType: string;
  price: number;
  active: boolean;
}
export interface CreateOrderPayload {
  hospitalId: string;
  patientId: string;
  doctorId: string;
  medicalRecordId?: string;
  clinicalNotes?: string;
  tests: { labTestId: string }[];
}
export interface CreateResultPayload {
  labOrderId: string;
  labTestId: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  remarks?: string;
}

export const laboratoryService = {
  getHospitals: () => request<Hospital[]>("/hospitals"),
  getTests: (hospitalId: string) =>
    request<LabTest[]>(`/lab-tests/hospital/${encodeURIComponent(hospitalId)}`),
  createTest: (payload: CreateTestPayload) =>
    request<LabTest>("/lab-tests", { method: "POST", body: JSON.stringify(payload) }),
  getOrders: (hospitalId: string) =>
    request<LabOrder[]>(`/lab-orders/hospital/${encodeURIComponent(hospitalId)}`),
  createOrder: (payload: CreateOrderPayload) =>
    request<LabOrder>("/lab-orders", { method: "POST", body: JSON.stringify(payload) }),
  updateOrderStatus: (orderId: string, status: string) =>
    request<LabOrder>(`/lab-orders/${encodeURIComponent(orderId)}/status?status=${encodeURIComponent(status)}`, { method: "PATCH" }),
  getOrderResults: (orderId: string) =>
    request<LabResult[]>(`/lab-results/order/${encodeURIComponent(orderId)}`),
  createResult: (payload: CreateResultPayload) =>
    request<LabResult>("/lab-results", { method: "POST", body: JSON.stringify(payload) }),
};
