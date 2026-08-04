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
  IconButton,
  Tooltip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
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

const TypeChip = ({ type }) => {
  const map = {
    ALERT: {
      label: "Alert",
      bgcolor: "#fee2e2",
      color: "#dc2626",
      icon: <WarningAmberIcon sx={{ fontSize: 12 }} />,
    },
    NOTIFICATION: {
      label: "Notification",
      bgcolor: "#e0f2fe",
      color: "#0891b2",
      icon: <NotificationsIcon sx={{ fontSize: 12 }} />,
    },
    GENERAL: {
      label: "General",
      bgcolor: "#f1f5f9",
      color: "#475569",
      icon: <InfoIcon sx={{ fontSize: 12 }} />,
    },
  };
  const t = map[type] || map.GENERAL;
  return (
    <Chip
      icon={t.icon}
      label={t.label}
      size="small"
      sx={{
        bgcolor: t.bgcolor,
        color: t.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        fontFamily: "Inter, sans-serif",
        height: 22,
        "& .MuiChip-icon": { color: t.color },
      }}
    />
  );
};

const AnnouncementsPage = () => {
  const [tab, setTab] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [secretaryId, setSecretaryId] = useState(null);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    type: "NOTIFICATION",
    title: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [announcementsRes, secretaryRes] = await Promise.all([
        axiosInstance.get("/api/announcement/all"),
        axiosInstance.get("/api/secretary/profile"),
      ]);
      setAnnouncements(announcementsRes.data);
      setSecretaryId(secretaryRes.data.id);
    } catch {
      showError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.message.trim()) e.message = "Required";
    setFormErrors(e);
    if (Object.values(e).some((v) => v)) return;

    setActionLoading(true);
    try {
      await axiosInstance.post("/api/announcement/create", {
        createdById: secretaryId,
        type: form.type,
        title: form.title,
        message: form.message,
      });
      showSuccess("Announcement created successfully");
      setCreateOpen(false);
      setForm({ type: "NOTIFICATION", title: "", message: "" });
      setFormErrors({});
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create announcement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.delete(`/api/announcement/${deleteId}`);
      showSuccess("Announcement deleted");
      setDeleteOpen(false);
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  };

  const alerts = announcements.filter((a) => a.type === "ALERT");
  const notifications = announcements.filter((a) => a.type === "NOTIFICATION");
  const general = announcements.filter((a) => a.type === "GENERAL");

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

  const AnnouncementTable = ({ data }) =>
    data.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CampaignIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            color: "#94a3b8",
            fontSize: "0.88rem",
          }}
        >
          No announcements found
        </Typography>
      </Box>
    ) : (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headSx}>Type</TableCell>
              <TableCell sx={headSx}>Title</TableCell>
              <TableCell sx={headSx}>Created By</TableCell>
              <TableCell sx={headSx}>Date</TableCell>
              <TableCell sx={headSx}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((a) => (
              <TableRow
                key={a.id}
                hover
                sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
              >
                <TableCell sx={cellSx}>
                  <TypeChip type={a.type} />
                </TableCell>
                <TableCell sx={{ ...cellSx, maxWidth: 250 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {a.title}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  {a.createdByName || "Secretary"}
                </TableCell>
                <TableCell sx={cellSx}>
                  {a.createdAt
                    ? new Date(a.createdAt).toLocaleDateString("en-IN")
                    : "—"}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelected(a);
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
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeleteId(a.id);
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
            bgcolor: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CampaignIcon sx={{ color: "#d97706", fontSize: 20 }} />
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
            Announcements
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Create and manage society announcements
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setCreateOpen(true)}
          sx={{
            bgcolor: "#d97706",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "0.8rem",
            px: 2,
            boxShadow: "0 2px 6px rgba(217,119,6,0.25)",
            "&:hover": { bgcolor: "#b45309" },
          }}
        >
          New Announcement
        </Button>
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
          { label: "Total", value: announcements.length, color: "#d97706" },
          { label: "Alerts", value: alerts.length, color: "#dc2626" },
          {
            label: "Notifications",
            value: notifications.length,
            color: "#0891b2",
          },
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
          <Tab label={`All (${announcements.length})`} />
          <Tab label={`Alerts (${alerts.length})`} />
          <Tab label={`Notifications (${notifications.length})`} />
          <Tab label={`General (${general.length})`} />
        </Tabs>

        {loading ? (
          <LoadingSkeleton />
        ) : tab === 0 ? (
          <AnnouncementTable data={announcements} />
        ) : tab === 1 ? (
          <AnnouncementTable data={alerts} />
        ) : tab === 2 ? (
          <AnnouncementTable data={notifications} />
        ) : (
          <AnnouncementTable data={general} />
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
          <CampaignIcon sx={{ color: "#d97706", fontSize: 18 }} />
          Announcement Details
          {selected && <TypeChip type={selected.type} />}
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 2 }}>
            {[
              ["Title", selected.title],
              ["Type", selected.type],
              ["Created By", selected.createdByName || "Secretary"],
              [
                "Created On",
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
                bgcolor: "#fffbeb",
                borderRadius: 2,
                border: "1px solid #fde68a",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#d97706",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.8,
                }}
              >
                Message
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
                {selected.message}
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
          <Button
            variant="contained"
            onClick={() => {
              setDeleteId(selected?.id);
              setDeleteOpen(true);
            }}
            startIcon={<DeleteIcon fontSize="small" />}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#dc2626",
              borderRadius: 2,
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Modal */}
      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setForm({ type: "NOTIFICATION", title: "", message: "" });
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
            gap: 1,
          }}
        >
          <AddIcon sx={{ color: "#d97706", fontSize: 18 }} />
          Create Announcement
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl size="small" sx={fieldStyle}>
              <InputLabel sx={{ fontFamily: "Inter, sans-serif" }}>
                Type *
              </InputLabel>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                label="Type *"
                sx={{ fontFamily: "Inter, sans-serif" }}
              >
                <MenuItem
                  value="ALERT"
                  sx={{ fontFamily: "Inter, sans-serif" }}
                >
                  🔴 Alert
                </MenuItem>
                <MenuItem
                  value="NOTIFICATION"
                  sx={{ fontFamily: "Inter, sans-serif" }}
                >
                  🔵 Notification
                </MenuItem>
                <MenuItem
                  value="GENERAL"
                  sx={{ fontFamily: "Inter, sans-serif" }}
                >
                  ⚪ General
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              size="small"
              fullWidth
              error={!!formErrors.title}
              helperText={formErrors.title}
              sx={fieldStyle}
            />
            <TextField
              label="Message *"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              size="small"
              fullWidth
              multiline
              rows={4}
              error={!!formErrors.message}
              helperText={formErrors.message}
              sx={fieldStyle}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setForm({ type: "NOTIFICATION", title: "", message: "" });
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
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#d97706",
              borderRadius: 2,
              "&:hover": { bgcolor: "#b45309" },
            }}
          >
            {actionLoading ? "Creating..." : "Create Announcement"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
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
          }}
        >
          Delete Announcement
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.88rem",
              color: "#64748b",
            }}
          >
            Are you sure you want to delete this announcement? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setDeleteOpen(false)}
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
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#dc2626",
              borderRadius: 2,
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementsPage;
