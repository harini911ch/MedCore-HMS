export interface Hospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}
