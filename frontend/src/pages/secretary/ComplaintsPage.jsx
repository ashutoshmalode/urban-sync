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
        fontSize: "0.7rem",
        fontFamily: "Inter, sans-serif",
        height: 22,
      }}
    />
  );
};

const ComplaintsPage = () => {
  const [tab, setTab] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [caretakers, setCaretakers] = useState([]);
  const [secretaryId, setSecretaryId] = useState(null);

  // Complaint detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Issue detail modal
  const [issueDetailOpen, setIssueDetailOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Create issue modal
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    assignedToId: "",
    title: "",
    description: "",
  });
  const [issueFormErrors, setIssueFormErrors] = useState({});

  // Update issue status modal
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [updateIssueId, setUpdateIssueId] = useState(null);
  const [newStatus, setNewStatus] = useState("PROCESSING");

  // Media upload states
  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);
  const [mediaUploadComplaintId, setMediaUploadComplaintId] = useState(null);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaType, setMediaType] = useState("IMAGE");

  // Media gallery states
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [galleryComplaintTitle, setGalleryComplaintTitle] = useState("");

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
      showSuccess("Complaint resolved successfully");
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to resolve");
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
      showSuccess("Issue assigned to caretaker successfully");
      setCreateIssueOpen(false);
      setIssueForm({ assignedToId: "", title: "", description: "" });
      setIssueFormErrors({});
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create issue");
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
      showSuccess("Issue status updated");
      setUpdateStatusOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMediaFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file sizes
    if (type === "IMAGE") {
      const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
      if (oversized.length > 0) {
        showError(
          `${oversized.length} image(s) exceed 5MB limit. Please select smaller files.`,
        );
        e.target.value = "";
        return;
      }
    }

    if (type === "VIDEO") {
      if (files.length > 1) {
        showError("Only 1 video allowed per upload.");
        e.target.value = "";
        return;
      }
      if (files[0].size > 50 * 1024 * 1024) {
        showError("Video size must be less than 50MB.");
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
      showError("Please select files to upload");
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
        mediaType: mediaType,
      });
      showSuccess(
        `${urls.length} ${mediaType.toLowerCase()}(s) uploaded successfully`,
      );
      setMediaUploadOpen(false);
      setSelectedMediaFiles([]);
      setMediaPreviews([]);
      setMediaUploadComplaintId(null);
    } catch (err) {
      showError(err.response?.data?.message || "Media upload failed");
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

  const pendingComplaints = complaints.filter((c) => c.status === "PENDING");
  const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED");

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

  const EmptyState = ({ icon, message }) => (
    <Box sx={{ textAlign: "center", py: 6 }}>
      {icon}
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          color: "#94a3b8",
          fontSize: "0.88rem",
          mt: 1,
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  const ComplaintActionsCell = ({ c }) => (
    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-start" }}>
      {/* View Details — always active */}
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

      {/* Mark Resolved — only if PENDING, else grey */}
      {c.status === "PENDING" ? (
        <Tooltip title="Mark Resolved">
          <IconButton
            size="small"
            onClick={() => handleResolve(c.id)}
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
      ) : (
        <Tooltip title="Already Resolved">
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
      )}

      {/* Upload Media — always active */}
      <Tooltip title="Upload Media">
        <IconButton
          size="small"
          onClick={() => {
            setMediaUploadComplaintId(c.id);
            setMediaUploadOpen(true);
          }}
          sx={{
            color: "#7c3aed",
            bgcolor: "#f3e8ff",
            borderRadius: 1.5,
            width: 28,
            height: 28,
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      {/* View Media — always active */}
      <Tooltip title="View Media">
        <IconButton
          size="small"
          onClick={() => openMediaGallery(c)}
          sx={{
            color: "#d97706",
            bgcolor: "#fef3c7",
            borderRadius: 1.5,
            width: 28,
            height: 28,
          }}
        >
          <ImageIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
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
            bgcolor: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ReportProblemIcon sx={{ color: "#dc2626", fontSize: 20 }} />
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
            Complaints & Issues
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Manage resident complaints and caretaker issues
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setCreateIssueOpen(true)}
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
          Assign Issue
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
          {
            label: "Total Complaints",
            value: complaints.length,
            color: "#dc2626",
          },
          {
            label: "Pending Complaints",
            value: pendingComplaints.length,
            color: "#d97706",
          },
          { label: "Caretaker Issues", value: issues.length, color: "#0891b2" },
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
          <Tab label={`All Complaints (${complaints.length})`} />
          <Tab label={`Pending (${pendingComplaints.length})`} />
          <Tab label={`Resolved (${resolvedComplaints.length})`} />
          <Tab
            label={`Caretaker Issues (${issues.length})`}
            icon={<EngineeringIcon sx={{ fontSize: 16 }} />}
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
                          sx={{ fontSize: 48, color: "#cbd5e1" }}
                        />
                      }
                      message="No complaints found"
                    />
                  );
                return (
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small">
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
                                  gap: 1,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: "#fee2e2",
                                    fontSize: "0.75rem",
                                    color: "#dc2626",
                                    fontWeight: 700,
                                  }}
                                >
                                  {c.raisedByName?.[0] || "?"}
                                </Avatar>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {c.raisedByName || "Unknown"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...cellSx, maxWidth: 200 }}>
                              <Typography
                                noWrap
                                sx={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "0.82rem",
                                  color: "#1e293b",
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
                                  fontSize: "0.68rem",
                                  fontFamily: "Inter, sans-serif",
                                  height: 20,
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
                                : "—"}
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <ComplaintActionsCell c={c} />
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
                    <EngineeringIcon sx={{ fontSize: 48, color: "#cbd5e1" }} />
                  }
                  message="No caretaker issues assigned yet"
                />
              ) : (
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headSx}>Assigned To</TableCell>
                        <TableCell sx={headSx}>Title</TableCell>
                        <TableCell sx={headSx}>Assigned By</TableCell>
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
                                gap: 1,
                              }}
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
                                {issue.assignedToName?.[0] || "?"}
                              </Avatar>
                              <Typography
                                sx={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                }}
                              >
                                {issue.assignedToName || "—"}
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
                              {issue.title}
                            </Typography>
                          </TableCell>
                          <TableCell sx={cellSx}>
                            {issue.assignedByName || "—"}
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <StatusChip status={issue.status} />
                          </TableCell>
                          <TableCell sx={cellSx}>
                            {issue.createdAt
                              ? new Date(issue.createdAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : "—"}
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
                                    setSelectedIssue(issue);
                                    setIssueDetailOpen(true);
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
                              {issue.status !== "RESOLVED" && (
                                <Tooltip title="Update Status">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setUpdateIssueId(issue.id);
                                      setNewStatus("PROCESSING");
                                      setUpdateStatusOpen(true);
                                    }}
                                    sx={{
                                      color: "#7c3aed",
                                      bgcolor: "#f3e8ff",
                                      borderRadius: 1.5,
                                      width: 28,
                                      height: 28,
                                    }}
                                  >
                                    <CheckCircleIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
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
          <ReportProblemIcon sx={{ color: "#dc2626", fontSize: 18 }} />
          Complaint Details
          {selected && <StatusChip status={selected.status} />}
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 2 }}>
            {[
              ["Raised By", selected.raisedByName || "Unknown"],
              ["Subject", selected.subject],
              ["Target Type", selected.targetType || "ALL"],
              ["Target Resident", selected.targetResidentName || "—"],
              ["Status", selected.status],
              [
                "Submitted On",
                new Date(selected.createdAt).toLocaleString("en-IN"),
              ],
              ...(selected.resolvedAt
                ? [
                    [
                      "Resolved On",
                      new Date(selected.resolvedAt).toLocaleString("en-IN"),
                    ],
                  ]
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
                bgcolor: "#fef2f2",
                borderRadius: 2,
                border: "1px solid #fecaca",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#dc2626",
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
            <Button
              variant="contained"
              onClick={() => handleResolve(selected?.id)}
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
              {actionLoading ? "Resolving..." : "Mark Resolved"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Issue Detail Modal */}
      <Dialog
        open={issueDetailOpen}
        onClose={() => setIssueDetailOpen(false)}
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
          <EngineeringIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Issue Details
          {selectedIssue && <StatusChip status={selectedIssue.status} />}
        </DialogTitle>
        {selectedIssue && (
          <DialogContent sx={{ pt: 2 }}>
            {[
              ["Assigned To", selectedIssue.assignedToName || "—"],
              ["Assigned By", selectedIssue.assignedByName || "—"],
              ["Title", selectedIssue.title],
              ["Status", selectedIssue.status],
              [
                "Assigned On",
                new Date(selectedIssue.createdAt).toLocaleString("en-IN"),
              ],
              ...(selectedIssue.resolvedAt
                ? [
                    [
                      "Resolved On",
                      new Date(selectedIssue.resolvedAt).toLocaleString(
                        "en-IN",
                      ),
                    ],
                  ]
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
                bgcolor: "#f8fbff",
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
                {selectedIssue.description}
              </Typography>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setIssueDetailOpen(false)}
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

      {/* Create Issue Modal */}
      <Dialog
        open={createIssueOpen}
        onClose={() => {
          setCreateIssueOpen(false);
          setIssueForm({ assignedToId: "", title: "", description: "" });
          setIssueFormErrors({});
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
          <EngineeringIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Assign Issue to Caretaker
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl
              size="small"
              fullWidth
              error={!!issueFormErrors.assignedToId}
              sx={fieldStyle}
            >
              <InputLabel sx={{ fontFamily: "Inter, sans-serif" }}>
                Select Caretaker *
              </InputLabel>
              <Select
                value={issueForm.assignedToId}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, assignedToId: e.target.value })
                }
                label="Select Caretaker *"
                sx={{ fontFamily: "Inter, sans-serif" }}
              >
                {caretakers.length === 0 ? (
                  <MenuItem
                    disabled
                    sx={{ fontFamily: "Inter, sans-serif", color: "#94a3b8" }}
                  >
                    No active caretakers found
                  </MenuItem>
                ) : (
                  caretakers.map((c) => (
                    <MenuItem
                      key={c.id}
                      value={c.id}
                      sx={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          src={c.photoUrl || undefined}
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: "#e0f2fe",
                            fontSize: "0.7rem",
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
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: "#1e293b",
                            }}
                          >
                            {c.firstName} {c.lastName}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.7rem",
                              color: "#64748b",
                            }}
                          >
                            Serial #{c.serialNumber} • {c.mobileNumber}
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
                    fontSize: "0.72rem",
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
              sx={fieldStyle}
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
              sx={fieldStyle}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => {
              setCreateIssueOpen(false);
              setIssueForm({ assignedToId: "", title: "", description: "" });
              setIssueFormErrors({});
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
            onClick={handleCreateIssue}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#0891b2",
              borderRadius: 2,
              "&:hover": { bgcolor: "#0e7490" },
            }}
          >
            {actionLoading ? "Assigning..." : "Assign Issue"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Issue Status Modal */}
      <Dialog
        open={updateStatusOpen}
        onClose={() => setUpdateStatusOpen(false)}
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
          Update Issue Status
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <FormControl size="small" fullWidth sx={fieldStyle}>
            <InputLabel sx={{ fontFamily: "Inter, sans-serif" }}>
              Status
            </InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
              sx={{ fontFamily: "Inter, sans-serif" }}
            >
              <MenuItem
                value="PENDING"
                sx={{ fontFamily: "Inter, sans-serif" }}
              >
                Pending
              </MenuItem>
              <MenuItem
                value="PROCESSING"
                sx={{ fontFamily: "Inter, sans-serif" }}
              >
                Processing
              </MenuItem>
              <MenuItem
                value="RESOLVED"
                sx={{ fontFamily: "Inter, sans-serif" }}
              >
                Resolved
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setUpdateStatusOpen(false)}
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
            onClick={handleUpdateStatus}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#7c3aed",
              borderRadius: 2,
              "&:hover": { bgcolor: "#6d28d9" },
            }}
          >
            {actionLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Upload Modal */}
      <Dialog
        open={mediaUploadOpen}
        onClose={() => {
          setMediaUploadOpen(false);
          setSelectedMediaFiles([]);
          setMediaPreviews([]);
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
          <CloudUploadIcon sx={{ color: "#7c3aed", fontSize: 18 }} />
          Upload Complaint Media
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "#f3e8ff",
                borderRadius: 2,
                border: "1px dashed #7c3aed",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.82rem",
                  color: "#7c3aed",
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                Upload images or video related to this complaint
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                }}
              >
                Images: JPG, PNG (multiple). Video: MP4 (1 file).
              </Typography>
            </Box>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<ImageIcon />}
                sx={{
                  borderRadius: 2,
                  borderColor: "#7c3aed",
                  color: "#7c3aed",
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  py: 1.2,
                }}
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => handleMediaFileSelect(e, "IMAGE")}
                />
              </Button>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<PlayCircleIcon />}
                sx={{
                  borderRadius: 2,
                  borderColor: "#d97706",
                  color: "#d97706",
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                  py: 1.2,
                }}
              >
                Upload Video
                <input
                  type="file"
                  hidden
                  accept="video/*"
                  onChange={(e) => handleMediaFileSelect(e, "VIDEO")}
                />
              </Button>
            </Box>
            {mediaPreviews.length > 0 && (
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#64748b",
                    mb: 1,
                  }}
                >
                  Selected ({mediaPreviews.length} {mediaType.toLowerCase()}
                  (s)):
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {mediaPreviews.map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: "2px solid #e0f2fe",
                      }}
                    >
                      {item.type === "IMAGE" ? (
                        <Box
                          component="img"
                          src={item.url}
                          alt={`preview-${i}`}
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
                            sx={{ color: "#d97706", fontSize: 32 }}
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
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => {
              setMediaUploadOpen(false);
              setSelectedMediaFiles([]);
              setMediaPreviews([]);
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
            onClick={handleUploadMedia}
            disabled={uploadingMedia || selectedMediaFiles.length === 0}
            startIcon={
              uploadingMedia ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CloudUploadIcon fontSize="small" />
              )
            }
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#7c3aed",
              borderRadius: 2,
              "&:hover": { bgcolor: "#6d28d9" },
            }}
          >
            {uploadingMedia
              ? "Uploading..."
              : `Upload ${selectedMediaFiles.length} File(s)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Gallery Modal */}
      <Dialog
        open={mediaGalleryOpen}
        onClose={() => {
          setMediaGalleryOpen(false);
          setGalleryMedia([]);
        }}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: "#0f172a" } } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "white",
            borderBottom: "1px solid #1e293b",
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ImageIcon sx={{ color: "#d97706", fontSize: 18 }} />
            <Typography
              noWrap
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.85rem",
                color: "white",
                fontWeight: 600,
              }}
            >
              {galleryComplaintTitle}
            </Typography>
            {galleryMedia.length > 0 && (
              <Chip
                label={`${galleryMedia.length} files`}
                size="small"
                sx={{
                  bgcolor: "#1e293b",
                  color: "#94a3b8",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.68rem",
                  height: 20,
                }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setMediaGalleryOpen(false);
              setGalleryMedia([]);
            }}
            sx={{ color: "white" }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, bgcolor: "#0f172a" }}>
          {loadingMedia ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#d97706" }} />
            </Box>
          ) : galleryMedia.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <ImageIcon sx={{ fontSize: 48, color: "#334155", mb: 1 }} />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#64748b",
                  fontSize: "0.88rem",
                }}
              >
                No media uploaded for this complaint
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "#1e293b",
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {galleryMedia[galleryIndex]?.mediaType === "IMAGE" ? (
                  <Box
                    component="img"
                    src={galleryMedia[galleryIndex]?.mediaUrl}
                    alt="complaint media"
                    sx={{ width: "100%", maxHeight: 400, objectFit: "contain" }}
                  />
                ) : (
                  <Box
                    component="video"
                    src={galleryMedia[galleryIndex]?.mediaUrl}
                    controls
                    sx={{ width: "100%", maxHeight: 400 }}
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1 }}>
                {galleryMedia.map((item, i) => (
                  <Box
                    key={item.id}
                    onClick={() => setGalleryIndex(i)}
                    sx={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      overflow: "hidden",
                      border:
                        i === galleryIndex
                          ? "2px solid #d97706"
                          : "2px solid #1e293b",
                      cursor: "pointer",
                      opacity: i === galleryIndex ? 1 : 0.6,
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
                        alt={`thumb-${i}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <PlayCircleIcon sx={{ color: "#d97706", fontSize: 28 }} />
                    )}
                  </Box>
                ))}
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.72rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                {galleryIndex + 1} / {galleryMedia.length} —{" "}
                {galleryMedia[galleryIndex]?.mediaType}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ComplaintsPage;
