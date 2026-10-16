
import { type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Landing from "./pages/landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Pharmacy from "./pages/Pharmacy";
import Laboratory from "./pages/Laboratory";
import Doctors from "./pages/Doctors";
import MedicalRecords from "./pages/MedicalRecords";
import AppLayout from "./components/AppLayout";
import PatientAppointments from "./pages/PatientAppointments";
import PatientMedicalRecords from "./pages/PatientMedicalRecords";
import PatientBilling from "./pages/PatientBilling";
import PatientDoctorDirectory from "./pages/PatientDoctorDirectory";
import Notifications from "./pages/Notifications";

import {
  getAccessToken,
  getUserRole,
} from "./services/authService";

function destinationForRole(role: string | null): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "HOSPITAL_ADMIN":
      return "/app/admin/dashboard";

    case "DOCTOR":
      return "/app/doctor/dashboard";

    case "PATIENT":
      return "/app/patient/dashboard";

    case "NURSE":
    case "RECEPTIONIST":
    case "LAB_TECHNICIAN":
    case "PHARMACIST":
    case "ACCOUNTANT":
      return "/app/staff/dashboard";

    default:
      return "/login";
  }
}

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: string[];
}

function RequireAuth({
  children,
  allowedRoles,
}: RequireAuthProps) {
  const token = getAccessToken();
  const role = getUserRole();

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to={destinationForRole(role)}
        replace
      />
    );
  }

  return <AppLayout>{children}</AppLayout>;
}

function DashboardRedirect() {
  const token = getAccessToken();
  const role = getUserRole();

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={destinationForRole(role)}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect users to the dashboard for their role */}
        <Route
          path="/app/dashboard"
          element={<DashboardRedirect />}
        />

        {/* Patient dashboard */}
        <Route
          path="/app/patient/dashboard"
          element={
            <RequireAuth allowedRoles={["PATIENT"]}>
              <PatientDashboard />
            </RequireAuth>
          }
        />

                {/* Patient doctor directory and appointment requests */}
        <Route
          path="/app/find-doctor"
          element={
            <RequireAuth allowedRoles={["PATIENT"]}>
              <PatientDoctorDirectory />
            </RequireAuth>
          }
        />

        {/* Patient appointments */}
        <Route
          path="/app/appointments"
          element={
            <RequireAuth allowedRoles={["PATIENT"]}>
              <PatientAppointments />
            </RequireAuth>
          }
        />

        {/* Patient medical records */}
        <Route
          path="/app/medical-records"
          element={
            <RequireAuth allowedRoles={["PATIENT"]}>
              <PatientMedicalRecords />
            </RequireAuth>
          }
        />

        {/* Patient billing and invoices */}
        <Route
          path="/app/billing"
          element={
            <RequireAuth allowedRoles={["PATIENT"]}>
              <PatientBilling />
            </RequireAuth>
          }
        />
        {/* Doctor dashboard */}
        <Route
          path="/app/doctor/dashboard"
          element={
            <RequireAuth allowedRoles={["DOCTOR"]}>
              <DoctorDashboard />
            </RequireAuth>
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/app/admin/dashboard"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
              ]}
            >
              <Dashboard />
            </RequireAuth>
          }
        />

        {/* Patient management */}
        <Route
          path="/app/admin/patients"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
              ]}
            >
              <Patients />
            </RequireAuth>
          }
        />

        {/* Appointments management */}
        <Route
          path="/app/admin/appointments"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
              ]}
            >
              <Appointments />
            </RequireAuth>
          }
        />


        {/* Medical records */}
        <Route
          path="/app/admin/medical-records"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
                "DOCTOR",
              ]}
            >
              <MedicalRecords />
            </RequireAuth>
          }
        />
        {/* Billing and invoice management */}
        <Route
          path="/app/admin/billing"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
                "ACCOUNTANT",
              ]}
            >
              <Billing />
            </RequireAuth>
          }
        />
        {/* Pharmacy and inventory management */}
        <Route
          path="/app/admin/pharmacy"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
                "PHARMACIST",
              ]}
            >
              <Pharmacy />
            </RequireAuth>
          }
        />
        {/* Laboratory operations */}
        <Route
          path="/app/admin/laboratory"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
                "LAB_TECHNICIAN",
                "DOCTOR",
              ]}
            >
              <Laboratory />
            </RequireAuth>
          }
        />        {/* Doctors directory */}
        <Route
          path="/app/admin/doctors"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
              ]}
            >
              <Doctors />
            </RequireAuth>
          }
        />        {/* Staff dashboard */}
        <Route
          path="/app/staff/dashboard"
          element={
            <RequireAuth
              allowedRoles={[
                "NURSE",
                "RECEPTIONIST",
                "LAB_TECHNICIAN",
                "PHARMACIST",
                "ACCOUNTANT",
              ]}
            >
              <StaffDashboard />
            </RequireAuth>
          }
        />

        {/* Notifications available to every authenticated role */}
        <Route
          path="/app/notifications"
          element={
            <RequireAuth
              allowedRoles={[
                "SUPER_ADMIN",
                "HOSPITAL_ADMIN",
                "DOCTOR",
                "PATIENT",
                "NURSE",
                "RECEPTIONIST",
                "LAB_TECHNICIAN",
                "PHARMACIST",
                "ACCOUNTANT",
              ]}
            >
              <Notifications />
            </RequireAuth>
          }
        />
        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
