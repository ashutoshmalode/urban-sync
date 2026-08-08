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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
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
    "&.Mui-focused fieldset": { borderColor: "#dc2626" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#dc2626" },
  "& .MuiFormHelperText-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.6rem" : "0.7rem",
  },
});

const StatusChip = ({ status }) => {
  const map = {
    PENDING: { label: "Pending", bgcolor: "#fef9c3", color: "#854d0e" },
    RESOLVED: { label: "Resolved", bgcolor: "#dcfce7", color: "#166534" },
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

const ResidentComplaintsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const flatNumber = useSelector((state) => state.auth.flatNumber);
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    targetType: "ALL",
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
        `/api/complaint/resident/${profileRes.data.id}`,
      );
      setComplaints(res.data);
    } catch {
      showError("Failed to load complaints");
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
      await axiosInstance.post("/api/complaint/raise", {
        raisedById: profile.id,
        subject: form.subject,
        description: form.description,
        targetType: form.targetType,
      });
      showSuccess("Complaint raised successfully");
      setCreateOpen(false);
      setForm({ subject: "", description: "", targetType: "ALL" });
      setFormErrors({});
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to raise complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const pending = complaints.filter((c) => c.status === "PENDING");
  const resolved = complaints.filter((c) => c.status === "RESOLVED");
  const data = tab === 0 ? complaints : tab === 1 ? pending : resolved;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ReportProblemIcon sx={{ color: "#dc2626", fontSize: 18 }} />
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
            My Complaints
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            Raise and track complaints
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
          onClick={() => setCreateOpen(true)}
          sx={{
            bgcolor: "#dc2626",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: { xs: "0.68rem", sm: "0.78rem" },
            px: { xs: 1, sm: 1.5 },
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": { bgcolor: "#b91c1c" },
          }}
        >
          {isMobile ? "Raise" : "Raise Complaint"}
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
          { label: "Total", value: complaints.length, color: "#dc2626" },
          { label: "Pending", value: pending.length, color: "#d97706" },
          { label: "Resolved", value: resolved.length, color: "#059669" },
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
              {loading ? "—" : s.value}
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
              px: { xs: 1.5, sm: 2 },
            },
            "& .Mui-selected": { color: "#dc2626" },
            "& .MuiTabs-indicator": { bgcolor: "#dc2626" },
          }}
        >
          <Tab label={`All (${complaints.length})`} />
          <Tab label={`Pending (${pending.length})`} />
          <Tab label={`Resolved (${resolved.length})`} />
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
            <ReportProblemIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            >
              No complaints found
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Subject</TableCell>
                  <TableCell sx={headSx}>Target</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((c) => (
                  <TableRow
                    key={c.id}
                    hover
                    onClick={() => {
                      setSelected(c);
                      setDetailOpen(true);
                    }}
                    sx={{
                      "&:hover": { bgcolor: "#f8fbff" },
                      cursor: "pointer",
                    }}
                  >
                    <TableCell sx={{ ...cellSx, maxWidth: 180 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {c.subject}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={c.targetType || "ALL"}
                        size="small"
                        sx={{
                          bgcolor: "#f1f5f9",
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.6rem",
                          fontFamily: "Inter, sans-serif",
                          height: 18,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <StatusChip status={c.status} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-IN")
                        : "—"}
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
          <ReportProblemIcon sx={{ color: "#dc2626", fontSize: 16 }} />
          Complaint Details
          {selected && <StatusChip status={selected.status} />}
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            <DetailRow label="Subject" value={selected.subject} />
            <DetailRow label="Target" value={selected.targetType || "ALL"} />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow
              label="Submitted"
              value={new Date(selected.createdAt).toLocaleString("en-IN")}
            />
            {selected.resolvedAt && (
              <DetailRow
                label="Resolved"
                value={new Date(selected.resolvedAt).toLocaleString("en-IN")}
              />
            )}
            <Box
              sx={{
                mt: 1.5,
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
          setForm({ subject: "", description: "", targetType: "ALL" });
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
          <AddIcon sx={{ color: "#dc2626", fontSize: 16 }} />
          Raise New Complaint
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
            <FormControl size="small" sx={fieldStyle(isMobile)}>
              <InputLabel
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                Target
              </InputLabel>
              <Select
                value={form.targetType}
                onChange={(e) =>
                  setForm({ ...form, targetType: e.target.value })
                }
                label="Target"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                <MenuItem
                  value="ALL"
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
                >
                  All / Society
                </MenuItem>
                <MenuItem
                  value="RESIDENT"
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
                >
                  Specific Resident
                </MenuItem>
              </Select>
            </FormControl>
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
              setForm({ subject: "", description: "", targetType: "ALL" });
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
              bgcolor: "#dc2626",
              borderRadius: 2,
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            {submitting ? "Submitting..." : "Raise Complaint"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResidentComplaintsPage;
