import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeIcon from "@mui/icons-material/Home";
import { setCredentials } from "../../features/auth/authSlice";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";
import CityBackground from "../../components/CityBackground";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    fontSize: "0.82rem",
    "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: "0.82rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
  "& .MuiFormHelperText-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: "0.65rem",
  },
};

const wings = ["A", "B", "C", "D", "E"];

const ResidentLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState("");
  const [wingName, setWingName] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const validateStep0 = () => {
    const e = {};
    if (!/^\d{10}$/.test(mobile)) e.mobile = "Must be 10 digits";
    if (!wingName) e.wingName = "Select a wing";
    if (!/^\d{3,4}$/.test(flatNumber)) e.flatNumber = "3 or 4 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateStep0()) return;
    setLoading(true);
    try {
      await axiosInstance.post("/api/auth/send-otp", {
        mobile,
        role: "RESIDENT",
        wingName,
        flatNumber,
      });
      setStep(1);
      setTimer(30);
      setOtp("");
      showSuccess("OTP sent! Use 123456 to login");
    } catch (err) {
      showError(err.response?.data?.message || "Resident not found");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      showError("Enter valid 6 digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/verify-otp", {
        mobile,
        otp,
        role: "RESIDENT",
        wingName,
        flatNumber,
      });
      dispatch(
        setCredentials({
          token: res.data.token,
          role: res.data.role,
          loginIdentifier: res.data.loginIdentifier,
          flatNumber: wingName.toUpperCase() + "-" + flatNumber,
        }),
      );
      showSuccess("Login successful!");
      navigate("/resident/dashboard");
    } catch (err) {
      showError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f3ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1.5, sm: 3 },
        position: "relative",
      }}
    >
      <CityBackground />
      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #ede9fe",
            boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              py: { xs: 1.8, sm: 2.5 },
              px: 3,
              textAlign: "center",
            }}
          >
            <ApartmentIcon
              sx={{ fontSize: { xs: 26, sm: 32 }, color: "white", mb: 0.3 }}
            />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                color: "white",
              }}
            >
              UrbanSync
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.72rem" },
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Resident Login
            </Typography>
          </Box>

          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              pt: { xs: 1.8, sm: 2.5 },
              pb: { xs: 2, sm: 3 },
            }}
          >
            <Stepper
              activeStep={step}
              sx={{
                mb: { xs: 2, sm: 3 },
                "& .MuiStepIcon-root.Mui-active": { color: "#7c3aed" },
                "& .MuiStepIcon-root.Mui-completed": { color: "#7c3aed" },
              }}
            >
              {["Your Details", "Verify OTP"].map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontFamily: "Inter, sans-serif",
                        fontSize: { xs: "0.65rem", sm: "0.72rem" },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {step === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1.2, sm: 1.8 },
                }}
              >
                <TextField
                  label="Mobile Number *"
                  value={mobile}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v) && v.length <= 10) {
                      setMobile(v);
                      setErrors((p) => ({ ...p, mobile: "" }));
                    }
                  }}
                  size="small"
                  fullWidth
                  placeholder="10 digit mobile"
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                  sx={fieldStyle}
                />

                <FormControl
                  size="small"
                  error={!!errors.wingName}
                  sx={fieldStyle}
                >
                  <InputLabel
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    Wing *
                  </InputLabel>
                  <Select
                    value={wingName}
                    onChange={(e) => {
                      setWingName(e.target.value);
                      setErrors((p) => ({ ...p, wingName: "" }));
                    }}
                    label="Wing *"
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    {wings.map((w) => (
                      <MenuItem
                        key={w}
                        value={w}
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.82rem",
                        }}
                      >
                        Wing {w}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.wingName && (
                    <Typography
                      sx={{
                        color: "#d32f2f",
                        fontSize: "0.65rem",
                        mt: 0.4,
                        ml: 1.5,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {errors.wingName}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  label="Flat Number *"
                  value={flatNumber}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v) && v.length <= 4) {
                      setFlatNumber(v);
                      setErrors((p) => ({ ...p, flatNumber: "" }));
                    }
                  }}
                  size="small"
                  fullWidth
                  placeholder="e.g. 150"
                  error={!!errors.flatNumber}
                  helperText={errors.flatNumber || "3-4 digit flat number"}
                  sx={fieldStyle}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSendOTP}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <HomeIcon sx={{ fontSize: "16px !important" }} />
                    )
                  }
                  sx={{
                    bgcolor: "#7c3aed",
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    py: { xs: 0.8, sm: 1 },
                    fontSize: { xs: "0.82rem", sm: "0.875rem" },
                    "&:hover": { bgcolor: "#6d28d9" },
                    "&.Mui-disabled": { bgcolor: "#ede9fe", color: "#a78bfa" },
                  }}
                >
                  {loading ? "Verifying..." : "Send OTP"}
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1.2, sm: 1.8 },
                }}
              >
                <Box
                  sx={{
                    p: 1.2,
                    bgcolor: "#f5f3ff",
                    borderRadius: 2,
                    border: "1px solid #ede9fe",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.72rem", sm: "0.78rem" },
                      color: "#7c3aed",
                      fontWeight: 600,
                    }}
                  >
                    OTP sent to +91{mobile}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.65rem", sm: "0.72rem" },
                      color: "#64748b",
                    }}
                  >
                    Wing {wingName} - Flat {flatNumber}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.68rem", sm: "0.72rem" },
                      color: "#7c3aed",
                      fontWeight: 700,
                      mt: 0.3,
                    }}
                  >
                    Dev OTP: 123456
                  </Typography>
                </Box>

                <TextField
                  label="Enter 6-digit OTP *"
                  value={otp}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v) && v.length <= 6) setOtp(v);
                  }}
                  size="small"
                  fullWidth
                  placeholder="6 digit OTP"
                  helperText={
                    otp.length > 0 && otp.length < 6
                      ? `${6 - otp.length} more digits`
                      : ""
                  }
                  sx={fieldStyle}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  startIcon={
                    loading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : null
                  }
                  sx={{
                    bgcolor: "#7c3aed",
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    py: { xs: 0.8, sm: 1 },
                    fontSize: { xs: "0.82rem", sm: "0.875rem" },
                    "&:hover": { bgcolor: "#6d28d9" },
                    "&.Mui-disabled": { bgcolor: "#ede9fe", color: "#a78bfa" },
                  }}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => {
                      setStep(0);
                      setOtp("");
                      setErrors({});
                    }}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#64748b",
                      textTransform: "none",
                      fontSize: { xs: "0.7rem", sm: "0.78rem" },
                    }}
                  >
                    ← Change Details
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setOtp("");
                      handleSendOTP();
                    }}
                    disabled={timer > 0 || loading}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#7c3aed",
                      textTransform: "none",
                      fontSize: { xs: "0.7rem", sm: "0.78rem" },
                    }}
                  >
                    {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                  </Button>
                </Box>
              </Box>
            )}

            <Button
              fullWidth
              onClick={() => navigate("/")}
              sx={{
                mt: { xs: 1, sm: 1.5 },
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                textTransform: "none",
                fontSize: { xs: "0.7rem", sm: "0.78rem" },
              }}
            >
              ← Back to Home
            </Button>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              bgcolor: "#f5f3ff",
              px: 3,
              py: { xs: 1, sm: 1.5 },
              textAlign: "center",
              borderTop: "1px solid #ede9fe",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.6rem",
                color: "#94a3b8",
              }}
            >
              © 2026 UrbanSync - CDAC Final Project
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResidentLoginPage;
