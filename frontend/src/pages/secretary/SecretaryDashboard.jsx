import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import DashboardHome from "./DashboardHome";
import ProfilePage from "./ProfilePage";
import RegistrationsPage from "./RegistrationsPage";
import CaretakersPage from "./CaretakersPage";
import PaymentsPage from "./PaymentsPage";
import PropertyPage from "./PropertyPage";
import MaintenancePage from "./MaintenancePage";
import ComplaintsPage from "./ComplaintsPage";
import PermissionsPage from "./PermissionsPage";
import AnnouncementsPage from "./AnnouncementsPage";

const SecretaryDashboard = () => {
  return (
    <AppLayout>
      <Routes>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<DashboardHome />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="registrations" element={<RegistrationsPage />} />
        <Route path="caretakers" element={<CaretakersPage />} />
        <Route path="property" element={<PropertyPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Routes>
    </AppLayout>
  );
};

export default SecretaryDashboard;