import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../features/dashboard/DashboardPage";
import NotFoundPage from "../features/notFound/NotFoundPage";
import Layout from "../components/layout/Layout";
import UsersPage from "../features/users/UsersPage";
import DoctorsPage from "../features/doctors/DoctorsPage";
import AppointmentsPage from "../features/appointments/AppointmentsPage";
import RolesPage from "../features/roles/RolesPage";
import PatientsPage from "../features/patients/PatientsPage";
import PatientDetailPage from "../features/patients/PatientDetailPage";
import AddPatientPage from "../features/patients/AddPatientPage";

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/new" element={<AddPatientPage />} />
          <Route path="/patients/user/:userId" element={<PatientDetailPage />} />
          <Route path="/patients/:patientId" element={<PatientDetailPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/roles" element={<RolesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
