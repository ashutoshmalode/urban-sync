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
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { setCredentials } from "../../features/auth/authSlice";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    "&.Mui-focused fieldset": { borderColor: "#059669" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#059669" },
  "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
};

const CaretakerLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [mobileError, setMobileError] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setMobileError("Mobile number must be exactly 10 digits");
      return;
    }
    setMobileError("");
    setLoading(true);
    try {
      await axiosInstance.post("/api/auth/send-otp", {
        mobile,
        role: "CARETAKER",
      });
      setStep(1);
      setTimer(30);
      setOtp("");
      showSuccess("OTP sent! Use 654321 to login");
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Caretaker not found with this mobile number",
      );
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
        role: "CARETAKER",
      });
      dispatch(
        setCredentials({
          token: res.data.token,
          role: res.data.role,
          loginIdentifier: res.data.loginIdentifier,
        }),
      );
      showSuccess("Login successful!");
      navigate("/caretaker/dashboard");
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
        bgcolor: "#f0f9ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
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
          <Box
            sx={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              py: 3,
              px: 3,
              textAlign: "center",
            }}
          >
            <ApartmentIcon sx={{ fontSize: 36, color: "white", mb: 0.5 }} />
            <Typography variant="h6" fontWeight={700} color="white">
              UrbanSync
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Caretaker Login
            </Typography>
          </Box>

          <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
            <Stepper activeStep={step} sx={{ mb: 3 }}>
              {["Mobile Number", "Verify OTP"].map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.75rem",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {step === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Mobile Number *"
                  value={mobile}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v) && v.length <= 10) {
                      setMobile(v);
                      setMobileError("");
                    }
                  }}
                  size="small"
                  fullWidth
                  placeholder="10 digit mobile number"
                  error={!!mobileError}
                  helperText={
                    mobileError || "Enter your registered mobile number"
                  }
                  inputprops={{ maxLength: 10 }}
                  sx={fieldStyle}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSendOTP}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <EngineeringIcon />
                    )
                  }
                  sx={{
                    bgcolor: "#059669",
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    py: 1.1,
                    "&:hover": { bgcolor: "#047857" },
                  }}
                >
                  {loading ? "Verifying..." : "Send OTP"}
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#f0fdf4",
                    borderRadius: 2,
                    border: "1px solid #bbf7d0",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.78rem",
                      color: "#059669",
                      fontWeight: 600,
                    }}
                  >
                    OTP sent to +91{mobile}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.72rem",
                      color: "#059669",
                      fontWeight: 700,
                      mt: 0.5,
                    }}
                  >
                    Your OTP: 654321
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
                  placeholder="Enter 6 digit OTP"
                  helperText={
                    otp.length > 0 && otp.length < 6
                      ? `${6 - otp.length} more digits needed`
                      : ""
                  }
                  inputprops={{ maxLength: 6 }}
                  sx={fieldStyle}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                  sx={{
                    bgcolor: "#059669",
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    py: 1.1,
                    "&:hover": { bgcolor: "#047857" },
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
                      setMobileError("");
                    }}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#64748b",
                      textTransform: "none",
                      fontSize: "0.78rem",
                    }}
                  >
                    ← Change Number
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
                      color: "#059669",
                      textTransform: "none",
                      fontSize: "0.78rem",
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
                mt: 1.5,
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                textTransform: "none",
                fontSize: "0.78rem",
              }}
            >
              ← Back to Home
            </Button>
          </Box>

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

export default CaretakerLoginPage;
