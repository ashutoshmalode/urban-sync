import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Alert,
  Chip,
  Grid,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
  useMediaQuery,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BadgeIcon from "@mui/icons-material/Badge";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";

const wings = ["A", "B", "C", "D", "E"];

const fieldStyle = (isMobile) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiFormHelperText-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.6rem" : "0.68rem",
  },
});

const InfoRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: { xs: 1.2, sm: 2 },
      py: { xs: 1.2, sm: 1.5 },
      borderBottom: "1px solid #f1f5f9",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Box
      sx={{
        width: { xs: 28, sm: 34 },
        height: { xs: 28, sm: 34 },
        borderRadius: 2,
        bgcolor: "#f0f9ff",
        border: "1px solid #e0f2fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: 0.2,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: { xs: "0.6rem", sm: "0.7rem" },
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
          mb: 0.2,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: "0.8rem", sm: "0.9rem" },
          fontWeight: 600,
          color: "#1e293b",
          fontFamily: "Inter, sans-serif",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const SectionCard = ({ title, icon, children }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid #e0f2fe",
      overflow: "hidden",
      height: "100%",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
    }}
  >
    <Box
      sx={{
        px: { xs: 2, sm: 2.5 },
        py: { xs: 1.5, sm: 1.8 },
        bgcolor: "#f8fbff",
        borderBottom: "1px solid #e0f2fe",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1.5,
          bgcolor: "#e0f2fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: { xs: "0.7rem", sm: "0.78rem" },
          fontWeight: 700,
          color: "#0891b2",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {title}
      </Typography>
    </Box>
    <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1 }}>{children}</Box>
  </Paper>
);

