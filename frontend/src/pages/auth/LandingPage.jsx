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
        <CircularProgress size={32} sx={{ color: "#0891b2" }} />
      </Box>
    );
  }

  const LoginBtn = ({
    label,
    icon,
    onClick,
    disabled,
    color = "#0891b2",
    hoverColor = "#0e7490",
    disabledBg = "#e0f2fe",
    disabledColor = "#7dd3fc",
  }) => (
    <Button
      variant="contained"
      size="small"
      fullWidth
      disabled={disabled}
      onClick={onClick}
      startIcon={icon}
      sx={{
        py: { xs: 0.7, sm: 0.9 },
        borderRadius: 1.5,
        fontWeight: 600,
        fontSize: { xs: "0.75rem", sm: "0.8rem" },
        justifyContent: "flex-start",
        bgcolor: color,
        "&:hover": { bgcolor: hoverColor },
        "&.Mui-disabled": { bgcolor: disabledBg, color: disabledColor },
        boxShadow: !disabled ? `0 2px 6px ${color}33` : "none",
        fontFamily: "Inter, sans-serif",
        textTransform: "none",
      }}
    >
      {label}
    </Button>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f0f9ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1.5, sm: 3 },
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
              py: { xs: 2, sm: 3 },
              px: 3,
              textAlign: "center",
            }}
          >
            <ApartmentIcon
              sx={{ fontSize: { xs: 28, sm: 36 }, color: "white", mb: 0.3 }}
            />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: { xs: "1rem", sm: "1.15rem" },
                color: "white",
                letterSpacing: 0.5,
              }}
            >
              UrbanSync
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.68rem", sm: "0.75rem" },
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Society Management System
            </Typography>
          </Box>

          {/* Status */}
          <Box
            sx={{
              px: 3,
              pt: { xs: 1.2, sm: 2 },
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Chip
              label={
                isSecretaryRegistered ? "✓ Society Active" : "⚠ Setup Required"
              }
              size="small"
              sx={{
                bgcolor: isSecretaryRegistered ? "#dcfce7" : "#fef9c3",
                color: isSecretaryRegistered ? "#166534" : "#854d0e",
                fontWeight: 600,
                fontSize: "0.68rem",
                fontFamily: "Inter, sans-serif",
                height: 22,
              }}
            />
          </Box>

          {/* Buttons */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              pt: { xs: 1, sm: 1.5 },
              pb: { xs: 1.5, sm: 2 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 0.8, sm: 1 },
            }}
          >
            {/* Secretary */}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.6rem", sm: "0.68rem" },
                color: "#94a3b8",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                mt: { xs: 0.3, sm: 0.5 },
              }}
            >
              Secretary
            </Typography>

            <Button
              variant={isSecretaryRegistered ? "outlined" : "contained"}
              size="small"
              fullWidth
              disabled={isSecretaryRegistered}
              onClick={() => navigate("/secretary/register")}
              startIcon={
                <AdminPanelSettingsIcon sx={{ fontSize: "15px !important" }} />
              }
              sx={{
                py: { xs: 0.7, sm: 0.9 },
                borderRadius: 1.5,
                fontWeight: 600,
                fontSize: { xs: "0.75rem", sm: "0.8rem" },
                justifyContent: "flex-start",
                textTransform: "none",
                fontFamily: "Inter, sans-serif",
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

            <LoginBtn
              label="Login as Secretary"
              icon={
                <AdminPanelSettingsIcon sx={{ fontSize: "15px !important" }} />
              }
              onClick={() => navigate("/secretary/login")}
              disabled={!isSecretaryRegistered}
            />

            <Divider
              sx={{ my: { xs: 0.3, sm: 0.5 }, borderColor: "#e0f2fe" }}
            />

            {/* Resident */}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.6rem", sm: "0.68rem" },
                color: "#94a3b8",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Resident
            </Typography>

            <LoginBtn
              label="Register as Resident"
              icon={<PersonAddIcon sx={{ fontSize: "15px !important" }} />}
              onClick={() => navigate("/resident/register")}
              disabled={!isSecretaryRegistered}
            />
            <LoginBtn
              label="Login as Resident"
              icon={<HomeIcon sx={{ fontSize: "15px !important" }} />}
              onClick={() => navigate("/resident/login")}
              disabled={!isSecretaryRegistered}
            />

            <Divider
              sx={{ my: { xs: 0.3, sm: 0.5 }, borderColor: "#e0f2fe" }}
            />

            {/* Caretaker */}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.6rem", sm: "0.68rem" },
                color: "#94a3b8",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Caretaker
            </Typography>

            <LoginBtn
              label="Login as Caretaker"
              icon={<EngineeringIcon sx={{ fontSize: "15px !important" }} />}
              onClick={() => navigate("/caretaker/login")}
              disabled={!isSecretaryRegistered}
              color="#059669"
              hoverColor="#047857"
              disabledBg="#dcfce7"
              disabledColor="#86efac"
            />
          </Box>

          {/* Footer */}
          <Box
            sx={{
              bgcolor: "#f8fafc",
              px: 3,
              py: { xs: 1, sm: 1.5 },
              textAlign: "center",
              borderTop: "1px solid #e0f2fe",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.6rem", sm: "0.65rem" },
                color: "#94a3b8",
              }}
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
