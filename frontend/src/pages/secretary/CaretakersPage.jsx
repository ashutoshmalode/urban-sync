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
  Tabs,
  Tab,
  InputAdornment,
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
  const [tab, setTab] = useState(0);
  const [caretakers, setCaretakers] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  // Delete modal
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
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!/^\d{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Must be exactly 10 digits";
    if (!form.age || Number(form.age) < 18 || Number(form.age) > 70)
      e.age = "Age must be 18-70";
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
      showSuccess("Caretaker created successfully");
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

  // Filter history by search
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
      // ACTIVE always on top
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      // Within same status — newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const LoadingSkeleton = () => (
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
  );

  const CaretakerRow = ({ c, cellSx, headSx, onView }) => (
    <TableRow hover sx={{ "&:hover": { bgcolor: "#f8fbff" } }}>
      <TableCell sx={cellSx}>
        <Chip
          label={`#${c.serialNumber}`}
          size="small"
          sx={{
            bgcolor: c.status === "ACTIVE" ? "#e0f2fe" : "#f1f5f9",
            color: c.status === "ACTIVE" ? "#0891b2" : "#64748b",
            fontWeight: 700,
            fontSize: "0.7rem",
            fontFamily: "Inter, sans-serif",
            height: 22,
          }}
        />
      </TableCell>
      <TableCell sx={cellSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {c.status === "ACTIVE" && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#22c55e",
                boxShadow: "0 0 6px 2px rgba(34,197,94,0.5)",
                flexShrink: 0,
              }}
            />
          )}
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: c.status === "ACTIVE" ? "#e0f2fe" : "#f1f5f9",
              fontSize: "0.75rem",
              color: c.status === "ACTIVE" ? "#0891b2" : "#64748b",
              fontWeight: 700,
            }}
          >
            {c.firstName?.[0]}
          </Avatar>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.82rem",
              fontWeight: c.status === "ACTIVE" ? 700 : 400,
              color: c.status === "ACTIVE" ? "#1e293b" : "#64748b",
            }}
          >
            {c.firstName} {c.lastName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={cellSx}>{c.mobileNumber}</TableCell>
      <TableCell sx={cellSx}>{c.age} yrs</TableCell>
      <TableCell sx={cellSx}>
        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "—"}
      </TableCell>
      <TableCell sx={cellSx}>
        {c.leftAt ? (
          new Date(c.leftAt).toLocaleDateString("en-IN")
        ) : (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.78rem",
              color: "#22c55e",
              fontWeight: 600,
            }}
          >
            Currently Active
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ ...cellSx, maxWidth: 120 }}>
        <Typography
          noWrap
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.78rem",
            color: "#94a3b8",
          }}
        >
          {c.leavingReason || (c.status === "ACTIVE" ? "—" : "—")}
        </Typography>
      </TableCell>
      <TableCell align="center" sx={{ py: 1 }}>
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => onView(c)}
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
  );

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
          sx={{
            bgcolor: "#f8fbff",
            borderBottom: "1px solid #e0f2fe",
            "& .MuiTab-root": {
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "none",
              minHeight: 44,
            },
            "& .Mui-selected": { color: "#0891b2" },
            "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
          }}
        >
          <Tab label={`Active Caretakers (${caretakers.length})`} />
          <Tab
            label={`History (${historyList.length})`}
            icon={<HistoryIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
          />
        </Tabs>

        {loading ? (
          <LoadingSkeleton />
        ) : tab === 0 ? (
          caretakers.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <EngineeringIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#94a3b8",
                  fontSize: "0.88rem",
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
              <Table size="small">
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
                          {/* Green dot for active */}
                          {c.status === "ACTIVE" && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#22c55e",
                                boxShadow: "0 0 6px 2px rgba(34,197,94,0.5)",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor:
                                c.status === "ACTIVE" ? "#e0f2fe" : "#f1f5f9",
                              fontSize: "0.75rem",
                              color:
                                c.status === "ACTIVE" ? "#0891b2" : "#64748b",
                              fontWeight: 700,
                            }}
                          >
                            {c.firstName?.[0]}
                          </Avatar>
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.82rem",
                              fontWeight: c.status === "ACTIVE" ? 700 : 400,
                              color:
                                c.status === "ACTIVE" ? "#1e293b" : "#64748b",
                            }}
                          >
                            {c.firstName} {c.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx}>{c.mobileNumber}</TableCell>
                      <TableCell sx={cellSx}>{c.age} yrs</TableCell>
                      <TableCell sx={cellSx}>
                        <Chip
                          label={c.status || "ACTIVE"}
                          size="small"
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#166534",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            fontFamily: "Inter, sans-serif",
                            height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
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
                                width: 28,
                                height: 28,
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 14 }} />
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
                                width: 28,
                                height: 28,
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} />
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
          // History Tab
          <Box>
            {/* Search bar */}
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid #e0f2fe",
                bgcolor: "#f8fbff",
              }}
            >
              <TextField
                placeholder="Search by name, mobile, Aadhaar or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.82rem",
                    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch("")}>
                          <ClearIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />
            </Box>

            {filteredHistory.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <HistoryIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    color: "#94a3b8",
                    fontSize: "0.88rem",
                  }}
                >
                  {search
                    ? "No caretakers match your search"
                    : "No caretaker history yet"}
                </Typography>
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
                            py: 0.8,
                            px: 2,
                            bgcolor: "#f0fdf4",
                            borderBottom: "1px solid #bbf7d0",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#22c55e",
                                boxShadow: "0 0 6px 2px rgba(34,197,94,0.5)",
                              }}
                            />
                            <Typography
                              sx={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.7rem",
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
                          cellSx={cellSx}
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
                            py: 0.8,
                            px: 2,
                            bgcolor: "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                            borderTop: "2px solid #e0f2fe",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.7rem",
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
                          cellSx={cellSx}
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
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
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
                  bgcolor: selected.status === "ACTIVE" ? "#0891b2" : "#94a3b8",
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
                <Box sx={{ display: "flex", gap: 0.5, mt: 0.3 }}>
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
                      fontSize: "0.68rem",
                      fontFamily: "Inter, sans-serif",
                      height: 20,
                    }}
                  />
                </Box>
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
              icon={<BadgeIcon sx={{ fontSize: 14, color: "#0891b2" }} />}
              label="Joined On"
              value={
                selected.createdAt
                  ? new Date(selected.createdAt).toLocaleDateString("en-IN")
                  : "—"
              }
            />
            {selected.status === "INACTIVE" && (
              <>
                <InfoRow
                  icon={
                    <EventBusyIcon sx={{ fontSize: 14, color: "#dc2626" }} />
                  }
                  label="Left On"
                  value={
                    selected.leftAt
                      ? new Date(selected.leftAt).toLocaleDateString("en-IN")
                      : "—"
                  }
                />
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    bgcolor: "#fef2f2",
                    borderRadius: 2,
                    border: "1px solid #fecaca",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#dc2626",
                      mb: 0.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Leaving Reason
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.85rem",
                      color: "#991b1b",
                    }}
                  >
                    {selected.leavingReason || "—"}
                  </Typography>
                </Box>
              </>
            )}
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
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
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
            gap: 1,
          }}
        >
          <DeleteIcon sx={{ color: "#dc2626", fontSize: 18 }} />
          Remove Caretaker
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {deleteTarget && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f8fbff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.8rem",
                  color: "#64748b",
                }}
              >
                Removing caretaker:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#1e293b",
                }}
              >
                {deleteTarget.firstName} {deleteTarget.lastName} — #
                {deleteTarget.serialNumber}
              </Typography>
            </Box>
          )}
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
              color: "#64748b",
              mb: 2,
            }}
          >
            Please provide a reason for removing this caretaker. This will be
            saved in history records.
          </Typography>
          <TextField
            label="Reason for Removal *"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "Inter, sans-serif",
                "&.Mui-focused fieldset": { borderColor: "#dc2626" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#dc2626" },
              "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => {
              setDeleteOpen(false);
              setDeleteReason("");
              setDeleteTarget(null);
            }}
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
            onClick={handleDelete}
            disabled={!deleteReason.trim() || deleting}
            startIcon={<DeleteIcon fontSize="small" />}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
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
        onClose={() => {
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
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
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
                inputprops={{ maxLength: 10 }}
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
                inputprops={{ maxLength: 2 }}
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
              inputprops={{ maxLength: 12 }}
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
            onClick={() => {
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
            }}
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
            startIcon={<AddIcon fontSize="small" />}
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
