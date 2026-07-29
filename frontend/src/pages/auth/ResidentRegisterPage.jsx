import { useState } from "react";
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
  //InputAdornment,
  // IconButton,
  // Stepper,
  // Step,
  // StepLabel,
} from "@mui/material";
// import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
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

// ── Validation helpers ──────────────────────────────────────────
const validate = {
  name: (v) =>
    /^[a-zA-Z\s]+$/.test(v.trim()) ? "" : "Only letters and spaces allowed",
  mobile: (v) => (/^\d{10}$/.test(v) ? "" : "Must be exactly 10 digits"),
  aadhaar: (v) => (/^\d{4}$/.test(v) ? "" : "Must be exactly 4 digits"),
  flat: (v) => (/^\w{1}-\d{3,4}$/.test(v) ? "" : "Format: A-201 or A-2012"),
  wing: (v) => (v ? "" : "Please select a wing"),
  otp: (v) => (/^\d{6}$/.test(v) ? "" : "OTP must be 6 digits"),
};

const ResidentRegisterPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // OTP state (mock)
  const [otpStep, setOtpStep] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const MOCK_OTP = "123456";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    aadhaarLastFour: "",
    residentType: "OWNER",
    wingName: "",
    flatNumber: "",
    landlordName: "",
    landlordWingName: "",
    landlordFlatNumber: "",
    landlordMobileNumber: "",
  });

  const [errors, setErrors] = useState({});

  const handleTab = (_, newVal) => {
    setTab(newVal);
    setOtpStep(false);
    setOtpSent(false);
    setOtpValue("");
    setOtpVerified(false);
    setOtpError("");
    setErrors({});
    setError("");
    setForm((prev) => ({
      ...prev,
      residentType: newVal === 0 ? "OWNER" : "TENANT",
      landlordName: "",
      landlordWingName: "",
      landlordFlatNumber: "",
      landlordMobileNumber: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict input types
    if (
      ["mobileNumber", "aadhaarLastFour"].includes(name) &&
      !/^\d*$/.test(value)
    )
      return;
    if (["landlordMobileNumber"].includes(name) && !/^\d*$/.test(value)) return;
    if (name === "aadhaarLastFour" && value.length > 4) return;
    if (name === "mobileNumber" && value.length > 10) return;
    if (name === "landlordMobileNumber" && value.length > 10) return;

    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setError("");
  };

  const validateOwnerForm = () => {
    const e = {};
    e.firstName = validate.name(form.firstName);
    e.lastName = validate.name(form.lastName);
    e.mobileNumber = validate.mobile(form.mobileNumber);
    e.aadhaarLastFour = validate.aadhaar(form.aadhaarLastFour);
    e.wingName = validate.wing(form.wingName);
    e.flatNumber = validate.flat(form.flatNumber);
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const validateTenantForm = () => {
    const e = {};
    e.firstName = validate.name(form.firstName);
    e.lastName = validate.name(form.lastName);
    e.mobileNumber = validate.mobile(form.mobileNumber);
    e.aadhaarLastFour = validate.aadhaar(form.aadhaarLastFour);
    e.wingName = validate.wing(form.wingName);
    e.flatNumber = validate.flat(form.flatNumber);
    e.landlordName = validate.name(form.landlordName);
    e.landlordWingName = validate.wing(form.landlordWingName);
    e.landlordMobileNumber = validate.mobile(form.landlordMobileNumber);
    if (!form.landlordFlatNumber) e.landlordFlatNumber = "Required";
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  // Mock OTP send
  const handleSendOtp = () => {
    setOtpLoading(true);
    setOtpError("");
    setTimeout(() => {
      setOtpSent(true);
      setOtpLoading(false);
      // In dev mode show hint
      console.log("Mock OTP: 123456");
    }, 1000);
  };

  // Mock OTP verify
  const handleVerifyOtp = () => {
    if (otpValue === MOCK_OTP) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
  };

  const handleSubmit = async () => {
    const isValid = tab === 0 ? validateOwnerForm() : validateTenantForm();
    if (!isValid) return;

    // Tenant needs OTP verification
    if (tab === 1 && !otpVerified) {
      setOtpStep(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        landlordFlatNumber:
          tab === 1
            ? `${form.landlordWingName}-${form.landlordFlatNumber}`
            : form.landlordFlatNumber,
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

  // ── Success screen ─────────────────────────────────────────────
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

  // ── OTP Step (tenant only) ─────────────────────────────────────
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
                  {form.landlordMobileNumber}
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
                    inputProps={{
                      maxLength: 6,
                      style: {
                        letterSpacing: "0.3em",
                        textAlign: "center",
                        fontSize: "1.1rem",
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

  // ── Main Form ─────────────────────────────────────────────────
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
                helperText={errors.firstName}
                sx={fieldStyle}
              />
              <TextField
                label="Last Name *"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                size="small"
                error={!!errors.lastName}
                helperText={errors.lastName}
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
                inputProps={{ maxLength: 10 }}
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
                inputProps={{ maxLength: 4 }}
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
                  onChange={handleChange}
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
                placeholder="e.g. A-201"
                size="small"
                error={!!errors.flatNumber}
                helperText={errors.flatNumber || "Format: A-201"}
                sx={fieldStyle}
              />
            </Box>

            {/* Tenant Extra Fields */}
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
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    color: "#64748b",
                  }}
                >
                  Enter the details of the owner whose flat you are renting. An
                  OTP will be sent to the owner's mobile for verification.
                </Typography>

                <TextField
                  label="Owner Full Name *"
                  name="landlordName"
                  value={form.landlordName}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  error={!!errors.landlordName}
                  helperText={errors.landlordName}
                  sx={fieldStyle}
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.5,
                  }}
                >
                  <FormControl
                    size="small"
                    error={!!errors.landlordWingName}
                    sx={fieldStyle}
                  >
                    <InputLabel sx={{ fontFamily: "Inter, sans-serif" }}>
                      Owner Wing *
                    </InputLabel>
                    <Select
                      name="landlordWingName"
                      value={form.landlordWingName}
                      onChange={handleChange}
                      label="Owner Wing *"
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
                    {errors.landlordWingName && (
                      <Typography
                        sx={{
                          color: "#d32f2f",
                          fontSize: "0.72rem",
                          mt: 0.5,
                          ml: 1.5,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {errors.landlordWingName}
                      </Typography>
                    )}
                  </FormControl>
                  <TextField
                    label="Owner Flat Number *"
                    name="landlordFlatNumber"
                    value={form.landlordFlatNumber}
                    onChange={handleChange}
                    placeholder="e.g. 201"
                    size="small"
                    error={!!errors.landlordFlatNumber}
                    helperText={
                      errors.landlordFlatNumber || "Number only e.g. 201"
                    }
                    sx={fieldStyle}
                  />
                </Box>

                <TextField
                  label="Owner Mobile Number *"
                  name="landlordMobileNumber"
                  value={form.landlordMobileNumber}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 10 }}
                  error={!!errors.landlordMobileNumber}
                  helperText={errors.landlordMobileNumber}
                  sx={fieldStyle}
                />
              </>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
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
