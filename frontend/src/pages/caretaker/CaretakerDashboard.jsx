import { Routes, Route, Navigate } from "react-router-dom";
import CaretakerAppLayout from "../caretaker/CaretakerAppLayout";
import CaretakerHomePage from "./CaretakerHomePage";
import CaretakerIssuesPage from "./CaretakerIssuesPage";
import CaretakerAnnouncementsPage from "./CaretakerAnnouncementsPage";
import CaretakerPropertiesPage from "./CaretakerPropertiesPage";
import CaretakerProfilePage from "./CaretakerProfilePage";

const CaretakerDashboard = () => {
  return (
    <CaretakerAppLayout>
      <Routes>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<CaretakerHomePage />} />
        <Route path="profile" element={<CaretakerProfilePage />} />
        <Route path="issues" element={<CaretakerIssuesPage />} />
        <Route path="announcements" element={<CaretakerAnnouncementsPage />} />
        <Route path="properties" element={<CaretakerPropertiesPage />} />
      </Routes>
    </CaretakerAppLayout>
  );
};

export default CaretakerDashboard;
