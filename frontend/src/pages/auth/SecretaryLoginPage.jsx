import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginIcon from "@mui/icons-material/Login";
import SendIcon from "@mui/icons-material/Send";
import LockResetIcon from "@mui/icons-material/LockReset";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { setCredentials } from "../../features/auth/authSlice";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";

const fs = (isMobile) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.82rem" : "0.875rem",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.82rem" : "0.875rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiFormHelperText-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: "0.62rem",
  },
});

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "", progress: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*#?&]/.test(password)) score++;
  if (score <= 2)
    return {
      score,
      label: "Weak",
      color: "#dc2626",
      bg: "#fee2e2",
      progress: 33,
    };
  if (score <= 3)
    return {
      score,
      label: "Medium",
      color: "#d97706",
      bg: "#fef3c7",
      progress: 66,
    };
  return {
    score,
    label: "Strong",
    color: "#059669",
    bg: "#dcfce7",
    progress: 100,
  };
};

// ── Forgot Password Modal ────────────────────────────────────────────────────
const ForgotPasswordModal = ({ open, onClose }) => {
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpw, 3=success
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const pwStrength = getPasswordStrength(newPassword);

  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/;

  // OTP countdown
  useState(() => {
    if (otpTimer > 0) {
      const t = setInterval(() => setOtpTimer((p) => p - 1), 1000);
      return () => clearInterval(t);
    }
  }, [otpTimer]);

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setEmailError("");
    setOtp("");
    setNewPassword("");
    setPwError("");
    setOtpError("");
    setOtpSent(false);
    setOtpTimer(0);
    onClose();
  };

  const handleSendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError("");
    setSendingOtp(true);
    try {
      await axiosInstance.post(
        `/api/secretary/forgot-password/send-otp?email=${encodeURIComponent(email)}`,
      );
      setOtpSent(true);
      setOtpTimer(60);
      setStep(2);
      showSuccess("OTP sent to your registered email!");
    } catch (err) {
      setEmailError(
        err.response?.data?.message ||
          "No secretary account found with this email",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingOtp(true);
    try {
      await axiosInstance.post(
        `/api/secretary/forgot-password/send-otp?email=${encodeURIComponent(email)}`,
      );
      setOtpTimer(60);
      showSuccess("OTP resent!");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleReset = async () => {
    let hasError = false;
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit OTP");
      hasError = true;
    } else setOtpError("");
    if (!pwRegex.test(newPassword)) {
      setPwError(
        "8-15 chars: uppercase, lowercase, number, special character (@$!%*#?&)",
      );
      hasError = true;
    } else setPwError("");
    if (hasError) return;

    setResetting(true);
    try {
      await axiosInstance.post("/api/secretary/forgot-password/reset", {
        email,
        otp,
        newPassword,
      });
      setStep(3);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Reset failed. Check OTP and try again.",
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, mx: { xs: 1.5, sm: 3 } } } }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: { xs: "0.88rem", sm: "0.95rem" },
          color: "#1e293b",
          borderBottom: "1px solid #e0f2fe",
          py: 1.5,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <LockResetIcon sx={{ color: "#0891b2", fontSize: 16 }} />
        {step === 1
          ? "Forgot Password"
          : step === 2
            ? "Reset Password"
            : "Password Reset!"}
      </DialogTitle>

      <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
        {/* Step 1 — Enter email */}
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              sx={{
                p: 1.2,
                bgcolor: "#f0f9ff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.68rem", sm: "0.75rem" },
                  color: "#64748b",
                }}
              >
                Enter your registered secretary email. We'll send a 6-digit OTP
                to reset your password.
              </Typography>
            </Box>
            <TextField
              label="Registered Email *"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendOtp()}
              size="small"
              fullWidth
              error={!!emailError}
              helperText={emailError}
              sx={fs(true)}
            />
          </Box>
        )}

        {/* Step 2 — OTP + new password */}
        {step === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              sx={{
                p: 1.2,
                bgcolor: "#f0f9ff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.68rem", sm: "0.75rem" },
                  color: "#0891b2",
                  fontWeight: 600,
                  mb: 0.2,
                }}
              >
                OTP sent to: {email}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.62rem", sm: "0.68rem" },
                  color: "#64748b",
                }}
              >
                Enter the OTP and set your new password below.
              </Typography>
            </Box>

            {/* OTP field */}
            <TextField
              label="6-digit OTP *"
              value={otp}
              onChange={(e) => {
                if (/^\d{0,6}$/.test(e.target.value)) {
                  setOtp(e.target.value);
                  setOtpError("");
                }
              }}
              size="small"
              fullWidth
              error={!!otpError}
              helperText={
                otpError ||
                (otp.length > 0 && otp.length < 6
                  ? `${6 - otp.length} more digits`
                  : "")
              }
              sx={fs(true)}
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  style: {
                    letterSpacing: "0.3em",
                    textAlign: "center",
                    fontSize: "1rem",
                  },
                },
              }}
            />

            {/* Resend OTP */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                size="small"
                onClick={handleResendOtp}
                disabled={sendingOtp || otpTimer > 0}
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#0891b2",
                  textTransform: "none",
                  fontSize: "0.72rem",
                }}
              >
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
              </Button>
            </Box>

            {/* New password */}
            <TextField
              label="New Password *"
              type={showNewPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwError("");
              }}
              size="small"
              fullWidth
              error={!!pwError}
              helperText={pwError}
              sx={fs(true)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
                      >
                        {newPassword && (
                          <Box
                            sx={{
                              px: 0.8,
                              py: 0.1,
                              borderRadius: 1,
                              bgcolor: pwStrength.bg,
                              border: `1px solid ${pwStrength.color}20`,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                color: pwStrength.color,
                              }}
                            >
                              {pwStrength.label}
                            </Typography>
                          </Box>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => setShowNewPw(!showNewPw)}
                        >
                          {showNewPw ? (
                            <VisibilityOff sx={{ fontSize: 16 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {newPassword && (
              <Box sx={{ mt: -0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={pwStrength.progress}
                  sx={{
                    height: 3,
                    borderRadius: 2,
                    bgcolor: "#f1f5f9",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: pwStrength.color,
                      borderRadius: 2,
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.6rem",
                    color: "#94a3b8",
                    mt: 0.3,
                  }}
                >
                  8-15 chars • uppercase • lowercase • number • special
                  (@$!%*#?&)
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <Box sx={{ textAlign: "center", py: 1.5 }}>
            <CheckCircleIcon
              sx={{ fontSize: { xs: 44, sm: 52 }, color: "#059669", mb: 1.2 }}
            />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                color: "#1e293b",
                mb: 0.8,
              }}
            >
              Password Reset Successful!
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.72rem", sm: "0.8rem" },
                color: "#64748b",
              }}
            >
              Your password has been updated. You can now login with your new
              password.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{ px: 2, py: 1.5, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
      >
        {step === 1 && (
          <>
            <Button
              onClick={handleClose}
              size="small"
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#64748b",
                textTransform: "none",
                fontSize: "0.78rem",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSendOtp}
              disabled={sendingOtp || !email}
              startIcon={
                sendingOtp ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: "13px !important" }} />
                )
              }
              sx={{
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: "0.78rem",
                bgcolor: "#0891b2",
                borderRadius: 2,
                "&:hover": { bgcolor: "#0e7490" },
              }}
            >
              {sendingOtp ? "Sending..." : "Send OTP"}
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button
              size="small"
              onClick={() => setStep(1)}
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#64748b",
                textTransform: "none",
                fontSize: "0.78rem",
              }}
            >
              ← Back
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleReset}
              disabled={resetting || otp.length !== 6 || !newPassword}
              startIcon={
                resetting ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <LockResetIcon sx={{ fontSize: "13px !important" }} />
                )
              }
              sx={{
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: "0.78rem",
                bgcolor: "#059669",
                borderRadius: 2,
                "&:hover": { bgcolor: "#047857" },
                "&.Mui-disabled": { bgcolor: "#bae6fd", color: "white" },
              }}
            >
              {resetting ? "Resetting..." : "Reset Password"}
            </Button>
          </>
        )}
        {step === 3 && (
          <Button
            variant="contained"
            size="small"
            onClick={handleClose}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#0891b2",
              borderRadius: 2,
              "&:hover": { bgcolor: "#0e7490" },
            }}
          >
            Login Now
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ── Main Login Page ──────────────────────────────────────────────────────────
const SecretaryLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ loginIdentifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    if (!form.loginIdentifier || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.loginIdentifier)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/api/auth/login", form);
      dispatch(
        setCredentials({
          token: res.data.token,
          role: res.data.role,
          loginIdentifier: res.data.loginIdentifier,
        }),
      );
      navigate("/secretary/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
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
              textAlign: "center",
            }}
          >
            <ApartmentIcon
              sx={{ fontSize: { xs: 28, sm: 32 }, color: "white", mb: 0.3 }}
            />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                color: "white",
              }}
            >
              Secretary Login
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                color: "rgba(255,255,255,0.85)",
              }}
            >
              UrbanSync Society Management
            </Typography>
          </Box>

          {/* Form */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  borderRadius: 1.5,
                  py: 0.4,
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              label="Email Address"
              name="loginIdentifier"
              type="email"
              value={form.loginIdentifier}
              onChange={handleChange}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              fullWidth
              size="small"
              sx={fs(true)}
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              fullWidth
              size="small"
              sx={fs(true)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: 16 }} />
                        ) : (
                          <Visibility sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Forgot Password link — now clickable */}
            <Box sx={{ textAlign: "right", mt: -0.5 }}>
              <Typography
                onClick={() => setForgotOpen(true)}
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  color: "#0891b2",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot Password?
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading || !form.loginIdentifier || !form.password}
              startIcon={
                loading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <LoginIcon sx={{ fontSize: "16px !important" }} />
                )
              }
              sx={{
                py: { xs: 0.8, sm: 1 },
                borderRadius: 1.5,
                bgcolor: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.82rem", sm: "0.875rem" },
                boxShadow: "0 2px 6px rgba(8,145,178,0.25)",
                "&:hover": { bgcolor: "#0e7490" },
                "&.Mui-disabled": { bgcolor: "#bae6fd", color: "white" },
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link
                component="button"
                onClick={() => navigate("/")}
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.72rem", sm: "0.78rem" },
                  color: "#0891b2",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.3,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 13 }} /> Back to Home
              </Link>
            </Box>
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
                fontSize: "0.6rem",
                color: "#94a3b8",
              }}
            >
              © 2026 UrbanSync — CDAC Final Project
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </Box>
  );
};

export default SecretaryLoginPage;
