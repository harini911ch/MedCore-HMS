import { getAccessToken } from "./authService";

const API_URL = "http://localhost:8081/api";

export type InvoiceItemCategory =
  | "CONSULTATION"
  | "LAB"
  | "PHARMACY"
  | "ROOM"
  | "OTHER";

export type PaymentMethod = "CASH";

export interface InvoiceItemRequest {
  description: string;
  category: InvoiceItemCategory;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceRequest {
  hospitalId: string;
  patientId: string;
  appointmentId: string;
  taxRate: number;
  items: InvoiceItemRequest[];
}

export interface InvoiceItem {
  id?: string;
  description: string;
  category: InvoiceItemCategory;
  quantity: number;
  unitPrice: number;
  total?: number;
  lineTotal?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  hospitalId: string;
  patientId: string;
  appointmentId: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  items: InvoiceItem[];
}

export interface PaymentRequest {
  amount: number;
  method: PaymentMethod;
  transactionReference?: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  transactionReference?: string;
  status?: string;
  createdAt?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to MedCore HMS. Check that the backend is running on port 8081.",
    );
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const details = body as
      | { message?: string; error?: string }
      | null;

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Access denied or session expired. Please sign in again and retry.",
      );
    }

    throw new Error(
      details?.message ||
        details?.error ||
        `Request failed with status ${response.status}.`,
    );
  }

  return body as T;
}

export function createInvoice(
  data: InvoiceRequest,
): Promise<Invoice> {
  return request<Invoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getInvoice(invoiceId: string): Promise<Invoice> {
  return request<Invoice>(
    `/invoices/${encodeURIComponent(invoiceId)}`,
  );
}

export function getPatientInvoices(
  patientId: string,
): Promise<Invoice[]> {
  return request<Invoice[]>(
    `/invoices/patient/${encodeURIComponent(patientId)}`,
  );
}

export function getHospitalInvoices(
  hospitalId: string,
): Promise<Invoice[]> {
  return request<Invoice[]>(
    `/invoices/hospital/${encodeURIComponent(hospitalId)}`,
  );
}

export function finalizeInvoice(invoiceId: string): Promise<Invoice> {
  return request<Invoice>(
    `/invoices/${encodeURIComponent(invoiceId)}/finalize`,
    { method: "PATCH" },
  );
}

export function recordPayment(
  invoiceId: string,
  data: PaymentRequest,
): Promise<Payment> {
  return request<Payment>(
    `/invoices/${encodeURIComponent(invoiceId)}/payments`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getInvoicePayments(
  invoiceId: string,
): Promise<Payment[]> {
  return request<Payment[]>(
    `/invoices/${encodeURIComponent(invoiceId)}/payments`,
  );
}
