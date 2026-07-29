import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  // Divider,
} from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
// import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import CakeIcon from "@mui/icons-material/Cake";
import TagIcon from "@mui/icons-material/Tag";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import axiosInstance from "../../api/axiosInstance";

// const fontStyle = { fontFamily: "Inter, sans-serif" };

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
};

const headSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  bgcolor: "#f8fbff",
  py: 1.2,
};

const cellSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.82rem",
  color: "#1e293b",
  py: 1.2,
};

const InfoRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      py: 1.2,
      borderBottom: "1px solid #f1f5f9",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: 1.5,
        bgcolor: "#f0f9ff",
        border: "1px solid #e0f2fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        sx={{
          fontSize: "0.68rem",
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
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#1e293b",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const CaretakersPage = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showError, setshowError] = useState("");

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    age: "",
    aadhaarNumber: "",
    permanentAddress: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const loadCaretakers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/caretaker");
      setCaretakers(res.data);
    } catch {
      setError("Failed to load caretakers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaretakers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileNumber" && (!/^\d*$/.test(value) || value.length > 10))
      return;
    if (name === "aadhaarNumber" && (!/^\d*$/.test(value) || value.length > 12))
      return;
    if (name === "age" && (!/^\d*$/.test(value) || Number(value) > 99)) return;
    setForm({ ...form, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    const e = {};
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!form.firstName || !nameRegex.test(form.firstName))
      e.firstName = "Only letters and spaces";
    if (!form.lastName || !nameRegex.test(form.lastName))
      e.lastName = "Only letters and spaces";
    if (!/^\d{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Must be exactly 10 digits";
    if (!form.age || Number(form.age) < 18 || Number(form.age) > 70)
      e.age = "Age must be between 18 and 70";
    if (!/^\d{12}$/.test(form.aadhaarNumber))
      e.aadhaarNumber = "Must be exactly 12 digits";
    if (!form.permanentAddress.trim())
      e.permanentAddress = "Address is required";
    setFormErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      await axiosInstance.post("/api/caretaker", {
        ...form,
        age: Number(form.age),
      });
      setshowError("Caretaker created successfully");
      setCreateOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        age: "",
        aadhaarNumber: "",
        permanentAddress: "",
      });
      setFormErrors({});
      loadCaretakers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create caretaker");
    } finally {
      setCreating(false);
    }
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setForm({
      firstName: "",
      lastName: "",
      mobileNumber: "",
      age: "",
      aadhaarNumber: "",
      permanentAddress: "",
    });
    setFormErrors({});
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EngineeringIcon sx={{ color: "#0891b2", fontSize: 20 }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "#1e293b",
            }}
          >
            Caretakers
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Manage society caretakers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setCreateOpen(true)}
          size="small"
          sx={{
            bgcolor: "#0891b2",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "0.8rem",
            px: 2,
            boxShadow: "0 2px 6px rgba(8,145,178,0.25)",
            "&:hover": { bgcolor: "#0e7490" },
          }}
        >
          Add Caretaker
        </Button>
      </Box>

      {showError && (
        <Alert
          severity="success"
          onClose={() => setshowError("")}
          sx={{ mb: 2, borderRadius: 2, fontFamily: "Inter, sans-serif" }}
        >
          {showError}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2, borderRadius: 2, fontFamily: "Inter, sans-serif" }}
        >
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
        }}
      >
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={48}
                sx={{ mb: 1, borderRadius: 1.5 }}
              />
            ))}
          </Box>
        ) : caretakers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <EngineeringIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                fontSize: "0.88rem",
              }}
            >
              No caretakers registered yet
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => setCreateOpen(true)}
              sx={{
                mt: 2,
                borderRadius: 2,
                borderColor: "#0891b2",
                color: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Add First Caretaker
            </Button>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>#</TableCell>
                  <TableCell sx={headSx}>Name</TableCell>
                  <TableCell sx={headSx}>Mobile</TableCell>
                  <TableCell sx={headSx}>Age</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caretakers.map((c) => (
                  <TableRow
                    key={c.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                  >
                    <TableCell sx={cellSx}>
                      <Chip
                        label={`#${c.serialNumber}`}
                        size="small"
                        sx={{
                          bgcolor: "#e0f2fe",
                          color: "#0891b2",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          fontFamily: "Inter, sans-serif",
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: "#e0f2fe",
                            fontSize: "0.75rem",
                            color: "#0891b2",
                            fontWeight: 700,
                          }}
                        >
                          {c.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color: "#1e293b",
                              lineHeight: 1.2,
                            }}
                          >
                            {c.firstName} {c.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={cellSx}>{c.mobileNumber}</TableCell>
                    <TableCell sx={cellSx}>{c.age} yrs</TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={c.status || "ACTIVE"}
                        size="small"
                        sx={{
                          bgcolor:
                            c.status === "ACTIVE" ? "#dcfce7" : "#fee2e2",
                          color: c.status === "ACTIVE" ? "#166534" : "#991b1b",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          fontFamily: "Inter, sans-serif",
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelected(c);
                            setDetailOpen(true);
                          }}
                          sx={{
                            color: "#0891b2",
                            bgcolor: "#e0f2fe",
                            borderRadius: 1.5,
                            width: 28,
                            height: 28,
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Detail Modal */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <EngineeringIcon sx={{ color: "#0891b2", fontSize: 20 }} />
          Caretaker Details
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                pb: 2,
                borderBottom: "1px solid #e0f2fe",
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#0891b2",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {selected.firstName?.[0]}
                {selected.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#1e293b",
                  }}
                >
                  {selected.firstName} {selected.lastName}
                </Typography>
                <Chip
                  label={`Serial #${selected.serialNumber}`}
                  size="small"
                  sx={{
                    bgcolor: "#e0f2fe",
                    color: "#0891b2",
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    fontFamily: "Inter, sans-serif",
                    height: 20,
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>
            <InfoRow
              icon={<PhoneIcon sx={{ fontSize: 14, color: "#0891b2" }} />}
              label="Mobile"
              value={selected.mobileNumber}
            />
            <InfoRow
              icon={<CakeIcon sx={{ fontSize: 14, color: "#0891b2" }} />}
              label="Age"
              value={`${selected.age} years`}
            />
            <InfoRow
              icon={<FingerprintIcon sx={{ fontSize: 14, color: "#0891b2" }} />}
              label="Aadhaar Number"
              value={selected.aadhaarNumber}
            />
            <InfoRow
              icon={<HomeIcon sx={{ fontSize: 14, color: "#0891b2" }} />}
              label="Permanent Address"
              value={selected.permanentAddress}
            />
            <InfoRow
              icon={<TagIcon sx={{ fontSize: 14, color: "#0891b2" }} />}
              label="Status"
              value={selected.status}
            />
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setDetailOpen(false)}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Caretaker Modal */}
      <Dialog
        open={createOpen}
        onClose={handleCloseCreate}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <AddIcon sx={{ color: "#0891b2", fontSize: 20 }} />
          Add New Caretaker
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
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
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                sx={fieldStyle}
              />
              <TextField
                label="Last Name *"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                size="small"
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
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
                error={!!formErrors.mobileNumber}
                helperText={formErrors.mobileNumber}
                sx={fieldStyle}
              />
              <TextField
                label="Age *"
                name="age"
                value={form.age}
                onChange={handleChange}
                size="small"
                inputProps={{ maxLength: 2 }}
                error={!!formErrors.age}
                helperText={formErrors.age}
                sx={fieldStyle}
              />
            </Box>

            <TextField
              label="Aadhaar Number *"
              name="aadhaarNumber"
              value={form.aadhaarNumber}
              onChange={handleChange}
              size="small"
              fullWidth
              inputProps={{ maxLength: 12 }}
              error={!!formErrors.aadhaarNumber}
              helperText={formErrors.aadhaarNumber || "12 digit Aadhaar number"}
              sx={fieldStyle}
            />

            <TextField
              label="Permanent Address *"
              name="permanentAddress"
              value={form.permanentAddress}
              onChange={handleChange}
              size="small"
              fullWidth
              multiline
              rows={2}
              error={!!formErrors.permanentAddress}
              helperText={formErrors.permanentAddress}
              sx={fieldStyle}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={handleCloseCreate}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating}
            startIcon={creating ? null : <AddIcon fontSize="small" />}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#0891b2",
              fontWeight: 600,
              "&:hover": { bgcolor: "#0e7490" },
              borderRadius: 2,
            }}
          >
            {creating ? "Creating..." : "Create Caretaker"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaretakersPage;
