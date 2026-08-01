import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import ProfilePage from "./ProfilePage";
import RegistrationsPage from "./RegistrationsPage";
import CaretakersPage from "./CaretakersPage";
import PaymentsPage from "./PaymentsPage";
import PropertyPage from './PropertyPage';

const SecretaryDashboard = () => {
  return (
    <AppLayout>
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="registrations" element={<RegistrationsPage />} />
        <Route path="caretakers" element={<CaretakersPage />} />
        <Route path="property" element={<PropertyPage />} />
        <Route path="payments" element={<PaymentsPage />} />
      </Routes>
    </AppLayout>
  );
};

export default SecretaryDashboard;
