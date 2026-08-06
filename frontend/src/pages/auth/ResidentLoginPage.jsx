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
    if (!/^\d{10}$/.test(mobile))
      e.mobile = "Mobile number must be exactly 10 digits";
    if (!wingName) e.wingName = "Please select a wing";
    if (!/^\d{3,4}$/.test(flatNumber))
      e.flatNumber = "Flat number must be 3 or 4 digits";
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
      showError(
        err.response?.data?.message || "Resident not found with these details",
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
                    const v = e.target.value;
                    if (/^\d*$/.test(v) && v.length <= 10) {
                      setMobile(v);
                      setErrors((prev) => ({ ...prev, mobile: "" }));
                    }
                  }}
                  size="small"
                  fullWidth
                  placeholder="10 digit mobile number"
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                  sx={fieldStyle}
                  inputprops={{ maxLength: 10 }}
                />

                <FormControl
                  size="small"
                  error={!!errors.wingName}
                  sx={fieldStyle}
                >
                  <InputLabel>Wing *</InputLabel>
                  <Select
                    value={wingName}
                    onChange={(e) => {
                      setWingName(e.target.value);
                      setErrors((prev) => ({ ...prev, wingName: "" }));
                    }}
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
                  {errors.wingName && (
                    <Typography
                      sx={{
                        color: "#d32f2f",
                        fontSize: "0.72rem",
                        mt: 0.5,
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
                      setErrors((prev) => ({ ...prev, flatNumber: "" }));
                    }
                  }}
                  size="small"
                  fullWidth
                  placeholder="3 or 4 digit flat number e.g. 150"
                  error={!!errors.flatNumber}
                  helperText={
                    errors.flatNumber || "Enter 3-4 digit flat number"
                  }
                  sx={fieldStyle}
                  inputprops={{ maxLength: 4 }}
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
                  {loading ? "Verifying..." : "Send OTP"}
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
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.72rem",
                      color: "#059669",
                      fontWeight: 700,
                      mt: 0.5,
                    }}
                  >
                    Your OTP: 123456
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
                      setErrors({});
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
                    onClick={() => {
                      setOtp("");
                      handleSendOTP();
                    }}
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
