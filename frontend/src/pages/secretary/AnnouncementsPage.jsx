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
  useMediaQuery,
  useTheme,
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
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiFormHelperText-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.6rem" : "0.7rem",
  },
});

const TypeChip = ({ type }) => {
  const map = {
    ALERT: {
      label: "Alert",
      bgcolor: "#fee2e2",
      color: "#dc2626",
      icon: <WarningAmberIcon sx={{ fontSize: 11 }} />,
    },
    NOTIFICATION: {
      label: "Notification",
      bgcolor: "#e0f2fe",
      color: "#0891b2",
      icon: <NotificationsIcon sx={{ fontSize: 11 }} />,
    },
    GENERAL: {
      label: "General",
      bgcolor: "#f1f5f9",
      color: "#475569",
      icon: <InfoIcon sx={{ fontSize: 11 }} />,
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
        fontSize: "0.62rem",
        fontFamily: "Inter, sans-serif",
        height: 20,
        "& .MuiChip-icon": { color: t.color },
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

const AnnouncementsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [secretaryId, setSecretaryId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    type: "NOTIFICATION",
    title: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
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
      showSuccess("Announcement created");
      setCreateOpen(false);
      setForm({ type: "NOTIFICATION", title: "", message: "" });
      setFormErrors({});
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
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
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const alerts = announcements.filter((a) => a.type === "ALERT");
  const notifications = announcements.filter((a) => a.type === "NOTIFICATION");
  const general = announcements.filter((a) => a.type === "GENERAL");

  const LoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={44}
          sx={{ mb: 1, borderRadius: 1.5 }}
        />
      ))}
    </Box>
  );

  const AnnouncementTable = ({ data }) =>
    data.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <CampaignIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            color: "#94a3b8",
            fontSize: "0.85rem",
          }}
        >
          No announcements found
        </Typography>
      </Box>
    ) : (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 440 }}>
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
                <TableCell sx={{ ...cellSx, maxWidth: 180 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.78rem",
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
                    : "-"}
                </TableCell>
                <TableCell sx={{ py: 0.8, px: 1, whiteSpace: "nowrap" }}>
                  <Box sx={{ display: "flex", gap: 0.4 }}>
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
                          width: 26,
                          height: 26,
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 13 }} />
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
            bgcolor: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CampaignIcon sx={{ color: "#d97706", fontSize: 18 }} />
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
            Announcements
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            {isMobile
              ? "Society announcements"
              : "Create and manage society announcements"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
          onClick={() => setCreateOpen(true)}
          sx={{
            bgcolor: "#d97706",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: { xs: "0.68rem", sm: "0.78rem" },
            px: { xs: 1, sm: 1.5 },
            whiteSpace: "nowrap",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(217,119,6,0.25)",
            "&:hover": { bgcolor: "#b45309" },
          }}
        >
          {isMobile ? "New" : "New Announcement"}
        </Button>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: { xs: 1, sm: 1.5, md: 2 },
          mb: 2,
        }}
      >
        {[
          { label: "Total", value: announcements.length, color: "#d97706" },
          { label: "Alerts", value: alerts.length, color: "#dc2626" },
          {
            label: isMobile ? "Notifs" : "Notifications",
            value: notifications.length,
            color: "#0891b2",
          },
        ].map((stat) => (
          <Paper
            key={stat.label}
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
                mb: 0.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {stat.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
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
            "& .Mui-selected": { color: "#0891b2" },
            "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
          }}
        >
          <Tab label={`All (${announcements.length})`} />
          <Tab label={`Alerts (${alerts.length})`} />
          <Tab label={`Notifs (${notifications.length})`} />
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
          <CampaignIcon sx={{ color: "#d97706", fontSize: 16 }} />
          Announcement Details
          {selected && <TypeChip type={selected.type} />}
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            <DetailRow label="Title" value={selected.title} />
            <DetailRow label="Type" value={selected.type} />
            <DetailRow
              label="Created By"
              value={selected.createdByName || "Secretary"}
            />
            <DetailRow
              label="Created On"
              value={new Date(selected.createdAt).toLocaleString("en-IN")}
            />
            <Box
              sx={{
                mt: 1.5,
                p: 1.2,
                bgcolor: "#fffbeb",
                borderRadius: 2,
                border: "1px solid #fde68a",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  color: "#d97706",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.6,
                }}
              >
                Message
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
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
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
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
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setDeleteId(selected?.id);
              setDeleteOpen(true);
            }}
            startIcon={<DeleteIcon sx={{ fontSize: "13px !important" }} />}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
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
          <AddIcon sx={{ color: "#d97706", fontSize: 16 }} />
          Create Announcement
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <FormControl size="small" sx={fieldStyle(isMobile)}>
              <InputLabel
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                Type *
              </InputLabel>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                label="Type *"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                <MenuItem
                  value="ALERT"
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
                >
                  🔴 Alert
                </MenuItem>
                <MenuItem
                  value="NOTIFICATION"
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
                >
                  🔵 Notification
                </MenuItem>
                <MenuItem
                  value="GENERAL"
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
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
              sx={fieldStyle(isMobile)}
            />
            <TextField
              label="Message *"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              size="small"
              fullWidth
              multiline
              rows={isMobile ? 3 : 4}
              error={!!formErrors.message}
              helperText={formErrors.message}
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
              setForm({ type: "NOTIFICATION", title: "", message: "" });
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
            onClick={handleCreate}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#d97706",
              borderRadius: 2,
              "&:hover": { bgcolor: "#b45309" },
            }}
          >
            {actionLoading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
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
          }}
        >
          Delete Announcement
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.78rem", sm: "0.88rem" },
              color: "#64748b",
            }}
          >
            Are you sure? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => setDeleteOpen(false)}
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
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
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
