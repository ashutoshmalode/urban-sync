import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";

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

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
};

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

const PermissionsPage = () => {
  const [tab, setTab] = useState(0);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const res = await axiosInstance.get("/api/permission/all");
      setPermissions(res.data);
    } catch {
      showError("Failed to load permission requests");
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
      await axiosInstance.put(`/api/permission/${id}/approve`);
      showSuccess("Permission request approved");
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showError("Please enter rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/permission/${rejectId}/reject`, {
        reason: rejectReason,
      });
      showSuccess("Permission request rejected");
      setRejectOpen(false);
      setRejectReason("");
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const pending = permissions.filter((p) => p.status === "PENDING");
  const approved = permissions.filter((p) => p.status === "APPROVED");
  const rejected = permissions.filter((p) => p.status === "REJECTED");

  const LoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {[...Array(5)].map((_, i) => (
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
      <LockOpenIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
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

  const PermissionTable = ({ data }) =>
    data.length === 0 ? (
      <EmptyState message="No permission requests found" />
    ) : (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headSx}>Raised By</TableCell>
              <TableCell sx={headSx}>Subject</TableCell>
              <TableCell sx={headSx}>Flat</TableCell>
              <TableCell sx={headSx}>Request Date</TableCell>
              <TableCell sx={headSx}>Status</TableCell>
              <TableCell sx={headSx}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((p) => (
              <TableRow
                key={p.id}
                hover
                sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
              >
                <TableCell sx={cellSx}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                      {p.raisedByName?.[0] || "?"}
                    </Avatar>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      {p.raisedByName || "Unknown"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ ...cellSx, maxWidth: 200 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    {p.subject}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>{p.raisedByFlat || "—"}</TableCell>
                <TableCell sx={cellSx}>
                  {p.requestDate
                    ? new Date(p.requestDate).toLocaleDateString("en-IN")
                    : "—"}
                </TableCell>
                <TableCell sx={cellSx}>
                  <StatusChip status={p.status} />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelected(p);
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
                    {p.status === "PENDING" ? (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(p.id)}
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
                            onClick={() => {
                              setRejectId(p.id);
                              setRejectOpen(true);
                            }}
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
                      </>
                    ) : (
                      <>
                        <Tooltip
                          title={
                            p.status === "APPROVED"
                              ? "Approved"
                              : "Not Approved"
                          }
                        >
                          <IconButton
                            size="small"
                            disableRipple
                            sx={{
                              color: "#cbd5e1",
                              bgcolor: "#f1f5f9",
                              borderRadius: 1.5,
                              width: 28,
                              height: 28,
                              cursor: "default",
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            p.status === "REJECTED"
                              ? "Rejected"
                              : "Not Rejected"
                          }
                        >
                          <IconButton
                            size="small"
                            disableRipple
                            sx={{
                              color: "#cbd5e1",
                              bgcolor: "#f1f5f9",
                              borderRadius: 1.5,
                              width: 28,
                              height: 28,
                              cursor: "default",
                            }}
                          >
                            <CancelIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
          <LockOpenIcon sx={{ color: "#0891b2", fontSize: 20 }} />
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
            Permission Requests
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Manage resident permission requests
          </Typography>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mb: 2.5,
        }}
      >
        {[
          {
            label: "Total Requests",
            value: permissions.length,
            color: "#0891b2",
          },
          { label: "Pending", value: pending.length, color: "#d97706" },
          { label: "Approved", value: approved.length, color: "#059669" },
        ].map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #e0f2fe",
              boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {stat.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: stat.color,
              }}
            >
              {loading ? "—" : stat.value}
            </Typography>
          </Paper>
        ))}
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
          <Tab label={`All (${permissions.length})`} />
          <Tab label={`Pending (${pending.length})`} />
          <Tab label={`Approved (${approved.length})`} />
          <Tab label={`Rejected (${rejected.length})`} />
        </Tabs>

        {loading ? (
          <LoadingSkeleton />
        ) : tab === 0 ? (
          <PermissionTable data={permissions} />
        ) : tab === 1 ? (
          <PermissionTable data={pending} />
        ) : tab === 2 ? (
          <PermissionTable data={approved} />
        ) : (
          <PermissionTable data={rejected} />
        )}
      </Paper>

      {/* Detail Modal */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
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
            gap: 1,
          }}
        >
          <LockOpenIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Permission Request Details
          {selected && <StatusChip status={selected.status} />}
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 2 }}>
            {[
              ["Raised By", selected.raisedByName || "Unknown"],
              ["Flat", selected.raisedByFlat || "—"],
              ["Subject", selected.subject],
              [
                "Request Date",
                selected.requestDate
                  ? new Date(selected.requestDate).toLocaleDateString("en-IN")
                  : "—",
              ],
              ["Status", selected.status],
              [
                "Submitted On",
                new Date(selected.createdAt).toLocaleString("en-IN"),
              ],
              ...(selected.rejectionReason
                ? [["Rejection Reason", selected.rejectionReason]]
                : []),
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                  borderBottom: "1px solid #f1f5f9",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.8rem",
                    color: "#64748b",
                    fontWeight: 500,
                    flexShrink: 0,
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
                    textAlign: "right",
                  }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: "#f0f9ff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#0891b2",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.8,
                }}
              >
                Description
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.85rem",
                  color: "#1e293b",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selected.description}
              </Typography>
            </Box>
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
          {selected?.status === "PENDING" && (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  setRejectId(selected.id);
                  setRejectOpen(true);
                }}
                startIcon={<CancelIcon fontSize="small" />}
                sx={{
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  borderColor: "#dc2626",
                  color: "#dc2626",
                  borderRadius: 2,
                }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                onClick={() => handleApprove(selected.id)}
                disabled={actionLoading}
                startIcon={<CheckCircleIcon fontSize="small" />}
                sx={{
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  bgcolor: "#059669",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#047857" },
                }}
              >
                {actionLoading ? "Approving..." : "Approve"}
              </Button>
            </>
          )}
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
          <CancelIcon sx={{ color: "#dc2626", fontSize: 18 }} />
          Reject Permission Request
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
            Please provide a reason for rejecting this permission request.
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
            disabled={actionLoading || !rejectReason.trim()}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#dc2626",
              borderRadius: 2,
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

export default PermissionsPage;
