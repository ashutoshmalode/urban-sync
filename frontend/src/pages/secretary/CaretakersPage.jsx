import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Skeleton,
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
  Tabs,
  Tab,
  InputAdornment,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import CakeIcon from "@mui/icons-material/Cake";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PersonIcon from "@mui/icons-material/Person";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";
import { uploadToCloudinary } from "../../utils/cloudinary";

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
    fontSize: isMobile ? "0.62rem" : "0.7rem",
    fontFamily: "Inter, sans-serif",
  },
});

const headSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.68rem",
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  bgcolor: "#f8fbff",
  py: 1,
  px: 1,
  whiteSpace: "nowrap",
};

const cellSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.78rem",
  color: "#1e293b",
  py: 1,
  px: 1,
  whiteSpace: "nowrap",
};

const InfoRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 1.2,
      py: 1,
      borderBottom: "1px solid #f1f5f9",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Box
      sx={{
        width: 28,
        height: 28,
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
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: "0.62rem",
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
          fontSize: { xs: "0.78rem", sm: "0.875rem" },
          fontWeight: 600,
          color: "#1e293b",
          fontFamily: "Inter, sans-serif",
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  </Box>
);

const CaretakersPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);
  const [caretakers, setCaretakers] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        axiosInstance.get("/api/caretaker"),
        axiosInstance.get("/api/caretaker/history"),
      ]);
      setCaretakers(activeRes.data);
      setHistoryList(historyRes.data);
    } catch {
      showError("Failed to load caretakers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetCreateModal = () => {
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
    setPhotoPreview(null);
    setUploadedPhotoUrl("");
    setPhotoUploading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileNumber" && (!/^\d*$/.test(value) || value.length > 10))
      return;
    if (name === "aadhaarNumber" && (!/^\d*$/.test(value) || value.length > 12))
      return;
    if (name === "age" && (!/^\d*$/.test(value) || Number(value) > 99)) return;
    if (
      ["firstName", "lastName"].includes(name) &&
      value &&
      !/^[a-zA-Z\s]*$/.test(value)
    )
      return;
    setForm({ ...form, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    const e = {};
    if (!uploadedPhotoUrl) {
      showError("Please upload caretaker photo before submitting");
      return false;
    }
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!/^\d{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Must be 10 digits";
    if (!form.age || Number(form.age) < 18 || Number(form.age) > 70)
      e.age = "Age 18-70";
    if (!/^\d{12}$/.test(form.aadhaarNumber))
      e.aadhaarNumber = "Must be 12 digits";
    if (!form.permanentAddress.trim()) e.permanentAddress = "Required";
    setFormErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showError("File size must be less than 5MB");
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      const url = await uploadToCloudinary(file, "urbansync/caretakers");
      setUploadedPhotoUrl(url);
      showSuccess("Photo uploaded");
    } catch {
      showError("Photo upload failed.");
      setPhotoPreview(null);
      setUploadedPhotoUrl("");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      await axiosInstance.post("/api/caretaker", {
        ...form,
        age: Number(form.age),
        photoUrl: uploadedPhotoUrl || null,
      });
      showSuccess("Caretaker created successfully");
      resetCreateModal();
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create caretaker");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/caretaker/${deleteTarget.id}`, {
        data: { reason: deleteReason },
      });
      showSuccess("Caretaker removed successfully");
      setDeleteOpen(false);
      setDeleteReason("");
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to remove caretaker");
    } finally {
      setDeleting(false);
    }
  };

  const filteredHistory = historyList
    .filter((c) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
        c.mobileNumber?.includes(s) ||
        c.aadhaarNumber?.includes(s) ||
        c.permanentAddress?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const LoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
      {[...Array(4)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={44}
          sx={{ mb: 1, borderRadius: 1.5 }}
        />
      ))}
    </Box>
  );

  const CaretakerRow = ({ c, onView }) => (
    <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fbff" } }}>
      <TableCell sx={cellSx}>
        <Chip
          label={`#${c.serialNumber}`}
          size="small"
          sx={{
            bgcolor: c.status === "ACTIVE" ? "#e0f2fe" : "#f1f5f9",
            color: c.status === "ACTIVE" ? "#0891b2" : "#64748b",
            fontWeight: 700,
            fontSize: "0.65rem",
            fontFamily: "Inter, sans-serif",
            height: 20,
          }}
        />
      </TableCell>
      <TableCell sx={cellSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          {c.status === "ACTIVE" && (
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#22c55e",
                boxShadow: "0 0 5px 1px rgba(34,197,94,0.5)",
                flexShrink: 0,
              }}
            />
          )}
          <Avatar
            src={c.photoUrl || undefined}
            sx={{
              width: 26,
              height: 26,
              bgcolor: c.photoUrl
                ? "transparent"
                : c.status === "ACTIVE"
                  ? "#e0f2fe"
                  : "#f1f5f9",
              fontSize: "0.65rem",
              color: c.status === "ACTIVE" ? "#0891b2" : "#64748b",
              fontWeight: 700,
            }}
          >
            {!c.photoUrl && c.firstName?.[0]}
          </Avatar>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.78rem",
              fontWeight: c.status === "ACTIVE" ? 700 : 400,
              color: c.status === "ACTIVE" ? "#1e293b" : "#64748b",
            }}
          >
            {c.firstName} {c.lastName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={cellSx}>{c.mobileNumber}</TableCell>
      <TableCell sx={cellSx}>{c.age}y</TableCell>
      <TableCell sx={cellSx}>
        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "-"}
      </TableCell>
      <TableCell sx={cellSx}>
        {c.leftAt ? (
          new Date(c.leftAt).toLocaleDateString("en-IN")
        ) : (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.72rem",
              color: "#22c55e",
              fontWeight: 600,
            }}
          >
            Active
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ ...cellSx, maxWidth: 100 }}>
        <Typography
          noWrap
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.72rem",
            color: "#94a3b8",
          }}
        >
          {c.leavingReason || "-"}
        </Typography>
      </TableCell>
      <TableCell align="center" sx={{ py: 0.8, px: 1 }}>
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => onView(c)}
            sx={{
              color: "#0891b2",
              bgcolor: "#e0f2fe",
              borderRadius: 1.5,
              width: 26,
              height: 26,
            }}
          >
            <VisibilityIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <EngineeringIcon sx={{ color: "#0891b2", fontSize: 18 }} />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "0.9rem", sm: "1.05rem" },
              color: "#1e293b",
            }}
          >
            Caretakers
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.68rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            Manage society caretakers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
          onClick={() => setCreateOpen(true)}
          size="small"
          sx={{
            bgcolor: "#0891b2",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: { xs: "0.72rem", sm: "0.8rem" },
            px: { xs: 1.2, sm: 2 },
            whiteSpace: "nowrap",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(8,145,178,0.25)",
            "&:hover": { bgcolor: "#0e7490" },
          }}
        >
          {isMobile ? "Add" : "Add Caretaker"}
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            bgcolor: "#f8fbff",
            borderBottom: "1px solid #e0f2fe",
            "& .MuiTab-root": {
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              textTransform: "none",
              minHeight: 42,
            },
            "& .Mui-selected": { color: "#0891b2" },
            "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
          }}
        >
          <Tab label={`Active (${caretakers.length})`} />
          <Tab
            label={`History (${historyList.length})`}
            icon={<HistoryIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
          />
        </Tabs>

        {loading ? (
          <LoadingSkeleton />
        ) : tab === 0 ? (
          caretakers.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <EngineeringIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  mb: 2,
                }}
              >
                No active caretakers
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => setCreateOpen(true)}
                sx={{
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
              <Table size="small" sx={{ minWidth: 480 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>#</TableCell>
                    <TableCell sx={headSx}>Name</TableCell>
                    <TableCell sx={headSx}>Mobile</TableCell>
                    <TableCell sx={headSx}>Age</TableCell>
                    <TableCell sx={headSx}>Status</TableCell>
                    <TableCell sx={headSx} align="center">
                      Actions
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
                            fontSize: "0.65rem",
                            fontFamily: "Inter, sans-serif",
                            height: 20,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                          }}
                        >
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              bgcolor: "#22c55e",
                              boxShadow: "0 0 5px 1px rgba(34,197,94,0.5)",
                              flexShrink: 0,
                            }}
                          />
                          <Avatar
                            src={c.photoUrl || undefined}
                            sx={{
                              width: 26,
                              height: 26,
                              bgcolor: c.photoUrl ? "transparent" : "#e0f2fe",
                              fontSize: "0.65rem",
                              color: "#0891b2",
                              fontWeight: 700,
                            }}
                          >
                            {!c.photoUrl && c.firstName?.[0]}
                          </Avatar>
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              color: "#1e293b",
                            }}
                          >
                            {c.firstName} {c.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx}>{c.mobileNumber}</TableCell>
                      <TableCell sx={cellSx}>{c.age}y</TableCell>
                      <TableCell sx={cellSx}>
                        <Chip
                          label="ACTIVE"
                          size="small"
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#166534",
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            fontFamily: "Inter, sans-serif",
                            height: 20,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ py: 0.8, px: 1, whiteSpace: "nowrap" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.4,
                            justifyContent: "center",
                          }}
                        >
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
                                width: 26,
                                height: 26,
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Caretaker">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeleteTarget(c);
                                setDeleteOpen(true);
                              }}
                              sx={{
                                color: "#dc2626",
                                bgcolor: "#fee2e2",
                                borderRadius: 1.5,
                                width: 26,
                                height: 26,
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : (
          <Box>
            <Box
              sx={{
                px: 2,
                py: 1.2,
                borderBottom: "1px solid #e0f2fe",
                bgcolor: "#f8fbff",
              }}
            >
              <TextField
                placeholder="Search by name, mobile, Aadhaar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.75rem", sm: "0.82rem" },
                    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch("")}>
                          <ClearIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />
            </Box>
            {filteredHistory.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <HistoryIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                  }}
                >
                  {search
                    ? "No caretakers match your search"
                    : "No caretaker history yet"}
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 560 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headSx}>#</TableCell>
                      <TableCell sx={headSx}>Name</TableCell>
                      <TableCell sx={headSx}>Mobile</TableCell>
                      <TableCell sx={headSx}>Age</TableCell>
                      <TableCell sx={headSx}>Joined</TableCell>
                      <TableCell sx={headSx}>Left On</TableCell>
                      <TableCell sx={headSx}>Reason</TableCell>
                      <TableCell sx={headSx} align="center">
                        Details
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredHistory.filter((c) => c.status === "ACTIVE")
                      .length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          sx={{
                            py: 0.6,
                            px: 2,
                            bgcolor: "#f0fdf4",
                            borderBottom: "1px solid #bbf7d0",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.8,
                            }}
                          >
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                bgcolor: "#22c55e",
                                boxShadow: "0 0 5px 1px rgba(34,197,94,0.5)",
                              }}
                            />
                            <Typography
                              sx={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                color: "#166534",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                              }}
                            >
                              Currently On Job (
                              {
                                filteredHistory.filter(
                                  (c) => c.status === "ACTIVE",
                                ).length
                              }
                              )
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredHistory
                      .filter((c) => c.status === "ACTIVE")
                      .map((c) => (
                        <CaretakerRow
                          key={`active-${c.id}`}
                          c={c}
                          onView={(c) => {
                            setSelected(c);
                            setDetailOpen(true);
                          }}
                        />
                      ))}
                    {filteredHistory.filter((c) => c.status === "INACTIVE")
                      .length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          sx={{
                            py: 0.6,
                            px: 2,
                            bgcolor: "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                            borderTop: "2px solid #e0f2fe",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              color: "#64748b",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            Previous Caretakers (
                            {
                              filteredHistory.filter(
                                (c) => c.status === "INACTIVE",
                              ).length
                            }
                            )
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredHistory
                      .filter((c) => c.status === "INACTIVE")
                      .map((c) => (
                        <CaretakerRow
                          key={`inactive-${c.id}`}
                          c={c}
                          onView={(c) => {
                            setSelected(c);
                            setDetailOpen(true);
                          }}
                        />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* View Detail Modal */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, mx: { xs: 1.5, sm: 3 } } },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.88rem", sm: "1rem" },
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <EngineeringIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Caretaker Details
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1.5,
                pb: 1.5,
                borderBottom: "1px solid #e0f2fe",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.3,
                }}
              >
                <Avatar
                  src={selected.photoUrl || undefined}
                  onClick={() => {
                    if (selected.photoUrl) {
                      setFullImageUrl(selected.photoUrl);
                      setFullImageOpen(true);
                    }
                  }}
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: selected.photoUrl
                      ? "transparent"
                      : selected.status === "ACTIVE"
                        ? "#0891b2"
                        : "#94a3b8",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    cursor: selected.photoUrl ? "pointer" : "default",
                    transition: "transform 0.2s",
                    "&:hover": selected.photoUrl
                      ? { transform: "scale(1.05)" }
                      : {},
                  }}
                >
                  {!selected.photoUrl && selected.firstName?.[0]}
                  {!selected.photoUrl && selected.lastName?.[0]}
                </Avatar>
                {selected.photoUrl && (
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.58rem",
                      color: "#94a3b8",
                    }}
                  >
                    tap to view
                  </Typography>
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: "0.88rem", sm: "1rem" },
                    color: "#1e293b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selected.firstName} {selected.lastName}
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 0.5, mt: 0.3, flexWrap: "wrap" }}
                >
                  <Chip
                    label={`#${selected.serialNumber}`}
                    size="small"
                    sx={{
                      bgcolor: "#e0f2fe",
                      color: "#0891b2",
                      fontWeight: 700,
                      fontSize: "0.62rem",
                      fontFamily: "Inter, sans-serif",
                      height: 18,
                    }}
                  />
                  <Chip
                    label={selected.status || "ACTIVE"}
                    size="small"
                    sx={{
                      bgcolor:
                        selected.status === "ACTIVE" ? "#dcfce7" : "#fee2e2",
                      color:
                        selected.status === "ACTIVE" ? "#166534" : "#991b1b",
                      fontWeight: 700,
                      fontSize: "0.62rem",
                      fontFamily: "Inter, sans-serif",
                      height: 18,
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <InfoRow
              icon={<PhoneIcon sx={{ fontSize: 13, color: "#0891b2" }} />}
              label="Mobile"
              value={selected.mobileNumber}
            />
            <InfoRow
              icon={<CakeIcon sx={{ fontSize: 13, color: "#0891b2" }} />}
              label="Age"
              value={`${selected.age} years`}
            />
            <InfoRow
              icon={<FingerprintIcon sx={{ fontSize: 13, color: "#0891b2" }} />}
              label="Aadhaar"
              value={selected.aadhaarNumber}
            />
            <InfoRow
              icon={<HomeIcon sx={{ fontSize: 13, color: "#0891b2" }} />}
              label="Address"
              value={selected.permanentAddress}
            />
            <InfoRow
              icon={<BadgeIcon sx={{ fontSize: 13, color: "#0891b2" }} />}
              label="Joined"
              value={
                selected.createdAt
                  ? new Date(selected.createdAt).toLocaleDateString("en-IN")
                  : "-"
              }
            />
            {selected.status === "INACTIVE" && (
              <>
                <InfoRow
                  icon={
                    <EventBusyIcon sx={{ fontSize: 13, color: "#dc2626" }} />
                  }
                  label="Left On"
                  value={
                    selected.leftAt
                      ? new Date(selected.leftAt).toLocaleDateString("en-IN")
                      : "-"
                  }
                />
                <Box
                  sx={{
                    mt: 1,
                    p: 1.2,
                    bgcolor: "#fef2f2",
                    borderRadius: 2,
                    border: "1px solid #fecaca",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      color: "#dc2626",
                      mb: 0.4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Leaving Reason
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      color: "#991b1b",
                    }}
                  >
                    {selected.leavingReason || "-"}
                  </Typography>
                </Box>
              </>
            )}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 1.5, px: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setDetailOpen(false)}
            size="small"
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
              fontSize: "0.78rem",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Modal */}
      <Dialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteReason("");
          setDeleteTarget(null);
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, mx: { xs: 1.5, sm: 3 } } },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.88rem", sm: "1rem" },
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DeleteIcon sx={{ color: "#dc2626", fontSize: 16 }} />
          Remove Caretaker
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          {deleteTarget && (
            <Box
              sx={{
                p: 1.2,
                bgcolor: "#f8fbff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
                mb: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                  color: "#64748b",
                }}
              >
                Removing:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  color: "#1e293b",
                }}
              >
                {deleteTarget.firstName} {deleteTarget.lastName} - #
                {deleteTarget.serialNumber}
              </Typography>
            </Box>
          )}
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              color: "#64748b",
              mb: 1.5,
            }}
          >
            Please provide a reason for removing this caretaker.
          </Typography>
          <TextField
            label="Reason for Removal *"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
            InputLabelProps={{
              sx: {
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.78rem", sm: "0.875rem" },
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.78rem", sm: "0.875rem" },
                "&.Mui-focused fieldset": { borderColor: "#dc2626" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#dc2626" },
              "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => {
              setDeleteOpen(false);
              setDeleteReason("");
              setDeleteTarget(null);
            }}
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
            onClick={handleDelete}
            disabled={!deleteReason.trim() || deleting}
            startIcon={<DeleteIcon sx={{ fontSize: "13px !important" }} />}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              borderRadius: 2,
            }}
          >
            {deleting ? "Removing..." : "Confirm Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Modal */}
      <Dialog
        open={createOpen}
        onClose={resetCreateModal}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, mx: { xs: 1.5, sm: 3 } } },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.88rem", sm: "1rem" },
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Add New Caretaker
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Photo Upload */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                bgcolor: "#f8fbff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Avatar
                  src={photoPreview || undefined}
                  sx={{
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    bgcolor: photoPreview ? "transparent" : "#e0f2fe",
                    color: "#0891b2",
                    fontSize: "1.6rem",
                  }}
                >
                  {!photoPreview && (
                    <PersonIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />
                  )}
                </Avatar>
                {photoUploading && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "white",
                        fontSize: "0.55rem",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      ...
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: { xs: "0.75rem", sm: "0.82rem" },
                    color: "#1e293b",
                    mb: 0.5,
                  }}
                >
                  Caretaker Photo *
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  disabled={photoUploading}
                  startIcon={
                    <CameraAltIcon sx={{ fontSize: "13px !important" }} />
                  }
                  sx={{
                    borderRadius: 2,
                    borderColor: "#0891b2",
                    color: "#0891b2",
                    fontFamily: "Inter, sans-serif",
                    textTransform: "none",
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    mb: 0.4,
                    px: 1,
                  }}
                >
                  {photoUploading
                    ? "Uploading..."
                    : uploadedPhotoUrl
                      ? "Change"
                      : "Upload Photo"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </Button>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.6rem", sm: "0.65rem" },
                    color: uploadedPhotoUrl ? "#059669" : "#94a3b8",
                    display: "block",
                  }}
                >
                  {uploadedPhotoUrl
                    ? "✓ Uploaded successfully"
                    : "JPG, PNG - Max 5MB"}
                </Typography>
              </Box>
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
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                sx={fieldStyle(isMobile)}
              />
              <TextField
                label="Last Name *"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                size="small"
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                sx={fieldStyle(isMobile)}
              />
            </Box>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}
            >
              <TextField
                label="Mobile *"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                size="small"
                error={!!formErrors.mobileNumber}
                helperText={formErrors.mobileNumber}
                sx={fieldStyle(isMobile)}
              />
              <TextField
                label="Age *"
                name="age"
                value={form.age}
                onChange={handleChange}
                size="small"
                error={!!formErrors.age}
                helperText={formErrors.age}
                sx={fieldStyle(isMobile)}
              />
            </Box>
            <TextField
              label="Aadhaar Number *"
              name="aadhaarNumber"
              value={form.aadhaarNumber}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!formErrors.aadhaarNumber}
              helperText={formErrors.aadhaarNumber || "12 digit Aadhaar"}
              sx={fieldStyle(isMobile)}
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
              sx={fieldStyle(isMobile)}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={resetCreateModal}
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
            onClick={handleCreate}
            disabled={creating || photoUploading}
            startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
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

      {/* Full Image Modal */}
      <Dialog
        open={fullImageOpen}
        onClose={() => setFullImageOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, bgcolor: "#0f172a", mx: { xs: 1.5, sm: 3 } },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "white",
            borderBottom: "1px solid #1e293b",
            py: 1.2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Caretaker Photo
          <IconButton
            size="small"
            onClick={() => setFullImageOpen(false)}
            sx={{ color: "white" }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 250,
          }}
        >
          <Box
            component="img"
            src={fullImageUrl}
            alt="Caretaker Photo"
            sx={{
              width: "100%",
              maxHeight: { xs: 350, sm: 500 },
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CaretakersPage;
