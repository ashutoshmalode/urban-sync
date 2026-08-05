import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EngineeringIcon from "@mui/icons-material/Engineering";
import HomeIcon from "@mui/icons-material/Home";
import axiosInstance from "../../api/axiosInstance";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const [isSecretaryRegistered, setIsSecretaryRegistered] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && role === "SECRETARY") {
      navigate("/secretary/dashboard");
      return;
    }
    if (isAuthenticated && role === "RESIDENT") {
      navigate("/resident/dashboard");
      return;
    }
    if (isAuthenticated && role === "CARETAKER") {
      navigate("/caretaker/dashboard");
      return;
    }
    axiosInstance
      .get("/api/secretary/is-registered")
      .then((res) => setIsSecretaryRegistered(res.data))
      .catch(() => setIsSecretaryRegistered(false))
      .finally(() => setLoading(false));
  }, [isAuthenticated, role, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f0f9ff",
        }}
      >
        <CircularProgress size={36} sx={{ color: "#0891b2" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f0f9ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e0f2fe",
            boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
              py: 3,
              px: 3,
              textAlign: "center",
            }}
          >
            <ApartmentIcon sx={{ fontSize: 36, color: "white", mb: 0.5 }} />
            <Typography
              variant="h6"
              fontWeight={700}
              color="white"
              letterSpacing={0.5}
            >
              UrbanSync
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Society Management System
            </Typography>
          </Box>

          {/* Status */}
          <Box sx={{ px: 3, pt: 2, display: "flex", justifyContent: "center" }}>
            <Chip
              label={
                isSecretaryRegistered ? "✓ Society Active" : "⚠ Setup Required"
              }
              size="small"
              sx={{
                bgcolor: isSecretaryRegistered ? "#dcfce7" : "#fef9c3",
                color: isSecretaryRegistered ? "#166534" : "#854d0e",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>

          {/* Buttons */}
          <Box
            sx={{
              px: 3,
              pt: 1.5,
              pb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {/* Secretary Section */}
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ mt: 0.5 }}
            >
              SECRETARY
            </Typography>

            <Button
              variant={isSecretaryRegistered ? "outlined" : "contained"}
              size="small"
              fullWidth
              disabled={isSecretaryRegistered}
              onClick={() => navigate("/secretary/register")}
              startIcon={<AdminPanelSettingsIcon fontSize="small" />}
              sx={{
                py: 0.9,
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: "0.8rem",
                justifyContent: "flex-start",
                bgcolor: !isSecretaryRegistered ? "#0891b2" : undefined,
                color: !isSecretaryRegistered ? "white" : undefined,
                borderColor: "#bae6fd",
                "&:hover": {
                  bgcolor: !isSecretaryRegistered ? "#0e7490" : undefined,
                },
                "&.Mui-disabled": {
                  bgcolor: "#f0fdf4",
                  color: "#16a34a",
                  borderColor: "#bbf7d0",
                },
              }}
            >
              {isSecretaryRegistered
                ? "✓ Secretary Registered"
                : "Register as Secretary"}
            </Button>

            <Button
              variant="contained"
              size="small"
              fullWidth
              disabled={!isSecretaryRegistered}
              onClick={() => navigate("/secretary/login")}
              startIcon={<AdminPanelSettingsIcon fontSize="small" />}
              sx={{
                py: 0.9,
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: "0.8rem",
                justifyContent: "flex-start",
                bgcolor: "#0891b2",
                "&:hover": { bgcolor: "#0e7490" },
                "&.Mui-disabled": { bgcolor: "#e0f2fe", color: "#7dd3fc" },
                boxShadow: isSecretaryRegistered
                  ? "0 2px 6px rgba(8,145,178,0.2)"
                  : "none",
              }}
            >
              Login as Secretary
            </Button>

            <Divider sx={{ my: 0.5 }} />

            {/* Resident Section */}
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              RESIDENT
            </Typography>

            <Button
              variant="contained"
              size="small"
              fullWidth
              disabled={!isSecretaryRegistered}
              onClick={() => navigate("/resident/register")}
              startIcon={<PersonAddIcon fontSize="small" />}
              sx={{
                py: 0.9,
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: "0.8rem",
                justifyContent: "flex-start",
                bgcolor: "#0891b2",
                "&:hover": { bgcolor: "#0e7490" },
                "&.Mui-disabled": { bgcolor: "#e0f2fe", color: "#7dd3fc" },
                boxShadow: isSecretaryRegistered
                  ? "0 2px 6px rgba(8,145,178,0.2)"
                  : "none",
              }}
            >
              Register as Resident
            </Button>

            <Button
              variant="contained"
              size="small"
              fullWidth
              disabled={!isSecretaryRegistered}
              onClick={() => navigate("/resident/login")}
              startIcon={<HomeIcon fontSize="small" />}
              sx={{
                py: 0.9,
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: "0.8rem",
                justifyContent: "flex-start",
                bgcolor: "#0891b2",
                "&:hover": { bgcolor: "#0e7490" },
                "&.Mui-disabled": { bgcolor: "#e0f2fe", color: "#7dd3fc" },
                boxShadow: isSecretaryRegistered
                  ? "0 2px 6px rgba(8,145,178,0.2)"
                  : "none",
              }}
            >
              Login as Resident
            </Button>

            <Divider sx={{ my: 0.5 }} />

            {/* Caretaker Section */}
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              CARETAKER
            </Typography>

            <Button
              variant="contained"
              size="small"
              fullWidth
              disabled={!isSecretaryRegistered}
              onClick={() => navigate("/caretaker/login")}
              startIcon={<EngineeringIcon fontSize="small" />}
              sx={{
                py: 0.9,
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: "0.8rem",
                justifyContent: "flex-start",
                bgcolor: "#059669",
                "&:hover": { bgcolor: "#047857" },
                "&.Mui-disabled": { bgcolor: "#dcfce7", color: "#86efac" },
                boxShadow: isSecretaryRegistered
                  ? "0 2px 6px rgba(5,150,105,0.2)"
                  : "none",
              }}
            >
              Login as Caretaker
            </Button>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              bgcolor: "#f8fafc",
              px: 3,
              py: 1.5,
              textAlign: "center",
              borderTop: "1px solid #e0f2fe",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.65rem"
            >
              © 2026 UrbanSync — CDAC Final Project
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;
