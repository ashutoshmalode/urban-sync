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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import EngineeringIcon from "@mui/icons-material/Engineering";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";
import { uploadMultipleToCloudinary } from "../../utils/cloudinary";

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

const StatusChip = ({ status }) => {
  const map = {
    PENDING: { label: "Pending", bgcolor: "#fef9c3", color: "#854d0e" },
    PROCESSING: { label: "Processing", bgcolor: "#e0f2fe", color: "#0891b2" },
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

const ComplaintsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [caretakers, setCaretakers] = useState([]);
  const [secretaryId, setSecretaryId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [issueDetailOpen, setIssueDetailOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    assignedToId: "",
    title: "",
    description: "",
  });
  const [issueFormErrors, setIssueFormErrors] = useState({});
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [updateIssueId, setUpdateIssueId] = useState(null);
  const [newStatus, setNewStatus] = useState("PROCESSING");
  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);
  const [mediaUploadComplaintId, setMediaUploadComplaintId] = useState(null);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaType, setMediaType] = useState("IMAGE");
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [galleryComplaintTitle, setGalleryComplaintTitle] = useState("");
  const [issueMediaUploadOpen, setIssueMediaUploadOpen] = useState(false);
  const [issueMediaUploadId, setIssueMediaUploadId] = useState(null);
  const [selectedIssueMediaFiles, setSelectedIssueMediaFiles] = useState([]);
  const [issueMediaPreviews, setIssueMediaPreviews] = useState([]);
  const [uploadingIssueMedia, setUploadingIssueMedia] = useState(false);
  const [issueMediaType, setIssueMediaType] = useState("IMAGE");
  const [issueMediaUploadedBy, setIssueMediaUploadedBy] = useState("SECRETARY");
  const [issueGalleryOpen, setIssueGalleryOpen] = useState(false);
  const [issueGalleryMedia, setIssueGalleryMedia] = useState([]);
  const [issueGalleryIndex, setIssueGalleryIndex] = useState(0);
  const [loadingIssueMedia, setLoadingIssueMedia] = useState(false);
  const [issueGalleryTitle, setIssueGalleryTitle] = useState("");
  const [issueGalleryFilter, setIssueGalleryFilter] = useState("SECRETARY");
  const [issueGalleryLocalIndex, setIssueGalleryLocalIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, issuesRes, caretakersRes, secretaryRes] =
        await Promise.all([
          axiosInstance.get("/api/complaint/all"),
          axiosInstance.get("/api/caretaker-issue/all"),
          axiosInstance.get("/api/caretaker"),
          axiosInstance.get("/api/secretary/profile"),
        ]);
      setComplaints(complaintsRes.data);
      setIssues(issuesRes.data);
      setCaretakers(caretakersRes.data.filter((c) => c.status === "ACTIVE"));
      setSecretaryId(secretaryRes.data.id);
    } catch {
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (id) => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/complaint/${id}/resolve`);
      showSuccess("Complaint resolved");
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    const e = {};
    if (!issueForm.assignedToId) e.assignedToId = "Required";
    if (!issueForm.title.trim()) e.title = "Required";
    if (!issueForm.description.trim()) e.description = "Required";
    setIssueFormErrors(e);
    if (Object.values(e).some((v) => v)) return;
    setActionLoading(true);
    try {
      await axiosInstance.post("/api/caretaker-issue/create", {
        assignedToId: issueForm.assignedToId,
        assignedById: secretaryId,
        title: issueForm.title,
        description: issueForm.description,
      });
      showSuccess("Issue assigned to caretaker");
      setCreateIssueOpen(false);
      setIssueForm({ assignedToId: "", title: "", description: "" });
      setIssueFormErrors({});
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/caretaker-issue/${updateIssueId}/status`, {
        status: newStatus,
      });
      showSuccess("Status updated");
      setUpdateStatusOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMediaFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (type === "IMAGE") {
      const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
      if (oversized.length > 0) {
        showError(`${oversized.length} image(s) exceed 5MB.`);
        e.target.value = "";
        return;
      }
    }
    if (type === "VIDEO") {
      if (files.length > 1) {
        showError("Only 1 video allowed.");
        e.target.value = "";
        return;
      }
      if (files[0].size > 50 * 1024 * 1024) {
        showError("Video must be < 50MB.");
        e.target.value = "";
        return;
      }
    }
    setMediaType(type);
    setSelectedMediaFiles(files);
    setMediaPreviews(files.map((f) => ({ url: URL.createObjectURL(f), type })));
  };

  const handleUploadMedia = async () => {
    if (selectedMediaFiles.length === 0) {
      showError("Please select files");
      return;
    }
    setUploadingMedia(true);
    try {
      const urls = await uploadMultipleToCloudinary(
        selectedMediaFiles,
        "urbansync/complaints",
      );
      await axiosInstance.post("/api/complaint/media", {
        complaintId: mediaUploadComplaintId,
        mediaUrls: urls,
        mediaType,
      });
      showSuccess(`${urls.length} file(s) uploaded`);
      setMediaUploadOpen(false);
      setSelectedMediaFiles([]);
      setMediaPreviews([]);
      setMediaUploadComplaintId(null);
    } catch (err) {
      showError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  const openMediaGallery = async (complaint) => {
    setGalleryComplaintTitle(complaint.subject);
    setGalleryIndex(0);
    setMediaGalleryOpen(true);
    setLoadingMedia(true);
    try {
      const res = await axiosInstance.get(
        `/api/complaint/${complaint.id}/media`,
      );
      setGalleryMedia(res.data);
    } catch {
      showError("Failed to load media");
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleIssueMediaFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (type === "IMAGE") {
      const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
      if (oversized.length > 0) {
        showError(`${oversized.length} image(s) exceed 5MB.`);
        e.target.value = "";
        return;
      }
    }
    if (type === "VIDEO") {
      if (files.length > 1) {
        showError("Only 1 video allowed.");
        e.target.value = "";
        return;
      }
      if (files[0].size > 50 * 1024 * 1024) {
        showError("Video must be < 50MB.");
        e.target.value = "";
        return;
      }
    }
    setIssueMediaType(type);
    setSelectedIssueMediaFiles(files);
    setIssueMediaPreviews(
      files.map((f) => ({ url: URL.createObjectURL(f), type })),
    );
  };

  const handleUploadIssueMedia = async () => {
    if (selectedIssueMediaFiles.length === 0) {
      showError("Please select files");
      return;
    }
    setUploadingIssueMedia(true);
    try {
      const urls = await uploadMultipleToCloudinary(
        selectedIssueMediaFiles,
        "urbansync/issues",
      );
      await axiosInstance.post("/api/caretaker-issue/media", {
        issueId: issueMediaUploadId,
        mediaUrls: urls,
        mediaType: issueMediaType,
        uploadedBy: issueMediaUploadedBy,
      });
      showSuccess(`${urls.length} file(s) uploaded`);
      setIssueMediaUploadOpen(false);
      setSelectedIssueMediaFiles([]);
      setIssueMediaPreviews([]);
      setIssueMediaUploadId(null);
    } catch (err) {
      showError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingIssueMedia(false);
    }
  };

  const openIssueGallery = async (issue) => {
    setIssueGalleryTitle(issue.title);
    setIssueGalleryIndex(0);
    setIssueGalleryFilter("SECRETARY");
    setIssueGalleryLocalIndex(0);
    setIssueGalleryOpen(true);
    setLoadingIssueMedia(true);
    try {
      const res = await axiosInstance.get(
        `/api/caretaker-issue/${issue.id}/media`,
      );
      setIssueGalleryMedia(res.data);
    } catch {
      showError("Failed to load issue media");
    } finally {
      setLoadingIssueMedia(false);
    }
  };

  const pendingComplaints = complaints.filter((c) => c.status === "PENDING");
  const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED");

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

  const EmptyState = ({ icon, message }) => (
    <Box sx={{ textAlign: "center", py: 5 }}>
      {icon}
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          color: "#94a3b8",
          fontSize: "0.85rem",
          mt: 1,
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  const ActionBtns = ({ children }) => (
    <Box
      sx={{
        display: "flex",
        gap: 0.4,
        justifyContent: "flex-start",
        flexWrap: "nowrap",
      }}
    >
      {children}
    </Box>
  );

  const ABtn = ({ title, onClick, color, bgcolor, icon, disabled }) => (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{ color, bgcolor, borderRadius: 1.5, width: 26, height: 26 }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
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
            Complaints & Issues
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isMobile
              ? "Complaints & caretaker tasks"
              : "Manage resident complaints and caretaker issues"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
          onClick={() => setCreateIssueOpen(true)}
          sx={{
            bgcolor: "#0891b2",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: { xs: "0.68rem", sm: "0.78rem" },
            px: { xs: 1, sm: 1.5 },
            whiteSpace: "nowrap",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(8,145,178,0.25)",
            "&:hover": { bgcolor: "#0e7490" },
          }}
        >
          {isMobile ? "Issue" : "Assign Issue"}
        </Button>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr 1fr", sm: "repeat(3, 1fr)" },
          gap: { xs: 1, sm: 1.5, md: 2 },
          mb: 2,
        }}
      >
        {[
          {
            label: isMobile ? "Complaints" : "Total Complaints",
            value: complaints.length,
            color: "#dc2626",
          },
          {
            label: isMobile ? "Pending" : "Pending Complaints",
            value: pendingComplaints.length,
            color: "#d97706",
          },
          {
            label: isMobile ? "Issues" : "Caretaker Issues",
            value: issues.length,
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
              {loading ? "-" : stat.value}
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
          <Tab label={`All (${complaints.length})`} />
          <Tab label={`Pending (${pendingComplaints.length})`} />
          <Tab label={`Resolved (${resolvedComplaints.length})`} />
          <Tab
            label={`Issues (${issues.length})`}
            icon={<EngineeringIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
          />
        </Tabs>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {tab !== 3 &&
              (() => {
                const data =
                  tab === 0
                    ? complaints
                    : tab === 1
                      ? pendingComplaints
                      : resolvedComplaints;
                if (data.length === 0)
                  return (
                    <EmptyState
                      icon={
                        <ReportProblemIcon
                          sx={{ fontSize: 40, color: "#cbd5e1" }}
                        />
                      }
                      message="No complaints found"
                    />
                  );
                return (
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 520 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={headSx}>Raised By</TableCell>
                          <TableCell sx={headSx}>Subject</TableCell>
                          <TableCell sx={headSx}>Target</TableCell>
                          <TableCell sx={headSx}>Status</TableCell>
                          <TableCell sx={headSx}>Date</TableCell>
                          <TableCell sx={headSx}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map((c) => (
                          <TableRow
                            key={c.id}
                            hover
                            sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                          >
                            <TableCell sx={cellSx}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.8,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: "#fee2e2",
                                    fontSize: "0.65rem",
                                    color: "#dc2626",
                                    fontWeight: 700,
                                  }}
                                >
                                  {c.raisedByName?.[0] || "?"}
                                </Avatar>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {c.raisedByName || "Unknown"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...cellSx, maxWidth: 160 }}>
                              <Typography
                                noWrap
                                sx={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "0.78rem",
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
                                ? new Date(c.createdAt).toLocaleDateString(
                                    "en-IN",
                                  )
                                : "-"}
                            </TableCell>
                            <TableCell
                              sx={{ py: 0.8, px: 1, whiteSpace: "nowrap" }}
                            >
                              <ActionBtns>
                                <ABtn
                                  title="View"
                                  onClick={() => {
                                    setSelected(c);
                                    setDetailOpen(true);
                                  }}
                                  color="#0891b2"
                                  bgcolor="#e0f2fe"
                                  icon={
                                    <VisibilityIcon sx={{ fontSize: 13 }} />
                                  }
                                />
                                {c.status === "PENDING" ? (
                                  <ABtn
                                    title="Resolve"
                                    onClick={() => handleResolve(c.id)}
                                    disabled={actionLoading}
                                    color="#059669"
                                    bgcolor="#dcfce7"
                                    icon={
                                      <CheckCircleIcon sx={{ fontSize: 13 }} />
                                    }
                                  />
                                ) : (
                                  <ABtn
                                    title="Resolved"
                                    color="#cbd5e1"
                                    bgcolor="#f1f5f9"
                                    icon={
                                      <CheckCircleIcon sx={{ fontSize: 13 }} />
                                    }
                                  />
                                )}
                                <ABtn
                                  title="Upload Media"
                                  onClick={() => {
                                    setMediaUploadComplaintId(c.id);
                                    setMediaUploadOpen(true);
                                  }}
                                  color="#7c3aed"
                                  bgcolor="#f3e8ff"
                                  icon={
                                    <CloudUploadIcon sx={{ fontSize: 13 }} />
                                  }
                                />
                                <ABtn
                                  title="View Media"
                                  onClick={() => openMediaGallery(c)}
                                  color="#d97706"
                                  bgcolor="#fef3c7"
                                  icon={<ImageIcon sx={{ fontSize: 13 }} />}
                                />
                              </ActionBtns>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              })()}

            {tab === 3 &&
              (issues.length === 0 ? (
                <EmptyState
                  icon={
                    <EngineeringIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
                  }
                  message="No caretaker issues assigned yet"
                />
              ) : (
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 520 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headSx}>Assigned To</TableCell>
                        <TableCell sx={headSx}>Title</TableCell>
                        <TableCell sx={headSx}>By</TableCell>
                        <TableCell sx={headSx}>Status</TableCell>
                        <TableCell sx={headSx}>Date</TableCell>
                        <TableCell sx={headSx}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow
                          key={issue.id}
                          hover
                          sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                        >
                          <TableCell sx={cellSx}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: "#e0f2fe",
                                  fontSize: "0.65rem",
                                  color: "#0891b2",
                                  fontWeight: 700,
                                }}
                              >
                                {issue.assignedToName?.[0] || "?"}
                              </Avatar>
                              <Typography
                                sx={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                }}
                              >
                                {issue.assignedToName || "-"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ ...cellSx, maxWidth: 160 }}>
                            <Typography
                              noWrap
                              sx={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.78rem",
                              }}
                            >
                              {issue.title}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            {issue.assignedByName || "-"}
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <StatusChip status={issue.status} />
                          </TableCell>
                          <TableCell sx={cellSx}>
                            {issue.createdAt
                              ? new Date(issue.createdAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : "-"}
                          </TableCell>
                          <TableCell
                            sx={{ py: 0.8, px: 1, whiteSpace: "nowrap" }}
                          >
                            <ActionBtns>
                              <ABtn
                                title="View"
                                onClick={() => {
                                  setSelectedIssue(issue);
                                  setIssueDetailOpen(true);
                                }}
                                color="#0891b2"
                                bgcolor="#e0f2fe"
                                icon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                              />
                              {issue.status !== "RESOLVED" ? (
                                <ABtn
                                  title="Update Status"
                                  onClick={() => {
                                    setUpdateIssueId(issue.id);
                                    setNewStatus("PROCESSING");
                                    setUpdateStatusOpen(true);
                                  }}
                                  color="#7c3aed"
                                  bgcolor="#f3e8ff"
                                  icon={
                                    <CheckCircleIcon sx={{ fontSize: 13 }} />
                                  }
                                />
                              ) : (
                                <ABtn
                                  title="Resolved"
                                  color="#cbd5e1"
                                  bgcolor="#f1f5f9"
                                  icon={
                                    <CheckCircleIcon sx={{ fontSize: 13 }} />
                                  }
                                />
                              )}
                              <ABtn
                                title="Upload Media"
                                onClick={() => {
                                  setIssueMediaUploadId(issue.id);
                                  setIssueMediaUploadedBy("SECRETARY");
                                  setIssueMediaUploadOpen(true);
                                }}
                                color="#7c3aed"
                                bgcolor="#f3e8ff"
                                icon={<CloudUploadIcon sx={{ fontSize: 13 }} />}
                              />
                              <ABtn
                                title="View Media"
                                onClick={() => openIssueGallery(issue)}
                                color="#d97706"
                                bgcolor="#fef3c7"
                                icon={<ImageIcon sx={{ fontSize: 13 }} />}
                              />
                            </ActionBtns>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ))}
          </>
        )}
      </Paper>

      {/* Complaint Detail Modal */}
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
            <DetailRow
              label="Raised By"
              value={selected.raisedByName || "Unknown"}
            />
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
                  whiteSpace: "pre-wrap",
                }}
              >
                {selected.description}
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
          {selected?.status === "PENDING" && (
            <Button
              variant="contained"
              size="small"
              onClick={() => handleResolve(selected?.id)}
              disabled={actionLoading}
              startIcon={
                <CheckCircleIcon sx={{ fontSize: "13px !important" }} />
              }
              sx={{
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: "0.78rem",
                bgcolor: "#059669",
                borderRadius: 2,
                "&:hover": { bgcolor: "#047857" },
              }}
            >
              {actionLoading ? "Resolving..." : "Mark Resolved"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Issue Detail Modal */}
      <Dialog
        open={issueDetailOpen}
        onClose={() => setIssueDetailOpen(false)}
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
          <EngineeringIcon sx={{ color: "#0891b2", fontSize: 16 }} />
          Issue Details
          {selectedIssue && <StatusChip status={selectedIssue.status} />}
        </DialogTitle>
        {selectedIssue && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            <DetailRow
              label="Assigned To"
              value={selectedIssue.assignedToName || "-"}
            />
            <DetailRow
              label="Assigned By"
              value={selectedIssue.assignedByName || "-"}
            />
            <DetailRow label="Title" value={selectedIssue.title} />
            <DetailRow label="Status" value={selectedIssue.status} />
            <DetailRow
              label="Assigned On"
              value={new Date(selectedIssue.createdAt).toLocaleString("en-IN")}
            />
            {selectedIssue.resolvedAt && (
              <DetailRow
                label="Resolved On"
                value={new Date(selectedIssue.resolvedAt).toLocaleString(
                  "en-IN",
                )}
              />
            )}
            <Box
              sx={{
                mt: 1.5,
                p: 1.2,
                bgcolor: "#f8fbff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  color: "#0891b2",
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
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedIssue.description}
              </Typography>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 1.5, px: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setIssueDetailOpen(false)}
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

      {/* Create Issue Modal */}
      <Dialog
        open={createIssueOpen}
        onClose={() => {
          setCreateIssueOpen(false);
          setIssueForm({ assignedToId: "", title: "", description: "" });
          setIssueFormErrors({});
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
          <EngineeringIcon sx={{ color: "#0891b2", fontSize: 16 }} />
          Assign Issue to Caretaker
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <FormControl
              size="small"
              fullWidth
              error={!!issueFormErrors.assignedToId}
              sx={fieldStyle(isMobile)}
            >
              <InputLabel
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                Select Caretaker *
              </InputLabel>
              <Select
                value={issueForm.assignedToId}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, assignedToId: e.target.value })
                }
                label="Select Caretaker *"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                {caretakers.length === 0 ? (
                  <MenuItem
                    disabled
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#94a3b8",
                      fontSize: "0.82rem",
                    }}
                  >
                    No active caretakers
                  </MenuItem>
                ) : (
                  caretakers.map((c) => (
                    <MenuItem
                      key={c.id}
                      value={c.id}
                      sx={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={c.photoUrl || undefined}
                          sx={{
                            width: 22,
                            height: 22,
                            bgcolor: "#e0f2fe",
                            fontSize: "0.62rem",
                            color: "#0891b2",
                            fontWeight: 700,
                          }}
                        >
                          {!c.photoUrl && c.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: { xs: "0.78rem", sm: "0.85rem" },
                              fontWeight: 600,
                              color: "#1e293b",
                            }}
                          >
                            {c.firstName} {c.lastName}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: { xs: "0.62rem", sm: "0.7rem" },
                              color: "#64748b",
                            }}
                          >
                            #{c.serialNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {issueFormErrors.assignedToId && (
                <Typography
                  sx={{
                    color: "#d32f2f",
                    fontSize: "0.62rem",
                    mt: 0.5,
                    ml: 1.5,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {issueFormErrors.assignedToId}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Title *"
              value={issueForm.title}
              onChange={(e) =>
                setIssueForm({ ...issueForm, title: e.target.value })
              }
              size="small"
              fullWidth
              error={!!issueFormErrors.title}
              helperText={issueFormErrors.title}
              sx={fieldStyle(isMobile)}
            />
            <TextField
              label="Description *"
              value={issueForm.description}
              onChange={(e) =>
                setIssueForm({ ...issueForm, description: e.target.value })
              }
              size="small"
              fullWidth
              multiline
              rows={3}
              error={!!issueFormErrors.description}
              helperText={issueFormErrors.description}
              sx={fieldStyle(isMobile)}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => {
              setCreateIssueOpen(false);
              setIssueForm({ assignedToId: "", title: "", description: "" });
              setIssueFormErrors({});
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
            onClick={handleCreateIssue}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#0891b2",
              borderRadius: 2,
              "&:hover": { bgcolor: "#0e7490" },
            }}
          >
            {actionLoading ? "Assigning..." : "Assign Issue"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog
        open={updateStatusOpen}
        onClose={() => setUpdateStatusOpen(false)}
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
          Update Issue Status
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <FormControl size="small" fullWidth sx={fieldStyle(isMobile)}>
            <InputLabel
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: isMobile ? "0.78rem" : "0.875rem",
              }}
            >
              Status
            </InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: isMobile ? "0.78rem" : "0.875rem",
              }}
            >
              <MenuItem
                value="PENDING"
                sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
              >
                Pending
              </MenuItem>
              <MenuItem
                value="PROCESSING"
                sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
              >
                Processing
              </MenuItem>
              <MenuItem
                value="RESOLVED"
                sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
              >
                Resolved
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => setUpdateStatusOpen(false)}
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
            onClick={handleUpdateStatus}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#7c3aed",
              borderRadius: 2,
              "&:hover": { bgcolor: "#6d28d9" },
            }}
          >
            {actionLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Upload Helper */}
      {[
        {
          open: mediaUploadOpen,
          onClose: () => {
            setMediaUploadOpen(false);
            setSelectedMediaFiles([]);
            setMediaPreviews([]);
          },
          title: "Upload Complaint Media",
          color: "#7c3aed",
          bgcolor: "#f3e8ff",
          dashed: "#7c3aed",
          previews: mediaPreviews,
          files: selectedMediaFiles,
          uploading: uploadingMedia,
          onSelect: handleMediaFileSelect,
          onUpload: handleUploadMedia,
          type: mediaType,
          hint: "Images max 5MB • Video max 50MB (1 file)",
        },
        {
          open: issueMediaUploadOpen,
          onClose: () => {
            setIssueMediaUploadOpen(false);
            setSelectedIssueMediaFiles([]);
            setIssueMediaPreviews([]);
          },
          title: "Upload Issue Media",
          color: "#0891b2",
          bgcolor: "#e0f2fe",
          dashed: "#0891b2",
          previews: issueMediaPreviews,
          files: selectedIssueMediaFiles,
          uploading: uploadingIssueMedia,
          onSelect: handleIssueMediaFileSelect,
          onUpload: handleUploadIssueMedia,
          type: issueMediaType,
          hint: "Images max 5MB • Video max 50MB (1 file)",
          extra: (
            <FormControl size="small" sx={fieldStyle(isMobile)}>
              <InputLabel
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                Uploaded By
              </InputLabel>
              <Select
                value={issueMediaUploadedBy}
                onChange={(e) => setIssueMediaUploadedBy(e.target.value)}
                label="Uploaded By"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                <MenuItem
                  value="SECRETARY"
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
                >
                  Secretary
                </MenuItem>
                <MenuItem
                  value="CARETAKER"
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
                >
                  Caretaker
                </MenuItem>
              </Select>
            </FormControl>
          ),
        },
      ].map((m, idx) => (
        <Dialog
          key={idx}
          open={m.open}
          onClose={m.onClose}
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
            <CloudUploadIcon sx={{ color: m.color, fontSize: 16 }} />
            {m.title}
          </DialogTitle>
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  border: `1px dashed ${m.dashed}`,
                  bgcolor: m.bgcolor + "33",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    color: "#64748b",
                  }}
                >
                  {m.hint}
                </Typography>
              </Box>
              {m.extra}
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  fullWidth
                  startIcon={<ImageIcon sx={{ fontSize: "13px !important" }} />}
                  sx={{
                    borderRadius: 2,
                    borderColor: m.color,
                    color: m.color,
                    fontFamily: "Inter, sans-serif",
                    textTransform: "none",
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    py: 0.8,
                  }}
                >
                  Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => m.onSelect(e, "IMAGE")}
                  />
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  fullWidth
                  startIcon={
                    <PlayCircleIcon sx={{ fontSize: "13px !important" }} />
                  }
                  sx={{
                    borderRadius: 2,
                    borderColor: "#d97706",
                    color: "#d97706",
                    fontFamily: "Inter, sans-serif",
                    textTransform: "none",
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    py: 0.8,
                  }}
                >
                  Video
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={(e) => m.onSelect(e, "VIDEO")}
                  />
                </Button>
              </Box>
              {m.previews.length > 0 && (
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: "#64748b",
                      mb: 0.8,
                    }}
                  >
                    Selected ({m.previews.length}):
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                    {m.previews.map((item, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: { xs: 56, sm: 72 },
                          height: { xs: 56, sm: 72 },
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border: "2px solid #e0f2fe",
                        }}
                      >
                        {item.type === "IMAGE" ? (
                          <Box
                            component="img"
                            src={item.url}
                            alt={`p${i}`}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              bgcolor: "#1e293b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <PlayCircleIcon
                              sx={{
                                color: "#d97706",
                                fontSize: { xs: 22, sm: 28 },
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
          >
            <Button
              onClick={m.onClose}
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
              onClick={m.onUpload}
              disabled={m.uploading || m.files.length === 0}
              startIcon={
                m.uploading ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <CloudUploadIcon sx={{ fontSize: "13px !important" }} />
                )
              }
              sx={{
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: "0.78rem",
                bgcolor: m.color,
                borderRadius: 2,
                "&:hover": { filter: "brightness(0.9)" },
              }}
            >
              {m.uploading ? "Uploading..." : `Upload ${m.files.length}`}
            </Button>
          </DialogActions>
        </Dialog>
      ))}

      {/* Gallery Modals */}
      {[
        {
          open: mediaGalleryOpen,
          onClose: () => {
            setMediaGalleryOpen(false);
            setGalleryMedia([]);
          },
          title: galleryComplaintTitle,
          loading: loadingMedia,
          media: galleryMedia,
          index: galleryIndex,
          setIndex: setGalleryIndex,
          accentColor: "#d97706",
          icon: <ImageIcon sx={{ color: "#d97706", fontSize: 16 }} />,
          emptyMsg: "No media for this complaint",
        },
      ].map((g, idx) => (
        <Dialog
          key={idx}
          open={g.open}
          onClose={g.onClose}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: { borderRadius: 3, bgcolor: "#0f172a", mx: { xs: 1, sm: 3 } },
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "0.78rem", sm: "0.9rem" },
              color: "white",
              borderBottom: "1px solid #1e293b",
              py: 1.2,
              px: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                minWidth: 0,
              }}
            >
              {g.icon}
              <Typography
                noWrap
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {g.title}
              </Typography>
              {g.media.length > 0 && (
                <Chip
                  label={g.media.length}
                  size="small"
                  sx={{
                    bgcolor: "#1e293b",
                    color: "#94a3b8",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.6rem",
                    height: 18,
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>
            <IconButton
              size="small"
              onClick={g.onClose}
              sx={{ color: "white", flexShrink: 0 }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 1, sm: 2 }, bgcolor: "#0f172a" }}>
            {g.loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress sx={{ color: g.accentColor }} />
              </Box>
            ) : g.media.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <ImageIcon sx={{ fontSize: 36, color: "#334155", mb: 1 }} />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    color: "#64748b",
                    fontSize: { xs: "0.75rem", sm: "0.88rem" },
                  }}
                >
                  {g.emptyMsg}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "#1e293b",
                    minHeight: { xs: 180, sm: 280 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {g.media[g.index]?.mediaType === "IMAGE" ? (
                    <Box
                      component="img"
                      src={g.media[g.index]?.mediaUrl}
                      alt="media"
                      sx={{
                        width: "100%",
                        maxHeight: { xs: 220, sm: 380 },
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <Box
                      component="video"
                      src={g.media[g.index]?.mediaUrl}
                      controls
                      sx={{ width: "100%", maxHeight: { xs: 220, sm: 380 } }}
                    />
                  )}
                </Box>
                <Box
                  sx={{ display: "flex", gap: 0.8, overflowX: "auto", pb: 0.5 }}
                >
                  {g.media.map((item, i) => (
                    <Box
                      key={item.id}
                      onClick={() => g.setIndex(i)}
                      sx={{
                        width: { xs: 44, sm: 56 },
                        height: { xs: 44, sm: 56 },
                        flexShrink: 0,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border:
                          i === g.index
                            ? `2px solid ${g.accentColor}`
                            : "2px solid #1e293b",
                        cursor: "pointer",
                        opacity: i === g.index ? 1 : 0.6,
                        transition: "all 0.2s",
                        bgcolor: "#0f172a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.mediaType === "IMAGE" ? (
                        <Box
                          component="img"
                          src={item.mediaUrl}
                          alt={`t${i}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <PlayCircleIcon
                          sx={{
                            color: g.accentColor,
                            fontSize: { xs: 20, sm: 24 },
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.65rem",
                    color: "#64748b",
                    textAlign: "center",
                  }}
                >
                  {g.index + 1} / {g.media.length} -{" "}
                  {g.media[g.index]?.mediaType}
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      ))}

      {/* Issue Gallery Modal - separate since it has filter toggle */}
      <Dialog
        open={issueGalleryOpen}
        onClose={() => {
          setIssueGalleryOpen(false);
          setIssueGalleryMedia([]);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, bgcolor: "#0f172a", mx: { xs: 1, sm: 3 } },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.78rem", sm: "0.9rem" },
            color: "white",
            borderBottom: "1px solid #1e293b",
            py: 1.2,
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              minWidth: 0,
            }}
          >
            <EngineeringIcon
              sx={{ color: "#0891b2", fontSize: 16, flexShrink: 0 }}
            />
            <Typography
              noWrap
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                color: "white",
                fontWeight: 600,
              }}
            >
              {issueGalleryTitle}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setIssueGalleryOpen(false);
              setIssueGalleryMedia([]);
            }}
            sx={{ color: "white", flexShrink: 0 }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 2 }, bgcolor: "#0f172a" }}>
          {loadingIssueMedia ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress sx={{ color: "#0891b2" }} />
            </Box>
          ) : issueGalleryMedia.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <EngineeringIcon sx={{ fontSize: 36, color: "#334155", mb: 1 }} />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#64748b",
                  fontSize: { xs: "0.75rem", sm: "0.88rem" },
                }}
              >
                No media for this issue
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 0.8, justifyContent: "center" }}>
                {[
                  { key: "SECRETARY", color: "#0891b2" },
                  { key: "CARETAKER", color: "#059669" },
                ].map((f) => {
                  const count = issueGalleryMedia.filter(
                    (m) => m.uploadedBy === f.key,
                  ).length;
                  return (
                    <Button
                      key={f.key}
                      size="small"
                      onClick={() => {
                        setIssueGalleryFilter(f.key);
                        setIssueGalleryLocalIndex(0);
                      }}
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        textTransform: "none",
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        borderRadius: 2,
                        px: { xs: 1, sm: 1.5 },
                        bgcolor:
                          issueGalleryFilter === f.key ? f.color : "#1e293b",
                        color:
                          issueGalleryFilter === f.key ? "white" : "#64748b",
                        border: `1px solid ${issueGalleryFilter === f.key ? f.color : "#334155"}`,
                        "&:hover": {
                          bgcolor:
                            issueGalleryFilter === f.key ? f.color : "#334155",
                        },
                      }}
                    >
                      {f.key === "SECRETARY" ? "Secretary" : "Caretaker"} (
                      {count})
                    </Button>
                  );
                })}
              </Box>
              {(() => {
                const filtered = issueGalleryMedia.filter(
                  (m) => m.uploadedBy === issueGalleryFilter,
                );
                const safeIdx = Math.min(
                  issueGalleryLocalIndex,
                  filtered.length - 1,
                );
                if (filtered.length === 0)
                  return (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          color: "#64748b",
                          fontSize: { xs: "0.72rem", sm: "0.85rem" },
                        }}
                      >
                        No media by{" "}
                        {issueGalleryFilter === "SECRETARY"
                          ? "Secretary"
                          : "Caretaker"}{" "}
                        yet
                      </Typography>
                    </Box>
                  );
                return (
                  <>
                    <Box
                      sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: "#1e293b",
                        minHeight: { xs: 180, sm: 280 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {filtered[safeIdx]?.mediaType === "IMAGE" ? (
                        <Box
                          component="img"
                          src={filtered[safeIdx]?.mediaUrl}
                          alt="issue media"
                          sx={{
                            width: "100%",
                            maxHeight: { xs: 220, sm: 380 },
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Box
                          component="video"
                          src={filtered[safeIdx]?.mediaUrl}
                          controls
                          sx={{
                            width: "100%",
                            maxHeight: { xs: 220, sm: 380 },
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.8,
                        overflowX: "auto",
                        pb: 0.5,
                      }}
                    >
                      {filtered.map((item, i) => (
                        <Box
                          key={item.id}
                          onClick={() => setIssueGalleryLocalIndex(i)}
                          sx={{
                            width: { xs: 44, sm: 56 },
                            height: { xs: 44, sm: 56 },
                            flexShrink: 0,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border:
                              i === safeIdx
                                ? "2px solid #0891b2"
                                : "2px solid #1e293b",
                            cursor: "pointer",
                            opacity: i === safeIdx ? 1 : 0.6,
                            transition: "all 0.2s",
                            bgcolor: "#0f172a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.mediaType === "IMAGE" ? (
                            <Box
                              component="img"
                              src={item.mediaUrl}
                              alt={`t${i}`}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <PlayCircleIcon
                              sx={{
                                color: "#d97706",
                                fontSize: { xs: 20, sm: 24 },
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.65rem",
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      {safeIdx + 1} / {filtered.length} -{" "}
                      {filtered[safeIdx]?.mediaType}
                    </Typography>
                  </>
                );
              })()}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ComplaintsPage;
