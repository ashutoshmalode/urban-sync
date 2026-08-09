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
  Avatar,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axiosInstance from "../../api/axiosInstance";
import CityBackground from "../../components/CityBackground";

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

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
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

const SecretaryRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    wingName: "",
    flatNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [errors, setErrors] = useState({});
  const passwordStrength = getPasswordStrength(form.password);

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
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setError("");
  };

  const validateForm = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/.test(
        form.password,
      )
    )
      e.password = "8-15 chars: upper, lower, number, special (@$!%*#?&)";
    if (!/^\d{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Must be 10 digits";
    if (!form.wingName) e.wingName = "Select a wing";
    if (!form.flatNumber || form.flatNumber.length < 3)
      e.flatNumber = "3-4 digits required";
    else if (/^0+$/.test(form.flatNumber)) e.flatNumber = "Invalid flat number";
    if (!form.bankName.trim()) e.bankName = "Required";
    if (!form.accountNumber) e.accountNumber = "Required";
    if (!form.ifscCode.trim()) e.ifscCode = "Required";
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        flatNumber: `${form.wingName}-${form.flatNumber}`,
      };
      delete payload.wingName;
      await axiosInstance.post("/api/secretary/register", payload);
      localStorage.removeItem("sec_registered");
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
          position: "relative",
        }}
      >
        <CityBackground />
        <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              textAlign: "center",
              border: "1px solid #e0f2fe",
              boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
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
                mb: 1,
              }}
            >
              Secretary Registered!
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.78rem", sm: "0.85rem" },
                color: "#64748b",
                mb: 2.5,
              }}
            >
              Society administrator account created successfully.
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
              Go to Home
            </Button>
          </Paper>
        </Container>
      </Box>
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
        position: "relative",
      }}
    >
      <CityBackground />
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
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
            <Avatar
              sx={{
                width: { xs: 38, sm: 48 },
                height: { xs: 38, sm: 48 },
                mx: "auto",
                mb: 0.8,
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            >
              <AdminPanelSettingsIcon
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
              Secretary Registration
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.78rem" },
                color: "rgba(255,255,255,0.8)",
                mt: 0.2,
              }}
            >
              Create the society administrator account
            </Typography>
          </Box>

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
              sx={fieldStyle}
            />

            <Box>
              <TextField
                label="Password *"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                size="small"
                fullWidth
                error={!!errors.password}
                helperText={errors.password}
                sx={fieldStyle}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.4,
                          }}
                        >
                          {form.password && (
                            <Box
                              sx={{
                                px: 0.8,
                                py: 0.1,
                                borderRadius: 1,
                                bgcolor: passwordStrength.bg,
                                border: `1px solid ${passwordStrength.color}20`,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "0.6rem",
                                  fontWeight: 700,
                                  color: passwordStrength.color,
                                }}
                              >
                                {passwordStrength.label}
                              </Typography>
                            </Box>
                          )}
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
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {form.password && (
                <Box sx={{ mt: 0.6 }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength.progress}
                    sx={{
                      height: 3,
                      borderRadius: 2,
                      bgcolor: "#f1f5f9",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: passwordStrength.color,
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

            <TextField
              label="Mobile Number *"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              sx={fieldStyle}
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}
            >
              <FormControl
                size="small"
                error={!!errors.wingName}
                sx={fieldStyle}
              >
                <InputLabel
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
                >
                  Wing *
                </InputLabel>
                <Select
                  name="wingName"
                  value={form.wingName}
                  onChange={handleChange}
                  label="Wing *"
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
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
                size="small"
                error={!!errors.flatNumber}
                helperText={errors.flatNumber || "3-4 digits"}
                sx={fieldStyle}
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
                  px: 1.5,
                  py: 0.7,
                  border: "1px solid #e0f2fe",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.72rem",
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
              sx={fieldStyle}
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
                sx={fieldStyle}
              />
              <TextField
                label="IFSC Code *"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                size="small"
                error={!!errors.ifscCode}
                helperText={errors.ifscCode || "Alphanumeric"}
                sx={fieldStyle}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <AdminPanelSettingsIcon
                    sx={{ fontSize: "16px !important" }}
                  />
                )
              }
              sx={{
                py: { xs: 0.9, sm: 1.2 },
                borderRadius: 2,
                bgcolor: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.82rem", sm: "0.9rem" },
                mt: 0.5,
                boxShadow: "0 2px 8px rgba(8,145,178,0.25)",
                "&:hover": { bgcolor: "#0e7490" },
              }}
            >
              {loading ? "Registering..." : "Register as Secretary"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
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
      </Container>
    </Box>
  );
};

export default SecretaryRegisterPage;
