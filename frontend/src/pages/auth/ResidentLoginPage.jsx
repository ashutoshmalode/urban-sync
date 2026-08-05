import { useState, useEffect, useRef } from "react";
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
import { auth } from "../../config/firebase";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { setCredentials } from "../../features/auth/authSlice";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
};

const wings = ["A", "B", "C", "D", "E"];

const ResidentLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recaptchaRef = useRef(null);

  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState("");
  const [wingName, setWingName] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const getRecaptcha = async () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container-resident",
        { size: "invisible" },
      );
      await recaptchaRef.current.render();
    }
    return recaptchaRef.current;
  };

  const clearRecaptcha = () => {
    try {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    } catch (e) {}
  };

  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      showError("Enter valid 10 digit mobile number");
      return;
    }
    if (!wingName) {
      showError("Please select wing");
      return;
    }
    if (!flatNumber.trim()) {
      showError("Please enter flat number");
      return;
    }
    setLoading(true);
    try {
      clearRecaptcha(); // always start clean
      const appVerifier = await getRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        `+91${mobile}`,
        appVerifier,
      );
      setConfirmationResult(result);
      setStep(1);
      setTimer(30);
      showSuccess(`OTP sent to +91${mobile}`);
    } catch (err) {
      showError("Failed to send OTP: " + err.message);
      clearRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!/^\d{6}$/.test(otp)) {
      showError("Enter valid 6 digit OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseToken = await result.user.getIdToken();

      const res = await axiosInstance.post("/api/auth/otp-login", {
        firebaseToken,
        role: "RESIDENT",
        wingName,
        flatNumber,
      });

      dispatch(
        setCredentials({
          token: res.data.token,
          role: res.data.role,
          loginIdentifier: res.data.loginIdentifier,
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

  const handleResendOTP = async () => {
    setOtp("");
    clearRecaptcha();
    await handleSendOTP();
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
            <Typography variant="h6" fontWeight={700} color="white">
              UrbanSync
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              Resident Login
            </Typography>
          </Box>

          <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
            <Stepper activeStep={step} sx={{ mb: 3 }}>
              {["Your Details", "Verify OTP"].map((label) => (
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
                    if (
                      /^\d*$/.test(e.target.value) &&
                      e.target.value.length <= 10
                    )
                      setMobile(e.target.value);
                  }}
                  size="small"
                  fullWidth
                  placeholder="10 digit mobile number"
                  sx={fieldStyle}
                />

                <FormControl size="small" sx={fieldStyle}>
                  <InputLabel>Wing *</InputLabel>
                  <Select
                    value={wingName}
                    onChange={(e) => setWingName(e.target.value)}
                    label="Wing *"
                  >
                    {wings.map((w) => (
                      <MenuItem
                        key={w}
                        value={w}
                        sx={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Wing {w}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Flat Number *"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="e.g. 201"
                  sx={fieldStyle}
                />

                {/* Invisible recaptcha container */}
                <div id="recaptcha-container-resident"></div>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSendOTP}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <HomeIcon />
                    )
                  }
                  sx={{
                    bgcolor: "#0891b2",
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    py: 1.1,
                    "&:hover": { bgcolor: "#0e7490" },
                  }}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#f0f9ff",
                    borderRadius: 2,
                    border: "1px solid #e0f2fe",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.78rem",
                      color: "#0891b2",
                      fontWeight: 600,
                    }}
                  >
                    OTP sent to +91{mobile}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.72rem",
                      color: "#64748b",
                    }}
                  >
                    Wing {wingName} — Flat {flatNumber}
                  </Typography>
                </Box>

                <TextField
                  label="Enter 6-digit OTP *"
                  value={otp}
                  onChange={(e) => {
                    if (
                      /^\d*$/.test(e.target.value) &&
                      e.target.value.length <= 6
                    )
                      setOtp(e.target.value);
                  }}
                  size="small"
                  fullWidth
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
                    bgcolor: "#0891b2",
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    py: 1.1,
                    "&:hover": { bgcolor: "#0e7490" },
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
                      clearRecaptcha();
                    }}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#64748b",
                      textTransform: "none",
                      fontSize: "0.78rem",
                    }}
                  >
                    ← Change Details
                  </Button>
                  <Button
                    size="small"
                    onClick={handleResendOTP}
                    disabled={timer > 0 || loading}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#0891b2",
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

export default ResidentLoginPage;
