import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/auth/LandingPage";
import SecretaryLoginPage from "./pages/auth/SecretaryLoginPage";
import SecretaryRegisterPage from "./pages/auth/SecretaryRegisterPage";
import ResidentRegisterPage from "./pages/auth/ResidentRegisterPage";
import SecretaryDashboard from "./pages/secretary/SecretaryDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import AuthGuard from "./components/common/AuthGuard";

function App() {
  return (
    <>
      <AuthGuard />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/secretary/login" element={<SecretaryLoginPage />} />
        <Route path="/secretary/register" element={<SecretaryRegisterPage />} />
        <Route path="/resident/register" element={<ResidentRegisterPage />} />
        <Route
          path="/secretary/dashboard/*"
          element={
            <ProtectedRoute allowedRole="SECRETARY">
              <SecretaryDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
