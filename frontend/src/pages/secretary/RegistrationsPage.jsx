import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";

// const fontStyle = { fontFamily: "Inter, sans-serif" };

const StatusChip = ({ status }) => {
  const map = {
    PENDING: { label: "Pending", bgcolor: "#fef9c3", color: "#854d0e" },
    APPROVED: { label: "Approved", bgcolor: "#dcfce7", color: "#166534" },
    REJECTED: { label: "Rejected", bgcolor: "#fee2e2", color: "#991b1b" },
  };
  const s = map[status] || map.PENDING;
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        bgcolor: s.bgcolor,
        color: s.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        fontFamily: "Inter, sans-serif",
        height: 22,
      }}
    />
  );
};

const TypeChip = ({ type }) => (
  <Chip
    label={type}
    size="small"
    sx={{
      bgcolor: type === "OWNER" ? "#e0f2fe" : "#f3e8ff",
      color: type === "OWNER" ? "#0891b2" : "#7c3aed",
      fontWeight: 700,
      fontSize: "0.7rem",
      fontFamily: "Inter, sans-serif",
      height: 22,
    }}
  />
);

const cellSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.82rem",
  color: "#1e293b",
  py: 1.2,
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

const RegistrationsPage = () => {
  const [tab, setTab] = useState(0);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, showError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        axiosInstance.get("/api/registration/pending"),
        axiosInstance.get("/api/registration/history"),
      ]);
      setPending(pendingRes.data);
      setHistory(historyRes.data);
    } catch {
      showError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/api/registration/${id}/approve`);
      showSuccess("Registration approved successfully");
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/api/registration/${rejectId}/reject`, {
        reason: rejectReason,
      });
      showSuccess("Registration rejected");
      setRejectOpen(false);
      setRejectReason("");
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = (row) => {
    setSelected(row);
    setDetailOpen(true);
  };
  const openReject = (id) => {
    setRejectId(id);
    setRejectOpen(true);
  };

  const LoadingSkeleton = () => (
    <Box>
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

  const EmptyState = ({ message }) => (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <PersonIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          color: "#94a3b8",
          fontSize: "0.88rem",
        }}
      >
        {message}
      </Typography>
    </Box>
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
          <HowToRegIcon sx={{ color: "#0891b2", fontSize: 20 }} />
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
            Registrations
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Manage resident registration requests
          </Typography>
        </Box>
        <Chip
          label={`${pending.length} Pending`}
          size="small"
          sx={{
            bgcolor: pending.length > 0 ? "#fef9c3" : "#f1f5f9",
            color: pending.length > 0 ? "#854d0e" : "#64748b",
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            fontSize: "0.72rem",
          }}
        />
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => showError("")}
          sx={{ mb: 2, borderRadius: 2, fontFamily: "Inter, sans-serif" }}
        >
          {error}
        </Alert>
      )}

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
          <Tab label={`Pending Requests (${pending.length})`} />
          <Tab
            label={`History (${history.length})`}
            icon={<HistoryIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
          />
        </Tabs>

        {loading ? (
          <Box sx={{ p: 3 }}>
            <LoadingSkeleton />
          </Box>
        ) : tab === 0 ? (
          pending.length === 0 ? (
            <EmptyState message="No pending registration requests" />
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>Name</TableCell>
                    <TableCell sx={headSx}>Mobile</TableCell>
                    <TableCell sx={headSx}>Type</TableCell>
                    <TableCell sx={headSx}>Wing</TableCell>
                    <TableCell sx={headSx}>Flat</TableCell>
                    <TableCell sx={headSx}>Date</TableCell>
                    <TableCell sx={headSx} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pending.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                    >
                      <TableCell sx={cellSx}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "#e0f2fe",
                              fontSize: "0.75rem",
                              color: "#0891b2",
                              fontWeight: 700,
                            }}
                          >
                            {row.firstName?.[0]}
                          </Avatar>
                          {row.firstName} {row.lastName}
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx}>{row.mobileNumber}</TableCell>
                      <TableCell sx={cellSx}>
                        <TypeChip type={row.residentType} />
                      </TableCell>
                      <TableCell sx={cellSx}>{row.wingName || "—"}</TableCell>
                      <TableCell sx={cellSx}>{row.flatNumber}</TableCell>
                      <TableCell sx={cellSx}>
                        {new Date(row.createdAt).toLocaleDateString("en-IN")}
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
                              onClick={() => openDetail(row)}
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
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(row.id)}
                              disabled={actionLoading}
                              sx={{
                                color: "#059669",
                                bgcolor: "#dcfce7",
                                borderRadius: 1.5,
                                width: 28,
                                height: 28,
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => openReject(row.id)}
                              sx={{
                                color: "#dc2626",
                                bgcolor: "#fee2e2",
                                borderRadius: 1.5,
                                width: 28,
                                height: 28,
                              }}
                            >
                              <CancelIcon sx={{ fontSize: 14 }} />
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
        ) : history.length === 0 ? (
          <EmptyState message="No registration history yet" />
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Name</TableCell>
                  <TableCell sx={headSx}>Mobile</TableCell>
                  <TableCell sx={headSx}>Type</TableCell>
                  <TableCell sx={headSx}>Flat</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx}>Reason</TableCell>
                  <TableCell sx={headSx}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                  >
                    <TableCell sx={cellSx}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: "#e0f2fe",
                            fontSize: "0.75rem",
                            color: "#0891b2",
                            fontWeight: 700,
                          }}
                        >
                          {row.firstName?.[0]}
                        </Avatar>
                        {row.firstName} {row.lastName}
                      </Box>
                    </TableCell>
                    <TableCell sx={cellSx}>{row.mobileNumber}</TableCell>
                    <TableCell sx={cellSx}>
                      <TypeChip type={row.residentType} />
                    </TableCell>
                    <TableCell sx={cellSx}>{row.flatNumber}</TableCell>
                    <TableCell sx={cellSx}>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell
                      sx={{ ...cellSx, color: "#94a3b8", maxWidth: 150 }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.8rem",
                          color: "#94a3b8",
                        }}
                      >
                        {row.rejectionReason || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {new Date(row.createdAt).toLocaleDateString("en-IN")}
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
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, fontFamily: "Inter, sans-serif" },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 2,
          }}
        >
          Registration Request Details
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 2 }}>
            {[
              ["Full Name", `${selected.firstName} ${selected.lastName}`],
              ["Mobile Number", selected.mobileNumber],
              ["Aadhaar Last 4", selected.aadhaarLastFour],
              ["Resident Type", selected.residentType],
              ["Wing", selected.wingName || "—"],
              ["Flat Number", selected.flatNumber],
              ...(selected.residentType === "TENANT"
                ? [
                    ["Landlord Name", selected.landlordName],
                    ["Landlord Flat", selected.landlordFlatNumber],
                    ["Landlord Mobile", selected.landlordMobileNumber],
                  ]
                : []),
              [
                "Submitted On",
                new Date(selected.createdAt).toLocaleString("en-IN"),
              ],
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                  borderBottom: "1px solid #f1f5f9",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.8rem",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.85rem",
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
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
          <Button
            variant="outlined"
            onClick={() => {
              setDetailOpen(false);
              openReject(selected?.id);
            }}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              borderColor: "#dc2626",
              color: "#dc2626",
              "&:hover": { bgcolor: "#fee2e2", borderColor: "#dc2626" },
            }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            onClick={() => handleApprove(selected?.id)}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#059669",
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            {actionLoading ? "Approving..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Modal */}
      <Dialog
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectReason("");
        }}
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
          }}
        >
          Reject Registration
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
              color: "#64748b",
              mb: 2,
            }}
          >
            Please provide a reason for rejection. This will be visible to the
            applicant.
          </Typography>
          <TextField
            label="Rejection Reason *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
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
              setRejectOpen(false);
              setRejectReason("");
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
            onClick={handleReject}
            disabled={!rejectReason.trim() || actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            {actionLoading ? "Rejecting..." : "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistrationsPage;
