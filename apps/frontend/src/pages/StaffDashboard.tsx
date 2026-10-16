import RoleDashboard from "./RoleDashboard";
import { getUserRole } from "../services/authService";

export default function StaffDashboard() {
  return <RoleDashboard role={getUserRole() ?? "NURSE"} />;
}
