import { Routes, Route, Navigate } from "react-router-dom";
import ResidentAppLayout from "../../layouts/ResidentAppLayout";
import ResidentHomePage from "./ResidentHomePage";
import ResidentBillsPage from "./ResidentBillsPage";
import ResidentComplaintsPage from "./ResidentComplaintsPage";
import ResidentPermissionsPage from "./ResidentPermissionsPage";
import ResidentAnnouncementsPage from "./ResidentAnnouncementsPage";
import ResidentProfilePage from "./ResidentProfilePage";
import ResidentPropertiesPage from "./ResidentPropertiesPage";

const ResidentDashboard = () => {
  return (
    <ResidentAppLayout>
      <Routes>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<ResidentHomePage />} />
        <Route path="profile" element={<ResidentProfilePage />} />
        <Route path="bills" element={<ResidentBillsPage />} />
        <Route path="complaints" element={<ResidentComplaintsPage />} />
        <Route path="permissions" element={<ResidentPermissionsPage />} />
        <Route path="announcements" element={<ResidentAnnouncementsPage />} />
        <Route path="properties" element={<ResidentPropertiesPage />} />
      </Routes>
    </ResidentAppLayout>
  );
};

export default ResidentDashboard;
