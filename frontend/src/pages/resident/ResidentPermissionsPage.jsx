import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Button,
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
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddIcon from "@mui/icons-material/Add";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";

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

const fieldStyle = (isMobile) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
    "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
  "& .MuiFormHelperText-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.6rem" : "0.7rem",
  },
});

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
        fontSize: "0.62rem",
        fontFamily: "Inter, sans-serif",
        height: 20,
      }}
    />
  );
};

const DetailRow = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      py: 0.8,
      borderBottom: "1px solid #f1f5f9",
      alignItems: "flex-start",
      gap: 1,
    }}
  >
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "0.72rem", sm: "0.8rem" },
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
        fontSize: { xs: "0.72rem", sm: "0.85rem" },
        color: "#1e293b",
        fontWeight: 600,
        textAlign: "right",
        wordBreak: "break-word",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const ResidentPermissionsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const flatNumber = useSelector((state) => state.auth.flatNumber);
  const [profile, setProfile] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    requestDate: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await axiosInstance.get(
        `/api/resident/profile?flatNumber=${flatNumber}`,
      );
      setProfile(profileRes.data);
      const res = await axiosInstance.get(
        `/api/permission/resident/${profileRes.data.id}`,
      );
      setPermissions(res.data);
    } catch {
      showError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flatNumber) loadData();
  }, [flatNumber]);

  const handleSubmit = async () => {
    const e = {};
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.description.trim()) e.description = "Required";
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    try {
      await axiosInstance.post("/api/permission/raise", {
        raisedById: profile.id,
        subject: form.subject,
        description: form.description,
        requestDate: form.requestDate || null,
      });
      showSuccess("Permission request submitted");
      setCreateOpen(false);
      setForm({ subject: "", description: "", requestDate: "" });
      setFormErrors({});
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const pending = permissions.filter((p) => p.status === "PENDING");
  const approved = permissions.filter((p) => p.status === "APPROVED");
  const rejected = permissions.filter((p) => p.status === "REJECTED");
  const data =
    tab === 0
      ? permissions
      : tab === 1
        ? pending
        : tab === 2
          ? approved
          : rejected;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: "#f3e8ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LockOpenIcon sx={{ color: "#7c3aed", fontSize: 18 }} />
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
            Permission Requests
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            Request and track entry permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
          onClick={() => setCreateOpen(true)}
          sx={{
            bgcolor: "#7c3aed",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: { xs: "0.68rem", sm: "0.78rem" },
            px: { xs: 1, sm: 1.5 },
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": { bgcolor: "#6d28d9" },
          }}
        >
          {isMobile ? "New" : "New Request"}
        </Button>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: { xs: 1, sm: 2 },
          mb: 2,
        }}
      >
        {[
          { label: "Total", value: permissions.length, color: "#7c3aed" },
          { label: "Approved", value: approved.length, color: "#059669" },
          { label: "Pending", value: pending.length, color: "#d97706" },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              p: { xs: 1.2, sm: 2 },
              borderRadius: 3,
              border: "1px solid #e0f2fe",
              boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.58rem", sm: "0.7rem" },
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                fontWeight: 800,
                color: s.color,
              }}
            >
              {loading ? "-" : s.value}
            </Typography>
          </Paper>
        ))}
      </Box>

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
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            bgcolor: "#f8fbff",
            borderBottom: "1px solid #e0f2fe",
            "& .MuiTab-root": {
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.68rem", sm: "0.8rem" },
              textTransform: "none",
              minHeight: 42,
              px: { xs: 1.2, sm: 2 },
            },
            "& .Mui-selected": { color: "#7c3aed" },
            "& .MuiTabs-indicator": { bgcolor: "#7c3aed" },
          }}
        >
          <Tab label={`All (${permissions.length})`} />
          <Tab label={`Pending (${pending.length})`} />
          <Tab label={`Approved (${approved.length})`} />
          <Tab label={`Rejected (${rejected.length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={44}
                sx={{ mb: 1, borderRadius: 1.5 }}
              />
            ))}
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <LockOpenIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            >
              No permission requests found
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Subject</TableCell>
                  <TableCell sx={headSx}>Req. Date</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx}>Submitted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((p) => (
                  <TableRow
                    key={p.id}
                    hover
                    onClick={() => {
                      setSelected(p);
                      setDetailOpen(true);
                    }}
                    sx={{
                      "&:hover": { bgcolor: "#f8fbff" },
                      cursor: "pointer",
                    }}
                  >
                    <TableCell sx={{ ...cellSx, maxWidth: 160 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {p.subject}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {p.requestDate
                        ? new Date(p.requestDate).toLocaleDateString("en-IN")
                        : "-"}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <StatusChip status={p.status} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-IN")
                        : "-"}
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
          <LockOpenIcon sx={{ color: "#7c3aed", fontSize: 16 }} />
          Permission Details
          {selected && <StatusChip status={selected.status} />}
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            <DetailRow label="Subject" value={selected.subject} />
            <DetailRow
              label="Request Date"
              value={
                selected.requestDate
                  ? new Date(selected.requestDate).toLocaleDateString("en-IN")
                  : "-"
              }
            />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow
              label="Submitted"
              value={new Date(selected.createdAt).toLocaleString("en-IN")}
            />
            {selected.rejectionReason && (
              <DetailRow
                label="Rejection Reason"
                value={selected.rejectionReason}
              />
            )}
            <Box
              sx={{
                mt: 1.5,
                p: 1.2,
                bgcolor: "#f5f3ff",
                borderRadius: 2,
                border: "1px solid #e9d5ff",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  color: "#7c3aed",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.6,
                }}
              >
                Description
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  color: "#1e293b",
                  lineHeight: 1.7,
                }}
              >
                {selected.description}
              </Typography>
            </Box>
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

      {/* Create Modal */}
      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setForm({ subject: "", description: "", requestDate: "" });
          setFormErrors({});
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
          <AddIcon sx={{ color: "#7c3aed", fontSize: 16 }} />
          New Permission Request
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
              label="Subject *"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              size="small"
              fullWidth
              error={!!formErrors.subject}
              helperText={formErrors.subject}
              sx={fieldStyle(isMobile)}
            />
            <TextField
              label="Request Date"
              value={form.requestDate}
              onChange={(e) =>
                setForm({ ...form, requestDate: e.target.value })
              }
              size="small"
              fullWidth
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldStyle(isMobile)}
            />
            <TextField
              label="Description *"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              size="small"
              fullWidth
              multiline
              rows={isMobile ? 3 : 4}
              error={!!formErrors.description}
              helperText={formErrors.description}
              sx={fieldStyle(isMobile)}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => {
              setCreateOpen(false);
              setForm({ subject: "", description: "", requestDate: "" });
              setFormErrors({});
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
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#7c3aed",
              borderRadius: 2,
              "&:hover": { bgcolor: "#6d28d9" },
            }}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentPermissionsPage;