// ── Edit modal — 3 steps ─────────────────────────────────────────────────────
// Step 1: Fill all fields
// Step 2: Send OTP to email + enter current password + OTP
// Step 3: Success
const EditModal = ({ open, onClose, profile, onSaved }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [step, setStep] = useState(1); // 1 = form, 2 = verify, 3 = success
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    wingName: "",
    flatNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [errors, setErrors] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [saving, setSaving] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Populate form from profile when modal opens
  useEffect(() => {
    if (open && profile) {
      // Parse wing + flat from "A-150" format
      const parts = (profile.flatNumber || "").split("-");
      const wing = parts.length >= 2 ? parts[0] : "";
      const flat =
        parts.length >= 2 ? parts.slice(1).join("-") : profile.flatNumber || "";
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        mobileNumber: profile.mobileNumber || "",
        wingName: wing,
        flatNumber: flat,
        bankName: profile.bankName || "",
        accountNumber: profile.accountNumber || "",
        ifscCode: profile.ifscCode || "",
      });
      setStep(1);
      setErrors({});
      setCurrentPassword("");
      setEmailOtp("");
      setOtpSent(false);
      setOtpTimer(0);
      setVerifyError("");
    }
  }, [open, profile]);

  // OTP countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setInterval(() => setOtpTimer((p) => p - 1), 1000);
      return () => clearInterval(t);
    }
  }, [otpTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      ["firstName", "lastName", "bankName"].includes(name) &&
      value &&
      !/^[a-zA-Z\s]*$/.test(value)
    )
      return;
    if (name === "mobileNumber" && (!/^\d*$/.test(value) || value.length > 10))
      return;
    if (name === "accountNumber" && !/^\d*$/.test(value)) return;
    if (
      name === "ifscCode" &&
      (!/^[a-zA-Z0-9]*$/.test(value) || value.length > 11)
    )
      return;
    if (name === "flatNumber" && (!/^\d*$/.test(value) || value.length > 4))
      return;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!/^\d{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Must be 10 digits";
    if (!form.wingName) e.wingName = "Select a wing";
    if (!form.flatNumber || form.flatNumber.length < 1)
      e.flatNumber = "Required";
    if (!form.bankName.trim()) e.bankName = "Required";
    if (!form.accountNumber.trim()) e.accountNumber = "Required";
    if (!form.ifscCode.trim()) e.ifscCode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await axiosInstance.post("/api/secretary/send-email-otp");
      setOtpSent(true);
      setOtpTimer(60);
      showSuccess("OTP sent to your registered email!");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSave = async () => {
    if (!currentPassword) {
      setVerifyError("Current password is required");
      return;
    }
    if (!otpSent) {
      setVerifyError("Please send OTP first");
      return;
    }
    if (emailOtp.length !== 6) {
      setVerifyError("Enter the 6-digit OTP");
      return;
    }

    setSaving(true);
    setVerifyError("");
    try {
      await axiosInstance.put("/api/secretary/profile", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        mobileNumber: form.mobileNumber,
        flatNumber: `${form.wingName}-${form.flatNumber}`,
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim().toUpperCase(),
        currentPassword,
        emailOtp,
      });
      onSaved();
      onClose();
      showSuccess("Profile updated successfully!");
    } catch (err) {
      setVerifyError(
        err.response?.data?.message || "Update failed. Check password and OTP.",
      );
    } finally {
      setSaving(false);
    }
  };

  const fs = fieldStyle(isMobile);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, mx: { xs: 1, sm: 3 } } } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: { xs: "0.9rem", sm: "1rem" },
          color: "#1e293b",
          borderBottom: "1px solid #e0f2fe",
          py: 1.5,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <EditIcon sx={{ color: "#0891b2", fontSize: 16 }} />
        {step === 1
          ? "Edit Profile"
          : step === 2
            ? "Verify & Save"
            : "Profile Updated!"}
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, pt: 2, pb: 1 }}>
        {/* ── STEP 1: Edit form ─────────────────────────────────────── */}
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Personal */}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.65rem",
                color: "#0891b2",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Personal Details
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}
            >
              <TextField
                label="First Name *"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                size="small"
                error={!!errors.firstName}
                helperText={errors.firstName || "Letters only"}
                sx={fs}
              />
              <TextField
                label="Last Name *"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                size="small"
                error={!!errors.lastName}
                helperText={errors.lastName || "Letters only"}
                sx={fs}
              />
            </Box>

            <TextField
              label="Email Address *"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              sx={fs}
            />

            <TextField
              label="Mobile Number *"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              sx={fs}
            />

            {/* Wing + Flat */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}
            >
              <FormControl size="small" error={!!errors.wingName} sx={fs}>
                <InputLabel
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: isMobile ? "0.78rem" : "0.875rem",
                  }}
                >
                  Wing *
                </InputLabel>
                <Select
                  name="wingName"
                  value={form.wingName}
                  onChange={handleChange}
                  label="Wing *"
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: isMobile ? "0.78rem" : "0.875rem",
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
                      fontSize: "0.6rem",
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
                name="flatNumber"
                value={form.flatNumber}
                onChange={handleChange}
                size="small"
                error={!!errors.flatNumber}
                helperText={errors.flatNumber || "e.g. 150"}
                sx={fs}
              />
            </Box>

            {form.wingName && form.flatNumber && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#f0f9ff",
                  borderRadius: 1.5,
                  px: 1.2,
                  py: 0.7,
                  border: "1px solid #e0f2fe",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.68rem",
                    color: "#64748b",
                  }}
                >
                  Flat saved as:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#0891b2",
                  }}
                >
                  {form.wingName}-{form.flatNumber}
                </Typography>
              </Box>
            )}

            <Divider sx={{ borderColor: "#e0f2fe" }} />

            {/* Bank */}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.65rem",
                color: "#0891b2",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Bank Details
            </Typography>

            <TextField
              label="Bank Name *"
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.bankName}
              helperText={errors.bankName || "Letters only"}
              sx={fs}
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}
            >
              <TextField
                label="Account Number *"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                size="small"
                error={!!errors.accountNumber}
                helperText={errors.accountNumber}
                sx={fs}
              />
              <TextField
                label="IFSC Code *"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                size="small"
                error={!!errors.ifscCode}
                helperText={errors.ifscCode || "Alphanumeric"}
                sx={fs}
              />
            </Box>
          </Box>
        )}

        {/* ── STEP 2: Verify ───────────────────────────────────────── */}
        {step === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Info box */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f0f9ff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.72rem", sm: "0.8rem" },
                  color: "#0891b2",
                  fontWeight: 600,
                  mb: 0.3,
                }}
              >
                Security Verification Required
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.65rem", sm: "0.72rem" },
                  color: "#64748b",
                }}
              >
                Enter your current password and the OTP sent to your registered
                email to confirm changes.
              </Typography>
            </Box>

            {verifyError && (
              <Alert
                severity="error"
                onClose={() => setVerifyError("")}
                sx={{
                  borderRadius: 2,
                  fontFamily: "Inter, sans-serif",
                  py: 0.4,
                  fontSize: { xs: "0.72rem", sm: "0.8rem" },
                }}
              >
                {verifyError}
              </Alert>
            )}

            {/* Current password */}
            <TextField
              label="Current Password *"
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size="small"
              fullWidth
              sx={fs}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
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

            <Divider sx={{ borderColor: "#e0f2fe" }} />

            {/* OTP section */}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.65rem",
                color: "#0891b2",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Email OTP
            </Typography>

            <Box
              sx={{
                p: 1.2,
                bgcolor: "#f8fbff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.65rem", sm: "0.72rem" },
                  color: "#64748b",
                }}
              >
                OTP will be sent to:{" "}
                <strong style={{ color: "#0891b2" }}>{profile.email}</strong>
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              onClick={handleSendOtp}
              disabled={sendingOtp || otpTimer > 0}
              startIcon={
                sendingOtp ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: "13px !important" }} />
                )
              }
              sx={{
                borderRadius: 2,
                borderColor: "#0891b2",
                color: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                textTransform: "none",
                fontSize: { xs: "0.72rem", sm: "0.78rem" },
              }}
            >
              {sendingOtp
                ? "Sending..."
                : otpTimer > 0
                  ? `Resend in ${otpTimer}s`
                  : otpSent
                    ? "Resend OTP"
                    : "Send OTP to Email"}
            </Button>

            {otpSent && (
              <TextField
                label="Enter 6-digit OTP *"
                value={emailOtp}
                onChange={(e) => {
                  if (/^\d{0,6}$/.test(e.target.value))
                    setEmailOtp(e.target.value);
                }}
                size="small"
                fullWidth
                sx={fs}
                helperText={
                  emailOtp.length > 0 && emailOtp.length < 6
                    ? `${6 - emailOtp.length} more digits`
                    : ""
                }
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
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          gap: 0.8,
          borderTop: "1px solid #e0f2fe",
        }}
      >
        {step === 1 && (
          <>
            <Button
              onClick={onClose}
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
              onClick={handleNextStep}
              sx={{
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: "0.78rem",
                bgcolor: "#0891b2",
                borderRadius: 2,
                "&:hover": { bgcolor: "#0e7490" },
              }}
            >
              Next — Verify
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
              onClick={handleSave}
              disabled={
                saving || !currentPassword || !otpSent || emailOtp.length !== 6
              }
              startIcon={
                saving ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <SaveIcon sx={{ fontSize: "13px !important" }} />
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
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ── Main ProfilePage ─────────────────────────────────────────────────────────
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const loadProfile = () => {
    setLoading(true);
    axiosInstance
      .get("/api/secretary/profile")
      .then((res) => setProfile(res.data))
      .catch(() => setError("Failed to load profile. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading)
    return (
      <Box>
        <Skeleton
          variant="rounded"
          height={90}
          sx={{ mb: 2, borderRadius: 3 }}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );

  if (error)
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 2, fontFamily: "Inter, sans-serif" }}
      >
        {error}
      </Alert>
    );

  return (
    <Box sx={{ fontFamily: "Inter, sans-serif" }}>
      {/* Profile Hero Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          mb: { xs: 2, sm: 2.5 },
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            flexWrap: "nowrap",
          }}
        >
          <Avatar
            sx={{
              width: { xs: 44, sm: 56 },
              height: { xs: 44, sm: 56 },
              bgcolor: "rgba(255,255,255,0.2)",
              fontSize: { xs: "1.1rem", sm: "1.6rem" },
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              border: "2px solid rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}
          >
            {profile?.firstName?.[0]}
            {profile?.lastName?.[0]}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "0.9rem", sm: "1.2rem" },
                fontWeight: 800,
                color: "white",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.68rem", sm: "0.8rem" },
                color: "rgba(255,255,255,0.8)",
                fontFamily: "Inter, sans-serif",
                mt: 0.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile.email}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.6,
              flexShrink: 0,
            }}
          >
            <Chip
              label="SECRETARY"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 700,
                fontSize: { xs: "0.55rem", sm: "0.65rem" },
                fontFamily: "Inter, sans-serif",
                border: "1px solid rgba(255,255,255,0.3)",
                height: { xs: 18, sm: 22 },
              }}
            />
            {/* Real Edit button */}
            <Chip
              icon={
                <EditIcon
                  sx={{
                    fontSize: "11px !important",
                    color: "white !important",
                  }}
                />
              }
              label="Edit Profile"
              size="small"
              onClick={() => setEditOpen(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.55rem", sm: "0.6rem" },
                fontFamily: "Inter, sans-serif",
                height: { xs: 18, sm: 20 },
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                transition: "all 0.2s",
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Info Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Personal Information"
            icon={<BadgeIcon sx={{ fontSize: 15, color: "#0891b2" }} />}
          >
            <InfoRow
              icon={
                <AccountCircleIcon
                  sx={{ fontSize: { xs: 14, sm: 16 }, color: "#0891b2" }}
                />
              }
              label="Full Name"
              value={`${profile.firstName} ${profile.lastName}`}
            />
            <InfoRow
              icon={
                <EmailIcon
                  sx={{ fontSize: { xs: 14, sm: 16 }, color: "#0891b2" }}
                />
              }
              label="Email Address"
              value={profile.email}
            />
            <InfoRow
              icon={
                <PhoneIcon
                  sx={{ fontSize: { xs: 14, sm: 16 }, color: "#0891b2" }}
                />
              }
              label="Mobile Number"
              value={profile.mobileNumber}
            />
            <InfoRow
              icon={
                <HomeIcon
                  sx={{ fontSize: { xs: 14, sm: 16 }, color: "#0891b2" }}
                />
              }
              label="Flat Number"
              value={profile.flatNumber}
            />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Bank Details"
            icon={
              <AccountBalanceIcon sx={{ fontSize: 15, color: "#0891b2" }} />
            }
          >
            <InfoRow
              icon={
                <AccountBalanceIcon
                  sx={{ fontSize: { xs: 14, sm: 16 }, color: "#0891b2" }}
                />
              }
              label="Bank Name"
              value={profile.bankName}
            />
            <InfoRow
              icon={
                <CreditCardIcon
                  sx={{ fontSize: { xs: 14, sm: 16 }, color: "#0891b2" }}
                />
              }
              label="Account Number"
              value={profile.accountNumber}
            />
            <InfoRow
              icon={
                <CreditCardIcon
                  sx={{ fontSize: { xs: 14, sm: 16 }, color: "#0891b2" }}
                />
              }
              label="IFSC Code"
              value={profile.ifscCode}
            />
            <Box sx={{ py: 1.5 }}>
              <Typography
                sx={{
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  color: "#94a3b8",
                  fontFamily: "Inter, sans-serif",
                  fontStyle: "italic",
                }}
              >
                Bank details are used for society fund management and
                maintenance collection.
              </Typography>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Edit Modal */}
      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSaved={loadProfile}
      />
    </Box>
  );
};

export default ProfilePage;
