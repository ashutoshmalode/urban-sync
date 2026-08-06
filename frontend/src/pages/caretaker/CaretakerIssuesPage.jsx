import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axiosInstance from "../../api/axiosInstance";
import { uploadMultipleToCloudinary } from "../../utils/cloudinary";
import { showSuccess, showError } from "../../utils/toast";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    "&.Mui-focused fieldset": { borderColor: "#059669" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#059669" },
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

const CaretakerIssuesPage = () => {
  const [profile, setProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  // Detail + status update
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("PROCESSING");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Media upload
  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);
  const [uploadIssueId, setUploadIssueId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mediaType, setMediaType] = useState("IMAGE");
  const [uploading, setUploading] = useState(false);

  // Media gallery
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("CARETAKER");
  const [galleryLocalIndex, setGalleryLocalIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await axiosInstance.get("/api/caretaker/profile/me");
      setProfile(profileRes.data);
      const issuesRes = await axiosInstance.get(
        `/api/caretaker-issue/caretaker/${profileRes.data.id}`,
      );
      setIssues(issuesRes.data);
    } catch {
      showError("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      await axiosInstance.put(`/api/caretaker-issue/${selected.id}/status`, {
        status: newStatus,
      });
      showSuccess("Status updated successfully");
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (type === "IMAGE") {
      const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
      if (oversized.length > 0) {
        showError("Images must be less than 5MB each");
        e.target.value = "";
        return;
      }
    }
    if (type === "VIDEO") {
      if (files.length > 1) {
        showError("Only 1 video per upload");
        e.target.value = "";
        return;
      }
      if (files[0].size > 50 * 1024 * 1024) {
        showError("Video must be less than 50MB");
        e.target.value = "";
        return;
      }
    }
    setMediaType(type);
    setSelectedFiles(files);
    setPreviews(files.map((f) => ({ url: URL.createObjectURL(f), type })));
  };

  const handleUploadMedia = async () => {
    if (selectedFiles.length === 0) {
      showError("Please select files");
      return;
    }
    setUploading(true);
    try {
      const urls = await uploadMultipleToCloudinary(
        selectedFiles,
        "urbansync/issues",
      );
      await axiosInstance.post("/api/caretaker-issue/media", {
        issueId: uploadIssueId,
        mediaUrls: urls,
        mediaType: mediaType,
        uploadedBy: "CARETAKER",
      });
      showSuccess(`${urls.length} file(s) uploaded successfully`);
      setMediaUploadOpen(false);
      setSelectedFiles([]);
      setPreviews([]);
    } catch (err) {
      showError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openGallery = async (issue) => {
    setGalleryTitle(issue.title);
    setGalleryFilter("CARETAKER");
    setGalleryLocalIndex(0);
    setGalleryOpen(true);
    setLoadingMedia(true);
    try {
      const res = await axiosInstance.get(
        `/api/caretaker-issue/${issue.id}/media`,
      );
      setGalleryMedia(res.data);
    } catch {
      showError("Failed to load media");
    } finally {
      setLoadingMedia(false);
    }
  };

  const pending = issues.filter((i) => i.status === "PENDING");
  const processing = issues.filter((i) => i.status === "PROCESSING");
  const resolved = issues.filter((i) => i.status === "RESOLVED");
  const data =
    tab === 0
      ? issues
      : tab === 1
        ? pending
        : tab === 2
          ? processing
          : resolved;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EngineeringIcon sx={{ color: "#059669", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "#1e293b",
            }}
          >
            My Issues
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            View, update status and upload media
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mb: 2.5,
        }}
      >
        {[
          { label: "Total", value: issues.length, color: "#059669" },
          { label: "Pending", value: pending.length, color: "#dc2626" },
          { label: "Resolved", value: resolved.length, color: "#0891b2" },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #e0f2fe",
              boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
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
              {s.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: s.color,
              }}
            >
              {loading ? "—" : s.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Issues */}
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
            "& .Mui-selected": { color: "#059669" },
            "& .MuiTabs-indicator": { bgcolor: "#059669" },
          }}
        >
          <Tab label={`All (${issues.length})`} />
          <Tab label={`Pending (${pending.length})`} />
          <Tab label={`Processing (${processing.length})`} />
          <Tab label={`Resolved (${resolved.length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={80}
                sx={{ mb: 1.5, borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <EngineeringIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                fontSize: "0.88rem",
              }}
            >
              No issues found
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            {data.map((issue) => (
              <Paper
                key={issue.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${issue.status === "PENDING" ? "#fecaca" : issue.status === "PROCESSING" ? "#bae6fd" : "#bbf7d0"}`,
                  bgcolor:
                    issue.status === "PENDING"
                      ? "#fef2f2"
                      : issue.status === "PROCESSING"
                        ? "#f0f9ff"
                        : "#f0fdf4",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: "#1e293b",
                        }}
                      >
                        {issue.title}
                      </Typography>
                      <StatusChip status={issue.status} />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.78rem",
                        color: "#64748b",
                        mb: 0.5,
                      }}
                    >
                      {issue.description?.substring(0, 100)}
                      {issue.description?.length > 100 ? "..." : ""}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.68rem",
                        color: "#94a3b8",
                      }}
                    >
                      Assigned:{" "}
                      {issue.createdAt
                        ? new Date(issue.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                      {issue.resolvedAt
                        ? ` · Resolved: ${new Date(issue.resolvedAt).toLocaleDateString("en-IN")}`
                        : ""}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.8,
                      flexShrink: 0,
                    }}
                  >
                    {issue.status !== "RESOLVED" && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setSelected(issue);
                          setNewStatus(
                            issue.status === "PENDING"
                              ? "PROCESSING"
                              : "RESOLVED",
                          );
                          setDetailOpen(true);
                        }}
                        sx={{
                          bgcolor: "#059669",
                          borderRadius: 2,
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          textTransform: "none",
                          px: 1.5,
                          "&:hover": { bgcolor: "#047857" },
                        }}
                      >
                        Update Status
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setUploadIssueId(issue.id);
                        setSelectedFiles([]);
                        setPreviews([]);
                        setMediaUploadOpen(true);
                      }}
                      startIcon={<CloudUploadIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        borderRadius: 2,
                        borderColor: "#059669",
                        color: "#059669",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        textTransform: "none",
                        px: 1.5,
                      }}
                    >
                      Upload
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openGallery(issue)}
                      startIcon={<ImageIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        borderRadius: 2,
                        borderColor: "#d97706",
                        color: "#d97706",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        textTransform: "none",
                        px: 1.5,
                      }}
                    >
                      Media
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Update Status Modal */}
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
          }}
        >
          Update Issue Status
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {selected && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                bgcolor: "#f0fdf4",
                borderRadius: 2,
                border: "1px solid #bbf7d0",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#1e293b",
                }}
              >
                {selected.title}
              </Typography>
            </Box>
          )}
          <FormControl size="small" fullWidth sx={fieldStyle}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
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
            onClick={() => setDetailOpen(false)}
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
            disabled={updatingStatus}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#059669",
              borderRadius: 2,
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            {updatingStatus ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Upload Modal */}
      <Dialog
        open={mediaUploadOpen}
        onClose={() => {
          setMediaUploadOpen(false);
          setSelectedFiles([]);
          setPreviews([]);
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
          <CloudUploadIcon sx={{ color: "#059669", fontSize: 18 }} />
          Upload Issue Media
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "#f0fdf4",
                borderRadius: 2,
                border: "1px dashed #059669",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.82rem",
                  color: "#059669",
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                Upload photos or video of the issue
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                }}
              >
                Images: JPG, PNG max 5MB. Video: MP4 max 50MB.
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
                  borderColor: "#059669",
                  color: "#059669",
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
                  onChange={(e) => handleFileSelect(e, "IMAGE")}
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
                  onChange={(e) => handleFileSelect(e, "VIDEO")}
                />
              </Button>
            </Box>
            {previews.length > 0 && (
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
                  Selected ({previews.length} file(s)):
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {previews.map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: "2px solid #bbf7d0",
                      }}
                    >
                      {item.type === "IMAGE" ? (
                        <Box
                          component="img"
                          src={item.url}
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
              setSelectedFiles([]);
              setPreviews([]);
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
            disabled={uploading || selectedFiles.length === 0}
            startIcon={
              uploading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CloudUploadIcon fontSize="small" />
              )
            }
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              bgcolor: "#059669",
              borderRadius: 2,
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            {uploading
              ? "Uploading..."
              : `Upload ${selectedFiles.length} File(s)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Gallery Modal */}
      <Dialog
        open={galleryOpen}
        onClose={() => {
          setGalleryOpen(false);
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
            <ImageIcon sx={{ color: "#059669", fontSize: 18 }} />
            <Typography
              noWrap
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.85rem",
                color: "white",
                fontWeight: 600,
              }}
            >
              {galleryTitle}
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
              setGalleryOpen(false);
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
              <CircularProgress sx={{ color: "#059669" }} />
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
                No media uploaded for this issue yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Filter Toggle */}
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                {[
                  {
                    key: "SECRETARY",
                    label: `Secretary (${galleryMedia.filter((m) => m.uploadedBy === "SECRETARY").length})`,
                    color: "#0891b2",
                  },
                  {
                    key: "CARETAKER",
                    label: `Caretaker (${galleryMedia.filter((m) => m.uploadedBy === "CARETAKER").length})`,
                    color: "#059669",
                  },
                ].map((f) => (
                  <Button
                    key={f.key}
                    size="small"
                    onClick={() => {
                      setGalleryFilter(f.key);
                      setGalleryLocalIndex(0);
                    }}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      textTransform: "none",
                      fontSize: "0.78rem",
                      borderRadius: 2,
                      px: 2,
                      bgcolor: galleryFilter === f.key ? f.color : "#1e293b",
                      color: galleryFilter === f.key ? "white" : "#64748b",
                      border: `1px solid ${galleryFilter === f.key ? f.color : "#334155"}`,
                      "&:hover": {
                        bgcolor: galleryFilter === f.key ? f.color : "#334155",
                      },
                    }}
                  >
                    {f.label}
                  </Button>
                ))}
              </Box>

              {(() => {
                const filtered = galleryMedia.filter(
                  (m) => m.uploadedBy === galleryFilter,
                );
                const safeIdx = Math.min(
                  galleryLocalIndex,
                  filtered.length - 1,
                );
                if (filtered.length === 0)
                  return (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          color: "#64748b",
                          fontSize: "0.85rem",
                        }}
                      >
                        No media from{" "}
                        {galleryFilter === "SECRETARY"
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
                        minHeight: 280,
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
                            maxHeight: 380,
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Box
                          component="video"
                          src={filtered[safeIdx]?.mediaUrl}
                          controls
                          sx={{ width: "100%", maxHeight: 380 }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1 }}
                    >
                      {filtered.map((item, i) => (
                        <Box
                          key={item.id}
                          onClick={() => setGalleryLocalIndex(i)}
                          sx={{
                            width: 64,
                            height: 64,
                            flexShrink: 0,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border:
                              i === safeIdx
                                ? "2px solid #059669"
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
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <PlayCircleIcon
                              sx={{ color: "#d97706", fontSize: 28 }}
                            />
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
                      {safeIdx + 1} / {filtered.length} —{" "}
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

export default CaretakerIssuesPage;
