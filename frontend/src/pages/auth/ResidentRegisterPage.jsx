import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import axiosInstance from "../../api/axiosInstance";

const wings = ["A", "B", "C", "D", "E"];

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    fontSize: "0.82rem",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: "0.82rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiFormHelperText-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: "0.62rem",
  },
};

const disabledFieldStyle = {
  ...fieldStyle,
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#1e293b",
    fontWeight: 600,
  },
  "& .MuiOutlinedInput-root.Mui-disabled fieldset": {
    borderColor: "#bbf7d0",
    borderWidth: 1.5,
  },
};

const emptyOwnerForm = {
  firstName: "",
  lastName: "",
  mobileNumber: "",
  aadhaarLastFour: "",
  residentType: "OWNER",
  wingName: "",
  flatNumber: "",
};
const emptyTenantForm = {
  firstName: "",
  lastName: "",
  mobileNumber: "",
  aadhaarLastFour: "",
  residentType: "TENANT",
  wingName: "",
  flatNumber: "",
  landlordName: "",
  landlordWingName: "",
  landlordFlatNumber: "",
  landlordMobileNumber: "",
};
const MOCK_OTP = "123456";

const StatusBox = ({ bgcolor, border, icon, text }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1,
      px: 1.2,
      py: 0.8,
      bgcolor,
      borderRadius: 1.5,
      border,
    }}
  >
    {icon}
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "0.68rem", sm: "0.75rem" },
        color: "#1e293b",
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      {text}
    </Typography>
  </Box>
);

// ── Scrollable page wrapper ────────────────────────────────────────
// Key: NO flex on mobile, just normal block flow so content scrolls naturally
const PageWrapper = ({ children }) => (
  <Box
    sx={{
      bgcolor: "#f0f9ff",
      py: { xs: 2, sm: 4 },
      px: { xs: 1.5, sm: 3 },
      "&::-webkit-scrollbar": { width: 6 },
      "&::-webkit-scrollbar-track": { bgcolor: "#e0f2fe", borderRadius: 3 },
      "&::-webkit-scrollbar-thumb": { bgcolor: "#0891b2", borderRadius: 3 },
    }}
  >
    {children}
  </Box>
);

const ResidentRegisterPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [ownerForm, setOwnerForm] = useState({ ...emptyOwnerForm });
  const [tenantForm, setTenantForm] = useState({ ...emptyTenantForm });
  const [flatChecking, setFlatChecking] = useState(false);
  const [flatStatus, setFlatStatus] = useState(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [ownerFetched, setOwnerFetched] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [fetchingOwner, setFetchingOwner] = useState(false);

  const form = tab === 0 ? ownerForm : tenantForm;
  const setForm = tab === 0 ? setOwnerForm : setTenantForm;

  const resetOwnerFields = () => {
    setOwnerFetched(false);
    setFetchError("");
    setTenantForm((prev) => ({
      ...prev,
      landlordName: "",
      landlordWingName: "",
      landlordFlatNumber: "",
      landlordMobileNumber: "",
    }));
  };

  const handleTab = (_, newVal) => {
    setTab(newVal);
    setErrors({});
    setError("");
    setFlatStatus(null);
    setOtpStep(false);
    setOtpSent(false);
    setOtpValue("");
    setOtpVerified(false);
    setOtpError("");
    setOwnerForm({ ...emptyOwnerForm });
    setTenantForm({ ...emptyTenantForm });
    setOwnerFetched(false);
    setFetchError("");
    setFlatChecking(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      ["firstName", "lastName"].includes(name) &&
      value &&
      !/^[a-zA-Z\s]*$/.test(value)
    )
      return;
    if (name === "mobileNumber" && (!/^\d*$/.test(value) || value.length > 10))
      return;
    if (
      name === "aadhaarLastFour" &&
      (!/^\d*$/.test(value) || value.length > 4)
    )
      return;
    if (name === "flatNumber") {
      if (!/^\d*$/.test(value) || value.length > 4) return;
      setFlatStatus(null);
      resetOwnerFields();
    }
    if (name === "wingName") {
      resetOwnerFields();
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  const autoFetchOwner = useCallback(async (wingName, flatNumber) => {
    const fullFlat = `${wingName}-${flatNumber}`;
    setFetchingOwner(true);
    setFetchError("");
    setOwnerFetched(false);
    setTenantForm((prev) => ({
      ...prev,
      landlordName: "",
      landlordWingName: "",
      landlordFlatNumber: "",
      landlordMobileNumber: "",
    }));
    try {
      const res = await axiosInstance.get(
        "/api/registration/fetch-owner-by-flat",
        { params: { flatNumber: fullFlat } },
      );
      if (!res.data) {
        setFetchError(`No registered owner found for flat ${fullFlat}.`);
        setFlatStatus("unregistered");
      } else {
        setTenantForm((prev) => ({
          ...prev,
          landlordName: res.data.landlordName,
          landlordMobileNumber: res.data.landlordMobile,
          landlordWingName: res.data.landlordWingName,
          landlordFlatNumber: res.data.landlordFlatNumber,
        }));
        setOwnerFetched(true);
        setFetchError("");
      }
    } catch {
      setFetchError("Failed to fetch owner details.");
    } finally {
      setFetchingOwner(false);
    }
  }, []);

  const checkFlatAvailability = useCallback(
    async (wingName, flatNumber, residentType) => {
      if (!wingName || !flatNumber || flatNumber.length < 1) return;
      setFlatChecking(true);
      setFlatStatus(null);
      resetOwnerFields();
      try {
        const res = await axiosInstance.get("/api/registration/check-flat", {
          params: { wingName, flatNumber, residentType },
        });
        if (res.data) {
          setFlatStatus("occupied");
          setFlatChecking(false);
          return;
        }
        if (residentType === "TENANT") {
          const fullFlat = `${wingName}-${flatNumber}`;
          const pendingRes = await axiosInstance.get(
            "/api/registration/check-pending-tenant",
            { params: { flatNumber: fullFlat } },
          );
          if (pendingRes.data) {
            setFlatStatus("pending");
            setFlatChecking(false);
            return;
          }
        }
        setFlatStatus("available");
        setFlatChecking(false);
        if (residentType === "TENANT")
          await autoFetchOwner(wingName, flatNumber);
      } catch {
        setFlatStatus(null);
        setFlatChecking(false);
      }
    },
    [autoFetchOwner],
  );

  const validate = (f) => {
    const e = {};
    const nameRx = /^[a-zA-Z\s]+$/;
    if (!f.firstName || !nameRx.test(f.firstName))
      e.firstName = "Only letters allowed";
    if (!f.lastName || !nameRx.test(f.lastName))
      e.lastName = "Only letters allowed";
    if (!/^\d{10}$/.test(f.mobileNumber)) e.mobileNumber = "Must be 10 digits";
    if (!/^\d{4}$/.test(f.aadhaarLastFour))
      e.aadhaarLastFour = "Must be 4 digits";
    if (!f.wingName) e.wingName = "Select a wing";
    if (!f.flatNumber || f.flatNumber.length < 1) e.flatNumber = "Required";
    else if (/^0+$/.test(f.flatNumber)) e.flatNumber = "Invalid flat number";
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validate(form)) return;
    if (flatStatus === "occupied") {
      setError(
        tab === 0
          ? `Active owner exists for flat ${form.wingName}-${form.flatNumber}.`
          : `Active tenant exists for flat ${form.wingName}-${form.flatNumber}.`,
      );
      return;
    }
    if (flatStatus === "pending") {
      setError(
        `Pending request exists for flat ${form.wingName}-${form.flatNumber}.`,
      );
      return;
    }
    if (flatStatus === "unregistered") {
      setError("Flat has no registered owner.");
      return;
    }
    if (tab === 1 && !ownerFetched) {
      setError("Wait for owner details to load.");
      return;
    }
    if (tab === 1 && !otpVerified) {
      setOtpStep(true);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        flatNumber: `${form.wingName}-${form.flatNumber}`,
        ...(form.residentType === "TENANT" && {
          landlordFlatNumber: `${form.landlordWingName}-${form.landlordFlatNumber}`,
        }),
      };
      await axiosInstance.post("/api/registration/resident", payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = () => {
    setOtpLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setOtpLoading(false);
    }, 1000);
  };
  const handleVerifyOtp = () => {
    if (otpValue === MOCK_OTP) {
      setOtpVerified(true);
      setOtpError("");
    } else setOtpError("Incorrect OTP.");
  };

  // ── Success ────────────────────────────────────────────────────
  if (success)
    return (
      <PageWrapper>
        <Container maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              textAlign: "center",
              border: "1px solid #e0f2fe",
              boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
              mt: { xs: 2, sm: 0 },
            }}
          >
            <CheckCircleIcon
              sx={{ fontSize: { xs: 44, sm: 56 }, color: "#059669", mb: 1.5 }}
            />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                color: "#1e293b",
                mb: 0.8,
              }}
            >
              Request Submitted!
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                color: "#64748b",
                mb: 2.5,
              }}
            >
              Your registration request has been submitted. The Secretary will
              review and approve it shortly.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/")}
              sx={{
                borderRadius: 2,
                bgcolor: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                "&:hover": { bgcolor: "#0e7490" },
              }}
            >
              Back to Home
            </Button>
          </Paper>
        </Container>
      </PageWrapper>
    );

  // ── OTP Step ───────────────────────────────────────────────────
  if (otpStep && tab === 1)
    return (
      <PageWrapper>
        <Container maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid #e0f2fe",
              boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
              mt: { xs: 2, sm: 0 },
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                py: { xs: 2, sm: 3 },
                px: 3,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  color: "white",
                }}
              >
                Owner Verification
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  color: "rgba(255,255,255,0.8)",
                  mt: 0.3,
                }}
              >
                OTP will be sent to the owner's registered mobile
              </Typography>
            </Box>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.2, sm: 2 },
              }}
            >
              <Box
                sx={{
                  bgcolor: "#f8fbff",
                  borderRadius: 2,
                  p: 1.5,
                  border: "1px solid #e0f2fe",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    color: "#64748b",
                    mb: 0.3,
                  }}
                >
                  Sending OTP to:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    color: "#0891b2",
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  }}
                >
                  {tenantForm.landlordMobileNumber}
                </Typography>
              </Box>
              {otpError && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    py: 0.4,
                    fontSize: { xs: "0.72rem", sm: "0.82rem" },
                  }}
                >
                  {otpError}
                </Alert>
              )}
              {otpVerified && (
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    py: 0.4,
                    fontSize: { xs: "0.72rem", sm: "0.82rem" },
                  }}
                >
                  OTP verified!
                </Alert>
              )}
              {!otpSent ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  startIcon={
                    otpLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <SendIcon sx={{ fontSize: "16px !important" }} />
                    )
                  }
                  sx={{
                    py: { xs: 0.9, sm: 1.2 },
                    borderRadius: 2,
                    bgcolor: "#0891b2",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: "0.82rem", sm: "0.875rem" },
                    "&:hover": { bgcolor: "#0e7490" },
                  }}
                >
                  {otpLoading ? "Sending..." : "Send OTP to Owner"}
                </Button>
              ) : !otpVerified ? (
                <>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    Enter 6-digit OTP received by owner
                    <br />
                    <strong style={{ color: "#0891b2" }}>
                      (Dev: use 123456)
                    </strong>
                  </Typography>
                  <TextField
                    label="Enter OTP *"
                    value={otpValue}
                    onChange={(e) => {
                      if (/^\d{0,6}$/.test(e.target.value)) {
                        setOtpValue(e.target.value);
                        setOtpError("");
                      }
                    }}
                    fullWidth
                    size="small"
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
                    sx={fieldStyle}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleVerifyOtp}
                    disabled={otpValue.length !== 6}
                    sx={{
                      py: { xs: 0.9, sm: 1.2 },
                      borderRadius: 2,
                      bgcolor: "#0891b2",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: { xs: "0.82rem", sm: "0.875rem" },
                      "&:hover": { bgcolor: "#0e7490" },
                    }}
                  >
                    Verify OTP
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <PersonAddIcon sx={{ fontSize: "16px !important" }} />
                    )
                  }
                  sx={{
                    py: { xs: 0.9, sm: 1.2 },
                    borderRadius: 2,
                    bgcolor: "#059669",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: "0.82rem", sm: "0.875rem" },
                    "&:hover": { bgcolor: "#047857" },
                  }}
                >
                  {loading ? "Submitting..." : "Submit Registration"}
                </Button>
              )}
              <Button
                size="small"
                startIcon={
                  <ArrowBackIcon sx={{ fontSize: "14px !important" }} />
                }
                onClick={() => {
                  setOtpStep(false);
                  setOtpSent(false);
                  setOtpValue("");
                  setOtpVerified(false);
                  setOtpError("");
                }}
                sx={{
                  color: "#0891b2",
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  alignSelf: "center",
                  fontSize: { xs: "0.72rem", sm: "0.78rem" },
                }}
              >
                Back to Form
              </Button>
            </Box>
          </Paper>
        </Container>
      </PageWrapper>
    );

  // ── Flat Status ────────────────────────────────────────────────
  const FlatStatusIndicator = () => {
    if (flatChecking)
      return (
        <StatusBox
          bgcolor="#f8fbff"
          border="1px solid #e0f2fe"
          icon={
            <CircularProgress
              size={11}
              sx={{ color: "#0891b2", flexShrink: 0 }}
            />
          }
          text="Checking flat availability..."
        />
      );
    if (flatStatus === "available" && tab !== 1)
      return (
        <StatusBox
          bgcolor="#f0fdf4"
          border="1px solid #bbf7d0"
          icon={
            <CheckIcon sx={{ fontSize: 13, color: "#059669", flexShrink: 0 }} />
          }
          text={`Flat ${form.wingName}-${form.flatNumber} is available`}
        />
      );
    if (flatStatus === "occupied")
      return (
        <StatusBox
          bgcolor="#fef2f2"
          border="1px solid #fecaca"
          icon={
            <ErrorOutlineIcon
              sx={{ fontSize: 13, color: "#dc2626", flexShrink: 0 }}
            />
          }
          text={
            tab === 0
              ? `Active owner exists for flat ${form.wingName}-${form.flatNumber}`
              : `Active tenant exists for flat ${form.wingName}-${form.flatNumber}`
          }
        />
      );
    if (flatStatus === "pending")
      return (
        <StatusBox
          bgcolor="#fef9c3"
          border="1px solid #fde68a"
          icon={
            <ErrorOutlineIcon
              sx={{ fontSize: 13, color: "#d97706", flexShrink: 0 }}
            />
          }
          text={`Pending request exists for flat ${form.wingName}-${form.flatNumber}`}
        />
      );
    if (flatStatus === "unregistered")
      return (
        <StatusBox
          bgcolor="#fef2f2"
          border="1px solid #fecaca"
          icon={
            <ErrorOutlineIcon
              sx={{ fontSize: 13, color: "#dc2626", flexShrink: 0 }}
            />
          }
          text={fetchError}
        />
      );
    return null;
  };

  // ── Main Form ──────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container maxWidth="sm">
        {/* mt on mobile so card doesn't stick to top */}
        <Box sx={{ my: { xs: 2, sm: 0 } }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e0f2fe",
              boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
              // No overflow:hidden here — that was blocking scroll
            }}
          >
            {/* Header — needs borderRadius on top corners since no overflow:hidden */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                py: { xs: 2, sm: 3 },
                px: 3,
                textAlign: "center",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 38, sm: 48 },
                  height: { xs: 38, sm: 48 },
                  mx: "auto",
                  mb: 0.8,
                  bgcolor: "rgba(255,255,255,0.2)",
                }}
              >
                <PersonAddIcon
                  sx={{ color: "white", fontSize: { xs: 20, sm: 24 } }}
                />
              </Avatar>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  color: "white",
                }}
              >
                Resident Registration
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.65rem", sm: "0.78rem" },
                  color: "rgba(255,255,255,0.8)",
                  mt: 0.2,
                }}
              >
                Submit your request to join UrbanSync
              </Typography>
            </Box>

            <Tabs
              value={tab}
              onChange={handleTab}
              variant="fullWidth"
              sx={{
                bgcolor: "#f8fbff",
                borderBottom: "1px solid #e0f2fe",
                "& .MuiTab-root": {
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: { xs: "0.72rem", sm: "0.8rem" },
                  textTransform: "none",
                  minHeight: 40,
                },
                "& .Mui-selected": { color: "#0891b2" },
                "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
              }}
            >
              <Tab label="Register as Owner" />
              <Tab label="Register as Tenant" />
            </Tabs>

            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.2, sm: 1.8 },
              }}
            >
              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    py: 0.4,
                    fontSize: { xs: "0.72rem", sm: "0.82rem" },
                  }}
                >
                  {error}
                </Alert>
              )}

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
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.2,
                }}
              >
                <TextField
                  label="First Name *"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  size="small"
                  error={!!errors.firstName}
                  helperText={errors.firstName || "Letters only"}
                  sx={fieldStyle}
                />
                <TextField
                  label="Last Name *"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  size="small"
                  error={!!errors.lastName}
                  helperText={errors.lastName || "Letters only"}
                  sx={fieldStyle}
                />
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.2,
                }}
              >
                <TextField
                  label="Mobile *"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  size="small"
                  error={!!errors.mobileNumber}
                  helperText={errors.mobileNumber}
                  sx={fieldStyle}
                />
                <TextField
                  label="Aadhaar Last 4 *"
                  name="aadhaarLastFour"
                  value={form.aadhaarLastFour}
                  onChange={handleChange}
                  size="small"
                  error={!!errors.aadhaarLastFour}
                  helperText={errors.aadhaarLastFour}
                  sx={fieldStyle}
                />
              </Box>

              <Divider sx={{ borderColor: "#e0f2fe" }} />

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
                Your Flat Details
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.2,
                }}
              >
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
                    name="wingName"
                    value={form.wingName}
                    onChange={(e) => {
                      const newWing = e.target.value;
                      handleChange(e);
                      if (form.flatNumber)
                        checkFlatAvailability(
                          newWing,
                          form.flatNumber,
                          form.residentType,
                        );
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
                        fontSize: "0.62rem",
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
                  onBlur={() => {
                    if (form.wingName && form.flatNumber)
                      checkFlatAvailability(
                        form.wingName,
                        form.flatNumber,
                        form.residentType,
                      );
                  }}
                  size="small"
                  error={!!errors.flatNumber}
                  helperText={errors.flatNumber || "e.g. 101"}
                  sx={fieldStyle}
                />
              </Box>

              <FlatStatusIndicator />

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
                      fontSize: { xs: "0.68rem", sm: "0.75rem" },
                      color: "#64748b",
                    }}
                  >
                    Flat will be saved as:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      fontWeight: 700,
                      color: "#0891b2",
                    }}
                  >
                    {form.wingName}-{form.flatNumber}
                  </Typography>
                </Box>
              )}

              {tab === 1 && (
                <>
                  <Divider sx={{ borderColor: "#e0f2fe" }} />
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
                    Owner (Landlord) Details
                  </Typography>
                  {fetchingOwner && (
                    <StatusBox
                      bgcolor="#f8fbff"
                      border="1px solid #e0f2fe"
                      icon={
                        <CircularProgress
                          size={11}
                          sx={{ color: "#0891b2", flexShrink: 0 }}
                        />
                      }
                      text="Fetching owner details automatically..."
                    />
                  )}
                  {!fetchingOwner &&
                    !fetchError &&
                    !ownerFetched &&
                    flatStatus === null && (
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: { xs: "0.68rem", sm: "0.75rem" },
                          color: "#94a3b8",
                          fontStyle: "italic",
                        }}
                      >
                        Enter your flat number above — owner details will be
                        fetched automatically.
                      </Typography>
                    )}
                  {ownerFetched && (
                    <>
                      <StatusBox
                        bgcolor="#f0fdf4"
                        border="1px solid #bbf7d0"
                        icon={
                          <CheckIcon
                            sx={{
                              fontSize: 13,
                              color: "#059669",
                              flexShrink: 0,
                            }}
                          />
                        }
                        text="Owner details fetched automatically"
                      />
                      <TextField
                        label="Owner Full Name"
                        value={tenantForm.landlordName}
                        size="small"
                        fullWidth
                        disabled
                        sx={disabledFieldStyle}
                      />
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1.2,
                        }}
                      >
                        <TextField
                          label="Owner Wing"
                          value={
                            tenantForm.landlordWingName
                              ? `Wing ${tenantForm.landlordWingName}`
                              : ""
                          }
                          size="small"
                          disabled
                          sx={disabledFieldStyle}
                        />
                        <TextField
                          label="Owner Flat"
                          value={tenantForm.landlordFlatNumber}
                          size="small"
                          disabled
                          sx={disabledFieldStyle}
                        />
                      </Box>
                      <TextField
                        label="Owner Mobile"
                        value={tenantForm.landlordMobileNumber}
                        size="small"
                        fullWidth
                        disabled
                        sx={disabledFieldStyle}
                      />
                    </>
                  )}
                </>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={
                  loading ||
                  flatStatus === "occupied" ||
                  flatStatus === "pending" ||
                  flatStatus === "unregistered" ||
                  fetchingOwner ||
                  (tab === 1 && !ownerFetched)
                }
                startIcon={
                  loading ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : tab === 1 && !otpVerified ? (
                    <SendIcon sx={{ fontSize: "16px !important" }} />
                  ) : (
                    <PersonAddIcon sx={{ fontSize: "16px !important" }} />
                  )
                }
                sx={{
                  py: { xs: 0.9, sm: 1.2 },
                  borderRadius: 2,
                  bgcolor: "#0891b2",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "0.78rem", sm: "0.875rem" },
                  mt: 0.5,
                  boxShadow: "0 2px 8px rgba(8,145,178,0.25)",
                  "&:hover": { bgcolor: "#0e7490" },
                  "&.Mui-disabled": {
                    bgcolor: ["occupied", "pending", "unregistered"].includes(
                      flatStatus,
                    )
                      ? "#fee2e2"
                      : undefined,
                  },
                }}
              >
                {loading
                  ? "Submitting..."
                  : tab === 1 && !otpVerified
                    ? "Next — Verify Owner OTP"
                    : "Submit Registration Request"}
              </Button>

              <Box sx={{ textAlign: "center", pb: { xs: 1, sm: 0 } }}>
                <Button
                  size="small"
                  startIcon={
                    <ArrowBackIcon sx={{ fontSize: "14px !important" }} />
                  }
                  onClick={() => navigate("/")}
                  sx={{
                    color: "#0891b2",
                    fontFamily: "Inter, sans-serif",
                    textTransform: "none",
                    fontSize: { xs: "0.72rem", sm: "0.78rem" },
                  }}
                >
                  Back to Home
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </PageWrapper>
  );
};

export default ResidentRegisterPage;
