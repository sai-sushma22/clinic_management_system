import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import PatientList from "./pages/Patients/PatientList";
import AppointmentList from "./pages/Appointments/AppointmentList";
import NurseDashboard from "./pages/Nurse/NurseDashboard";
import ConsultationList from "./pages/Consultations/ConsultationList";
import CheckoutList from "./pages/Checkout/CheckoutList";
import ClinicalStudyList from "./pages/ClinicalStudies/ClinicalStudyList";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<ProtectedRoute roles={["RECEPTIONIST", "NURSE", "PHYSICIAN"]} />}>
            <Route path="/patients" element={<PatientList />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/clinical-studies" element={<ClinicalStudyList />} />
          </Route>

          <Route element={<ProtectedRoute roles={["NURSE"]} />}>
            <Route path="/nurse" element={<NurseDashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={["PHYSICIAN"]} />}>
            <Route path="/consultations" element={<ConsultationList />} />
          </Route>

          <Route element={<ProtectedRoute roles={["RECEPTIONIST"]} />}>
            <Route path="/checkout" element={<CheckoutList />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}