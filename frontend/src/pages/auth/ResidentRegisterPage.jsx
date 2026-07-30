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
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
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
    if (["firstName", "lastName"].includes(name)) {
      if (value && !/^[a-zA-Z\s]*$/.test(value)) return;
    }
    if (name === "mobileNumber") {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }
    if (name === "aadhaarLastFour") {
      if (!/^\d*$/.test(value) || value.length > 4) return;
    }
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

  // Auto-fetch owner after flat availability confirmed
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
        setFetchError(
          `No registered owner found for flat ${fullFlat}. This property is unregistered.`,
        );
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
      setFetchError("Failed to fetch owner details. Please try again.");
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
        // Check active residents
        const res = await axiosInstance.get("/api/registration/check-flat", {
          params: { wingName, flatNumber, residentType },
        });

        if (res.data) {
          setFlatStatus("occupied");
          setFlatChecking(false);
          return;
        }

        // Check pending tenant request
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

        // Flat is available
        setFlatStatus("available");
        setFlatChecking(false);

        // Auto-fetch owner for tenant
        if (residentType === "TENANT") {
          await autoFetchOwner(wingName, flatNumber);
        }
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
    if (!/^\d{10}$/.test(f.mobileNumber))
      e.mobileNumber = "Must be exactly 10 digits";
    if (!/^\d{4}$/.test(f.aadhaarLastFour))
      e.aadhaarLastFour = "Must be exactly 4 digits";
    if (!f.wingName) e.wingName = "Please select a wing";
    if (!f.flatNumber || f.flatNumber.length < 1)
      e.flatNumber = "Required (1-4 digits)";
    else if (/^0+$/.test(f.flatNumber)) e.flatNumber = "Invalid flat number";
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validate(form)) return;

    if (flatStatus === "occupied") {
      setError(
        tab === 0
          ? `An active owner already exists for flat ${form.wingName}-${form.flatNumber}.`
          : `An active tenant already exists for flat ${form.wingName}-${form.flatNumber}.`,
      );
      return;
    }

    if (flatStatus === "pending") {
      setError(
        `A tenant registration request already exists for flat ${form.wingName}-${form.flatNumber}.`,
      );
      return;
    }

    if (flatStatus === "unregistered") {
      setError("This flat has no registered owner. Registration not possible.");
      return;
    }

    if (tab === 1 && !ownerFetched) {
      setError(
        "Please wait for owner details to be fetched before proceeding.",
      );
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
      setError(
        err.response?.data?.message || "Submission failed. Please try again.",
      );
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
    } else setOtpError("Incorrect OTP. Please try again.");
  };

  // ── Success ────────────────────────────────────────────────────
  if (success)
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
              p: 4,
              textAlign: "center",
              border: "1px solid #e0f2fe",
              boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 56, color: "#059669", mb: 2 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1e293b",
                mb: 1,
              }}
            >
              Request Submitted!
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.85rem",
                color: "#64748b",
                mb: 3,
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
      </Box>
    );

  // ── OTP Step ───────────────────────────────────────────────────
  if (otpStep && tab === 1)
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
            <Box
              sx={{
                background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                py: 3,
                px: 3,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "white",
                }}
              >
                Owner Verification
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.8)",
                  mt: 0.3,
                }}
              >
                OTP will be sent to the owner's registered mobile
              </Typography>
            </Box>
            <Box
              sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box
                sx={{
                  bgcolor: "#f8fbff",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid #e0f2fe",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    mb: 0.5,
                  }}
                >
                  Sending OTP to owner's mobile:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    color: "#0891b2",
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
                    py: 0.5,
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
                    py: 0.5,
                  }}
                >
                  OTP verified successfully!
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
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SendIcon fontSize="small" />
                    )
                  }
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    bgcolor: "#0891b2",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#0e7490" },
                  }}
                >
                  {otpLoading ? "Sending OTP..." : "Send OTP to Owner"}
                </Button>
              ) : !otpVerified ? (
                <>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8rem",
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    Enter the 6-digit OTP received by the owner
                    <br />
                    <strong style={{ color: "#0891b2" }}>
                      (Dev mode: use 123456)
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
                          fontSize: "1.1rem",
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
                      py: 1.2,
                      borderRadius: 2,
                      bgcolor: "#0891b2",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
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
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <PersonAddIcon fontSize="small" />
                    )
                  }
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    bgcolor: "#059669",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#047857" },
                  }}
                >
                  {loading ? "Submitting..." : "Submit Registration"}
                </Button>
              )}
              <Button
                size="small"
                startIcon={<ArrowBackIcon fontSize="small" />}
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
                }}
              >
                Back to Form
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );

  // ── Status Indicators ──────────────────────────────────────────
  const FlatStatusIndicator = () => {
    if (flatChecking)
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.8,
            bgcolor: "#f8fbff",
            borderRadius: 1.5,
            border: "1px solid #e0f2fe",
          }}
        >
          <CircularProgress size={12} sx={{ color: "#0891b2" }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Checking flat availability...
          </Typography>
        </Box>
      );
    if (flatStatus === "available" && !(tab === 1))
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.8,
            bgcolor: "#f0fdf4",
            borderRadius: 1.5,
            border: "1px solid #bbf7d0",
          }}
        >
          <CheckIcon sx={{ fontSize: 14, color: "#059669" }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#166534",
              fontWeight: 600,
            }}
          >
            Flat {form.wingName}-{form.flatNumber} is available
          </Typography>
        </Box>
      );
    if (flatStatus === "occupied")
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.8,
            bgcolor: "#fef2f2",
            borderRadius: 1.5,
            border: "1px solid #fecaca",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 14, color: "#dc2626" }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#991b1b",
              fontWeight: 600,
            }}
          >
            {tab === 0
              ? `An active owner already exists for flat ${form.wingName}-${form.flatNumber}`
              : `An active tenant already exists for flat ${form.wingName}-${form.flatNumber}. This flat is not available for rent.`}
          </Typography>
        </Box>
      );
    if (flatStatus === "pending")
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.8,
            bgcolor: "#fef9c3",
            borderRadius: 1.5,
            border: "1px solid #fde68a",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 14, color: "#d97706" }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#854d0e",
              fontWeight: 600,
            }}
          >
            A tenant registration request is already pending for flat{" "}
            {form.wingName}-{form.flatNumber}.
          </Typography>
        </Box>
      );
    if (flatStatus === "unregistered")
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.8,
            bgcolor: "#fef2f2",
            borderRadius: 1.5,
            border: "1px solid #fecaca",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 14, color: "#dc2626" }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#991b1b",
              fontWeight: 600,
            }}
          >
            {fetchError}
          </Typography>
        </Box>
      );
    return null;
  };

  // ── Main Form ──────────────────────────────────────────────────
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
      <Container maxWidth="sm">
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
            <Avatar
              sx={{
                width: 48,
                height: 48,
                mx: "auto",
                mb: 1,
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            >
              <PersonAddIcon sx={{ color: "white", fontSize: 24 }} />
            </Avatar>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "white",
              }}
            >
              Resident Registration
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
            >
              Submit your request to join UrbanSync
            </Typography>
          </Box>

          {/* Tabs */}
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
                fontSize: "0.8rem",
                textTransform: "none",
              },
              "& .Mui-selected": { color: "#0891b2" },
              "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
            }}
          >
            <Tab label="Register as Owner" />
            <Tab label="Register as Tenant" />
          </Tabs>

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  borderRadius: 2,
                  fontFamily: "Inter, sans-serif",
                  py: 0.5,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Personal Details */}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                color: "#0891b2",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Personal Details
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
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
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <TextField
                label="Mobile Number *"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                size="small"
                inputprops={{ maxLength: 10 }}
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
                inputprops={{ maxLength: 4 }}
                error={!!errors.aadhaarLastFour}
                helperText={errors.aadhaarLastFour}
                sx={fieldStyle}
              />
            </Box>

            <Divider sx={{ borderColor: "#e0f2fe" }} />

            {/* Flat Details */}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                color: "#0891b2",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Your Flat Details
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <FormControl
                size="small"
                error={!!errors.wingName}
                sx={fieldStyle}
              >
                <InputLabel sx={{ fontFamily: "Inter, sans-serif" }}>
                  Wing *
                </InputLabel>
                <Select
                  name="wingName"
                  value={form.wingName}
                  onChange={(e) => {
                    const newWing = e.target.value;
                    handleChange(e);
                    if (form.flatNumber && form.flatNumber.length > 0) {
                      checkFlatAvailability(
                        newWing,
                        form.flatNumber,
                        form.residentType,
                      );
                    }
                  }}
                  label="Wing *"
                  sx={{ fontFamily: "Inter, sans-serif" }}
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
                name="flatNumber"
                value={form.flatNumber}
                onChange={handleChange}
                onBlur={() => {
                  if (form.wingName && form.flatNumber) {
                    checkFlatAvailability(
                      form.wingName,
                      form.flatNumber,
                      form.residentType,
                    );
                  }
                }}
                size="small"
                inputprops={{ maxLength: 4 }}
                error={!!errors.flatNumber}
                helperText={errors.flatNumber || "1-4 digits e.g. 101"}
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
                  px: 1.5,
                  py: 0.8,
                  border: "1px solid #e0f2fe",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    color: "#64748b",
                  }}
                >
                  Flat will be saved as:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#0891b2",
                  }}
                >
                  {form.wingName}-{form.flatNumber}
                </Typography>
              </Box>
            )}

            {/* Tenant Owner Details — auto shown after fetch */}
            {tab === 1 && (
              <>
                <Divider sx={{ borderColor: "#e0f2fe" }} />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    color: "#0891b2",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Owner (Landlord) Details
                </Typography>

                {/* Auto-fetching indicator */}
                {fetchingOwner && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 0.8,
                      bgcolor: "#f8fbff",
                      borderRadius: 1.5,
                      border: "1px solid #e0f2fe",
                    }}
                  >
                    <CircularProgress size={12} sx={{ color: "#0891b2" }} />
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      Fetching owner details automatically...
                    </Typography>
                  </Box>
                )}

                {/* Fetch error */}
                {/* {!fetchingOwner && fetchError && !ownerFetched && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 0.8,
                      bgcolor: "#fef2f2",
                      borderRadius: 1.5,
                      border: "1px solid #fecaca",
                    }}
                  >
                    <ErrorOutlineIcon
                      sx={{ fontSize: 14, color: "#dc2626", flexShrink: 0 }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.75rem",
                        color: "#991b1b",
                        fontWeight: 600,
                      }}
                    >
                      {fetchError}
                    </Typography>
                  </Box>
                )} */}

                {/* No flat entered yet */}
                {!fetchingOwner &&
                  !fetchError &&
                  !ownerFetched &&
                  flatStatus === null && (
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}
                    >
                      Enter your wing and flat number above — owner details will
                      be fetched automatically.
                    </Typography>
                  )}

                {/* Owner fetched success */}
                {ownerFetched && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 0.8,
                        bgcolor: "#f0fdf4",
                        borderRadius: 1.5,
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 14, color: "#059669" }} />
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.75rem",
                          color: "#166534",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Owner details fetched automatically
                      </Typography>
                    </Box>

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
                        gap: 1.5,
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
                        label="Owner Flat Number"
                        value={tenantForm.landlordFlatNumber}
                        size="small"
                        disabled
                        sx={disabledFieldStyle}
                      />
                    </Box>

                    <TextField
                      label="Owner Mobile Number"
                      value={tenantForm.landlordMobileNumber}
                      size="small"
                      fullWidth
                      disabled
                      sx={disabledFieldStyle}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: "#f0fdf4",
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 0.8,
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.75rem",
                          color: "#64748b",
                        }}
                      >
                        Owner's registered living flat:
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#059669",
                        }}
                      >
                        {tenantForm.landlordWingName}-
                        {tenantForm.landlordFlatNumber}
                      </Typography>
                    </Box>
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
                  <CircularProgress size={16} color="inherit" />
                ) : tab === 1 && !otpVerified ? (
                  <SendIcon fontSize="small" />
                ) : (
                  <PersonAddIcon fontSize="small" />
                )
              }
              sx={{
                py: 1.2,
                borderRadius: 2,
                bgcolor: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
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

            <Box sx={{ textAlign: "center" }}>
              <Button
                size="small"
                startIcon={<ArrowBackIcon fontSize="small" />}
                onClick={() => navigate("/")}
                sx={{
                  color: "#0891b2",
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResidentRegisterPage;
