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
  FormHelperText,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import CancelIcon from "@mui/icons-material/Cancel";
import { uploadMultipleToCloudinary } from "../../utils/cloudinary";
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
    fontSize: isMobile ? "0.62rem" : "0.7rem",
  },
});

const StatusChip = ({ status }) => {
  const map = {
    UNREGISTERED: {
      label: "Unregistered",
      bgcolor: "#f1f5f9",
      color: "#64748b",
    },
    ACTIVE_WITH_OWNER: { label: "Owner", bgcolor: "#dcfce7", color: "#166534" },
    ACTIVE_WITH_TENANT: {
      label: "Tenant",
      bgcolor: "#e0f2fe",
      color: "#0891b2",
    },
  };
  const s = map[status] || map.UNREGISTERED;
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

const ListingChip = ({ type }) => (
  <Chip
    label={type}
    size="small"
    sx={{
      bgcolor: type === "RENT" ? "#f3e8ff" : "#fef3c7",
      color: type === "RENT" ? "#7c3aed" : "#d97706",
      fontWeight: 700,
      fontSize: "0.62rem",
      fontFamily: "Inter, sans-serif",
      height: 20,
    }}
  />
);

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
        fontSize: { xs: "0.75rem", sm: "0.85rem" },
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

const PropertyPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);
  const [flats, setFlats] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postHistory, setPostHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [imageUploadPostId, setImageUploadPostId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPostTitle, setGalleryPostTitle] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [flatDetailOpen, setFlatDetailOpen] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [createFlatOpen, setCreateFlatOpen] = useState(false);
  const [flatForm, setFlatForm] = useState({ flatNumber: "", wingId: "" });
  const [flatFormErrors, setFlatFormErrors] = useState({});
  const [assignOwnerOpen, setAssignOwnerOpen] = useState(false);
  const [assignOwnerFlatId, setAssignOwnerFlatId] = useState(null);
  const [ownerResidentId, setOwnerResidentId] = useState("");
  const [assignTenantOpen, setAssignTenantOpen] = useState(false);
  const [assignTenantFlatId, setAssignTenantFlatId] = useState(null);
  const [tenantResidentId, setTenantResidentId] = useState("");
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    flatId: "",
    ownerName: "",
    contactNumber: "",
    listingType: "RENT",
    furnishingStatus: "FULLY_FURNISHED",
    availabilityDate: "",
  });
  const [postFormErrors, setPostFormErrors] = useState({});
  const [postDetailOpen, setPostDetailOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const wings = [
    { id: 1, name: "Wing A" },
    { id: 2, name: "Wing B" },
    { id: 3, name: "Wing C" },
    { id: 4, name: "Wing D" },
    { id: 5, name: "Wing E" },
  ];
  
  const [flatsList, setFlatsList] = useState([]);
const [flatsLoading, setFlatsLoading] = useState(false);

const fetchFlats = async () => {
  setFlatsLoading(true);
  try {
    const res = await axiosInstance.get("/api/flat/all");
    console.log("Flats fetched:", res); // Debugging line
    setFlatsList(res.data); // adjust based on your response shape
  } catch {
    showError("Failed to load flats");
  } finally {
    setFlatsLoading(false);
  }
};

  const loadData = async () => {
    setLoading(true);
    try {
      const [flatsRes, postsRes, historyRes] = await Promise.all([
        axiosInstance.get("/api/flat/all"),
        axiosInstance.get("/api/property/post/all"),
        axiosInstance.get("/api/property/post/history"),
      ]);
      setFlats(flatsRes.data);
      setPosts(postsRes.data);
      setPostHistory(historyRes.data);
    } catch {
      showError("Failed to load property data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 5 || files.length > 10) {
      showError("Select 5-10 images");
      return;
    }
    setSelectedFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length < 5) {
      showError("Minimum 5 images required");
      return;
    }
    setUploadingImages(true);
    try {
      const urls = await uploadMultipleToCloudinary(
        selectedFiles,
        "urbansync/property",
      );
      await axiosInstance.post("/api/property/post/images", {
        postId: imageUploadPostId,
        imageUrls: urls,
      });
      showSuccess(`${urls.length} images uploaded`);
      setImageUploadOpen(false);
      setSelectedFiles([]);
      setImagePreviews([]);
      setImageUploadPostId(null);
    } catch (err) {
      showError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  const openGallery = async (post) => {
    setGalleryPostTitle(
      `${post.flatNumber || "Property"} - ${post.listingType}`,
    );
    setGalleryIndex(0);
    setGalleryOpen(true);
    setLoadingGallery(true);
    try {
      const res = await axiosInstance.get(
        `/api/property/post/${post.id}/images`,
      );
      setGalleryImages(res.data);
    } catch {
      showError("Failed to load images");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleCreateFlat = async () => {
    const e = {};
    if (!flatForm.flatNumber) e.flatNumber = "Required";
    if (!flatForm.wingId) e.wingId = "Select a wing";
    setFlatFormErrors(e);
    if (Object.values(e).some((v) => v)) return;
    setActionLoading(true);
    try {
      await axiosInstance.post("/api/flat/create", {
        flatNumber: flatForm.flatNumber,
        wingId: Number(flatForm.wingId),
      });
      showSuccess("Flat created");
      setCreateFlatOpen(false);
      setFlatForm({ flatNumber: "", wingId: "" });
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignOwner = async () => {
    if (!ownerResidentId) {
      showError("Enter resident ID");
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/flat/${assignOwnerFlatId}/assign-owner`, {
        residentId: Number(ownerResidentId),
      });
      showSuccess("Owner assigned");
      setAssignOwnerOpen(false);
      setOwnerResidentId("");
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTenant = async () => {
    if (!tenantResidentId) {
      showError("Enter resident ID");
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/flat/${assignTenantFlatId}/assign-tenant`, {
        residentId: Number(tenantResidentId),
      });
      showSuccess("Tenant assigned");
      setAssignTenantOpen(false);
      setTenantResidentId("");
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveTenant = async (flatId) => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/flat/${flatId}/remove-tenant`);
      showSuccess("Tenant removed");
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };
  // /flat/all

  const handleCreatePost = async () => {
    const e = {};
    if (!postForm.flatId) e.flatId = "Required";
    if (!postForm.ownerName) e.ownerName = "Required";
    if (!postForm.contactNumber) e.contactNumber = "Required";
    setPostFormErrors(e);
    if (Object.values(e).some((v) => v)) return;
    setActionLoading(true);
    try {
      await axiosInstance.post("/api/property/post/create", {
        ...postForm,
        flatId: Number(postForm.flatId),
      });
      showSuccess("Listing created");
      setCreatePostOpen(false);
      setPostForm({
        flatId: "",
        ownerName: "",
        contactNumber: "",
        listingType: "RENT",
        furnishingStatus: "FULLY_FURNISHED",
        availabilityDate: "",
      });
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkRented = async (postId) => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/property/post/${postId}/mark-rented`);
      showSuccess("Marked as rented/sold");
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

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

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          flexWrap: "nowrap",
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ApartmentIcon sx={{ color: "#0891b2", fontSize: 18 }} />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "0.85rem", sm: "1.05rem" },
              color: "#1e293b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Property Management
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            Manage flats and listings
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.8, flexShrink: 0 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
            onClick={() => setCreateFlatOpen(true)}
            sx={{
              bgcolor: "#0891b2",
              borderRadius: 2,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.68rem", sm: "0.78rem" },
              px: { xs: 1, sm: 1.5 },
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px rgba(8,145,178,0.25)",
              "&:hover": { bgcolor: "#0e7490" },
            }}
          >
            {isMobile ? "Flat" : "Add Flat"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HomeWorkIcon sx={{ fontSize: "13px !important" }} />}
            onClick={() => {
              setCreatePostOpen(true);
              fetchFlats();
            }}
            sx={{
              borderRadius: 2,
              borderColor: "#0891b2",
              color: "#0891b2",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.68rem", sm: "0.78rem" },
              px: { xs: 1, sm: 1.5 },
              whiteSpace: "nowrap",
            }}
          >
            {isMobile ? "List" : "Post Listing"}
          </Button>
        </Box>
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
              px: { xs: 1.5, sm: 2 },
            },
            "& .Mui-selected": { color: "#0891b2" },
            "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
          }}
        >
          <Tab label={`All Flats (${flats.length})`} />
          <Tab label={`Active (${posts.length})`} />
          <Tab label={`History (${postHistory.length})`} />
        </Tabs>

        {loading ? (
          <LoadingSkeleton />
        ) : tab === 0 ? (
          flats.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <ApartmentIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                }}
              >
                No flats added yet
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 480 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>Flat</TableCell>
                    <TableCell sx={headSx}>Wing</TableCell>
                    <TableCell sx={headSx}>Owner</TableCell>
                    <TableCell sx={headSx}>Tenant</TableCell>
                    <TableCell sx={headSx}>Status</TableCell>
                    <TableCell sx={headSx} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flats.map((flat) => (
                    <TableRow
                      key={flat.id}
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
                              fontSize: "0.62rem",
                              color: "#0891b2",
                              fontWeight: 700,
                            }}
                          >
                            {flat.flatNumber?.split("-")[0]}
                          </Avatar>
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                            }}
                          >
                            {flat.flatNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={cellSx}>{flat.wingName || "-"}</TableCell>
                      <TableCell sx={cellSx}>
                        {flat.ownerName || (
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.72rem",
                              color: "#94a3b8",
                              fontStyle: "italic",
                            }}
                          >
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {flat.currentTenantName || (
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.72rem",
                              color: "#94a3b8",
                              fontStyle: "italic",
                            }}
                          >
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <StatusChip status={flat.status} />
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ py: 0.8, px: 1, whiteSpace: "nowrap" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.4,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedFlat(flat);
                                setFlatDetailOpen(true);
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
                          {!flat.ownerId && (
                            <Tooltip title="Assign Owner">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setAssignOwnerFlatId(flat.id);
                                  setAssignOwnerOpen(true);
                                }}
                                sx={{
                                  color: "#059669",
                                  bgcolor: "#dcfce7",
                                  borderRadius: 1.5,
                                  width: 26,
                                  height: 26,
                                }}
                              >
                                <PersonAddIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {flat.ownerId && !flat.currentTenantId && (
                            <Tooltip title="Assign Tenant">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setAssignTenantFlatId(flat.id);
                                  setAssignTenantOpen(true);
                                }}
                                sx={{
                                  color: "#7c3aed",
                                  bgcolor: "#f3e8ff",
                                  borderRadius: 1.5,
                                  width: 26,
                                  height: 26,
                                }}
                              >
                                <PersonAddIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {flat.currentTenantId && (
                            <Tooltip title="Remove Tenant">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveTenant(flat.id)}
                                disabled={actionLoading}
                                sx={{
                                  color: "#dc2626",
                                  bgcolor: "#fee2e2",
                                  borderRadius: 1.5,
                                  width: 26,
                                  height: 26,
                                }}
                              >
                                <PersonRemoveIcon sx={{ fontSize: 13 }} />
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
          )
        ) : tab === 1 ? (
          posts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <HomeWorkIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                }}
              >
                No active listings
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 560 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headSx}>Flat</TableCell>
                    <TableCell sx={headSx}>Owner</TableCell>
                    <TableCell sx={headSx}>Contact</TableCell>
                    <TableCell sx={headSx}>Type</TableCell>
                    <TableCell sx={headSx}>Furnishing</TableCell>
                    <TableCell sx={headSx}>Available</TableCell>
                    <TableCell sx={headSx} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow
                      key={post.id}
                      hover
                      sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                    >
                      <TableCell sx={cellSx}>
                        {post.flatNumber || "-"}
                      </TableCell>
                      <TableCell sx={cellSx}>{post.ownerName}</TableCell>
                      <TableCell sx={cellSx}>{post.contactNumber}</TableCell>
                      <TableCell sx={cellSx}>
                        <ListingChip type={post.listingType} />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <Typography
                          sx={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "0.72rem",
                            color: "#64748b",
                          }}
                        >
                          {post.furnishingStatus?.replace(/_/g, " ")}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {post.availabilityDate
                          ? new Date(post.availabilityDate).toLocaleDateString(
                              "en-IN",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ py: 0.8, px: 1, whiteSpace: "nowrap" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.4,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedPost(post);
                                setPostDetailOpen(true);
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
                          <Tooltip title="Upload Images">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setImageUploadPostId(post.id);
                                setImageUploadOpen(true);
                              }}
                              sx={{
                                color: "#7c3aed",
                                bgcolor: "#f3e8ff",
                                borderRadius: 1.5,
                                width: 26,
                                height: 26,
                              }}
                            >
                              <CloudUploadIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Images">
                            <IconButton
                              size="small"
                              onClick={() => openGallery(post)}
                              sx={{
                                color: "#d97706",
                                bgcolor: "#fef3c7",
                                borderRadius: 1.5,
                                width: 26,
                                height: 26,
                              }}
                            >
                              <ImageIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark Rented/Sold">
                            <IconButton
                              size="small"
                              onClick={() => handleMarkRented(post.id)}
                              disabled={actionLoading}
                              sx={{
                                color: "#059669",
                                bgcolor: "#dcfce7",
                                borderRadius: 1.5,
                                width: 26,
                                height: 26,
                              }}
                            >
                              <HomeWorkIcon sx={{ fontSize: 13 }} />
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
        ) : postHistory.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <HomeWorkIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            >
              No listing history yet
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Flat</TableCell>
                  <TableCell sx={headSx}>Owner</TableCell>
                  <TableCell sx={headSx}>Type</TableCell>
                  <TableCell sx={headSx}>Furnishing</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx}>Posted</TableCell>
                  <TableCell sx={headSx} align="center">
                    Images
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {postHistory.map((post) => (
                  <TableRow
                    key={post.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                  >
                    <TableCell sx={cellSx}>{post.flatNumber || "-"}</TableCell>
                    <TableCell sx={cellSx}>{post.ownerName}</TableCell>
                    <TableCell sx={cellSx}>
                      <ListingChip type={post.listingType} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.72rem",
                          color: "#64748b",
                        }}
                      >
                        {post.furnishingStatus?.replace(/_/g, " ")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={post.isActive ? "Active" : "Rented"}
                        size="small"
                        sx={{
                          bgcolor: post.isActive ? "#dcfce7" : "#fee2e2",
                          color: post.isActive ? "#166534" : "#991b1b",
                          fontWeight: 700,
                          fontSize: "0.62rem",
                          fontFamily: "Inter, sans-serif",
                          height: 20,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString("en-IN")
                        : "-"}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.8, px: 1 }}>
                      <Tooltip title="View Images">
                        <IconButton
                          size="small"
                          onClick={() => openGallery(post)}
                          sx={{
                            color: "#d97706",
                            bgcolor: "#fef3c7",
                            borderRadius: 1.5,
                            width: 26,
                            height: 26,
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Flat Detail Modal */}
      <Dialog
        open={flatDetailOpen}
        onClose={() => setFlatDetailOpen(false)}
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
          Flat Details
        </DialogTitle>
        {selectedFlat && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            {[
              ["Flat Number", selectedFlat.flatNumber],
              ["Wing", selectedFlat.wingName || "-"],
              ["Owner", selectedFlat.ownerName || "Not assigned"],
              ["Tenant", selectedFlat.currentTenantName || "No tenant"],
              ["Status", selectedFlat.status],
            ].map(([label, value]) => (
              <DetailRow key={label} label={label} value={value} />
            ))}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 1.5, px: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setFlatDetailOpen(false)}
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

      {/* Create Flat Modal */}
      <Dialog
        open={createFlatOpen}
        onClose={() => {
          setCreateFlatOpen(false);
          setFlatForm({ flatNumber: "", wingId: "" });
          setFlatFormErrors({});
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
          }}
        >
          Add New Flat
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <FormControl
              size="small"
              error={!!flatFormErrors.wingId}
              sx={fieldStyle(isMobile)}
            >
              <InputLabel
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                Wing *
              </InputLabel>
              <Select
                value={flatForm.wingId}
                onChange={(e) =>
                  setFlatForm({ ...flatForm, wingId: e.target.value })
                }
                label="Wing *"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "0.78rem" : "0.875rem",
                }}
              >
                {wings.map((w) => (
                  <MenuItem
                    key={w.id}
                    value={w.id}
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
              {flatFormErrors.wingId && (
                <Typography
                  sx={{
                    color: "#d32f2f",
                    fontSize: "0.62rem",
                    mt: 0.5,
                    ml: 1.5,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {flatFormErrors.wingId}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Flat Number *"
              value={flatForm.flatNumber}
              onChange={(e) =>
                setFlatForm({ ...flatForm, flatNumber: e.target.value })
              }
              size="small"
              fullWidth
              placeholder="e.g. 201"
              error={!!flatFormErrors.flatNumber}
              helperText={flatFormErrors.flatNumber}
              sx={fieldStyle(isMobile)}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => {
              setCreateFlatOpen(false);
              setFlatForm({ flatNumber: "", wingId: "" });
              setFlatFormErrors({});
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
            onClick={handleCreateFlat}
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
            {actionLoading ? "Creating..." : "Create Flat"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Owner Modal */}
      <Dialog
        open={assignOwnerOpen}
        onClose={() => {
          setAssignOwnerOpen(false);
          setOwnerResidentId("");
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
          }}
        >
          Assign Owner
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              color: "#64748b",
              mb: 1.5,
            }}
          >
            Enter the Resident ID of the owner.
          </Typography>
          <TextField
            label="Owner Resident ID *"
            value={ownerResidentId}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value))
                setOwnerResidentId(e.target.value);
            }}
            size="small"
            fullWidth
            sx={fieldStyle(isMobile)}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => {
              setAssignOwnerOpen(false);
              setOwnerResidentId("");
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
            onClick={handleAssignOwner}
            disabled={actionLoading || !ownerResidentId}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#059669",
              borderRadius: 2,
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            {actionLoading ? "Assigning..." : "Assign Owner"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Tenant Modal */}
      <Dialog
        open={assignTenantOpen}
        onClose={() => {
          setAssignTenantOpen(false);
          setTenantResidentId("");
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
          }}
        >
          Assign Tenant
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              color: "#64748b",
              mb: 1.5,
            }}
          >
            Enter the Resident ID of the tenant.
          </Typography>
          <TextField
            label="Tenant Resident ID *"
            value={tenantResidentId}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value))
                setTenantResidentId(e.target.value);
            }}
            size="small"
            fullWidth
            sx={fieldStyle(isMobile)}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => {
              setAssignTenantOpen(false);
              setTenantResidentId("");
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
            onClick={handleAssignTenant}
            disabled={actionLoading || !tenantResidentId}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#7c3aed",
              borderRadius: 2,
              "&:hover": { bgcolor: "#6d28d9" },
            }}
          >
            {actionLoading ? "Assigning..." : "Assign Tenant"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Post Modal */}
      <Dialog
        open={createPostOpen}
        onClose={() => {
          setCreatePostOpen(false);
          setPostForm({
            flatId: "",
            ownerName: "",
            contactNumber: "",
            listingType: "RENT",
            furnishingStatus: "FULLY_FURNISHED",
            availabilityDate: "",
          });
          setPostFormErrors({});
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
          }}
        >
          Create Property Listing
        </DialogTitle>
      <DialogContent sx={{ pt: 1.5, px: 2 }}>
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

    {/* ✅ REPLACED: Flat ID TextField → Select dropdown */}
    <FormControl
      size="small"
      fullWidth
      error={!!postFormErrors.flatId}
      sx={fieldStyle(isMobile)}
    >
      <InputLabel
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: isMobile ? "0.78rem" : "0.875rem",
        }}
      >
        Flat *
      </InputLabel>
      <Select
  value={postForm.flatId}
  onChange={(e) => setPostForm({ ...postForm, flatId: e.target.value })}
  label="Flat *"
  disabled={loading}
  MenuProps={{
    PaperProps: {
      sx: {
        maxHeight: 200,  // ✅ was 40, fix here
        "& .MuiMenuItem-root": {
          fontSize: "0.82rem",
          fontFamily: "Inter, sans-serif",
          py: 0.6,
          minHeight: "auto",
        },
      },
    },
  }}
  sx={{
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
  }}
>
  {loading ? (
    <MenuItem disabled sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
      <em>Loading flats…</em>
    </MenuItem>
  ) : flats.length === 0 ? (
    <MenuItem disabled sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
      <em>No flats available</em>
    </MenuItem>
  ) : (
    flats.map((flat) => (
      <MenuItem
        key={flat.id}
        value={flat.id}
        sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
      >
        {flat.flatNumber} 
      </MenuItem>
    ))
  )}
</Select>
      <FormHelperText sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem" }}>
        {postFormErrors.flatId || "Select a flat from the list"}
      </FormHelperText>
    </FormControl>

    {/* ✅ UNCHANGED below */}
    <TextField
      label="Owner Name *"
      value={postForm.ownerName}
      onChange={(e) => {
        if (!/^[a-zA-Z\s]*$/.test(e.target.value)) return;
        setPostForm({ ...postForm, ownerName: e.target.value });
      }}
      size="small"
      fullWidth
      error={!!postFormErrors.ownerName}
      helperText={postFormErrors.ownerName}
      sx={fieldStyle(isMobile)}
    />
    <TextField
      label="Contact Number *"
      value={postForm.contactNumber}
      onChange={(e) => {
        if (!/^\d*$/.test(e.target.value) || e.target.value.length > 10) return;
        setPostForm({ ...postForm, contactNumber: e.target.value });
      }}
      size="small"
      fullWidth
      error={!!postFormErrors.contactNumber}
      helperText={postFormErrors.contactNumber}
      sx={fieldStyle(isMobile)}
    />
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}>
      <FormControl size="small" sx={fieldStyle(isMobile)}>
        <InputLabel
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: isMobile ? "0.78rem" : "0.875rem",
          }}
        >
          Type
        </InputLabel>
        <Select
          value={postForm.listingType}
          onChange={(e) => setPostForm({ ...postForm, listingType: e.target.value })}
          label="Type"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: isMobile ? "0.78rem" : "0.875rem",
          }}
        >
          <MenuItem value="RENT" sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
            Rent
          </MenuItem>
          <MenuItem value="SALE" sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
            Sale
          </MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={fieldStyle(isMobile)}>
        <InputLabel
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: isMobile ? "0.78rem" : "0.875rem",
          }}
        >
          Furnishing
        </InputLabel>
        <Select
          value={postForm.furnishingStatus}
          onChange={(e) => setPostForm({ ...postForm, furnishingStatus: e.target.value })}
          label="Furnishing"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: isMobile ? "0.78rem" : "0.875rem",
          }}
        >
          <MenuItem value="FULLY_FURNISHED" sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
            Fully
          </MenuItem>
          <MenuItem value="SEMI_FURNISHED" sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
            Semi
          </MenuItem>
          <MenuItem value="NON_FURNISHED" sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}>
            None
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
    <TextField
      label="Availability Date"
      value={postForm.availabilityDate}
      onChange={(e) => setPostForm({ ...postForm, availabilityDate: e.target.value })}
      size="small"
      fullWidth
      type="date"
      slotProps={{ inputLabel: { shrink: true } }}
      sx={fieldStyle(isMobile)}
    />
  </Box>
</DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => {
              setCreatePostOpen(false);
              setPostForm({
                flatId: "",
                ownerName: "",
                contactNumber: "",
                listingType: "RENT",
                furnishingStatus: "FULLY_FURNISHED",
                availabilityDate: "",
              });
              setPostFormErrors({});
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
            onClick={handleCreatePost}
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
            {actionLoading ? "Creating..." : "Create Listing"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post Detail Modal */}
      <Dialog
        open={postDetailOpen}
        onClose={() => setPostDetailOpen(false)}
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
          Listing Details
        </DialogTitle>
        {selectedPost && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            {[
              ["Flat Number", selectedPost.flatNumber || "-"],
              ["Owner Name", selectedPost.ownerName],
              ["Contact", selectedPost.contactNumber],
              ["Type", selectedPost.listingType],
              ["Furnishing", selectedPost.furnishingStatus?.replace(/_/g, " ")],
              [
                "Available",
                selectedPost.availabilityDate
                  ? new Date(selectedPost.availabilityDate).toLocaleDateString(
                      "en-IN",
                    )
                  : "-",
              ],
              ["Status", selectedPost.isActive ? "Active" : "Rented/Sold"],
              [
                "Posted On",
                selectedPost.createdAt
                  ? new Date(selectedPost.createdAt).toLocaleDateString("en-IN")
                  : "-",
              ],
            ].map(([label, value]) => (
              <DetailRow key={label} label={label} value={value} />
            ))}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 1.5, px: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setPostDetailOpen(false)}
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

      {/* Image Upload Modal */}
      <Dialog
        open={imageUploadOpen}
        onClose={() => {
          setImageUploadOpen(false);
          setSelectedFiles([]);
          setImagePreviews([]);
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
          <CloudUploadIcon sx={{ color: "#7c3aed", fontSize: 16 }} />
          Upload Property Images
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f3e8ff",
                borderRadius: 2,
                border: "1px dashed #7c3aed",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  color: "#7c3aed",
                  fontWeight: 600,
                  mb: 0.3,
                }}
              >
                Select 5 to 10 property images
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.65rem", sm: "0.72rem" },
                  color: "#94a3b8",
                }}
              >
                JPG, PNG - Max 5MB each
              </Typography>
            </Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              size="small"
              startIcon={
                <CloudUploadIcon sx={{ fontSize: "14px !important" }} />
              }
              sx={{
                borderRadius: 2,
                borderColor: "#7c3aed",
                color: "#7c3aed",
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: { xs: "0.75rem", sm: "0.82rem" },
                py: 1,
              }}
            >
              {selectedFiles.length > 0
                ? `${selectedFiles.length} selected`
                : "Choose Images (5-10)"}
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Button>
            {imagePreviews.length > 0 && (
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#64748b",
                    mb: 0.8,
                  }}
                >
                  Preview ({imagePreviews.length}):
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 0.8,
                  }}
                >
                  {imagePreviews.map((src, i) => (
                    <Box
                      key={i}
                      sx={{
                        aspectRatio: "1",
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: "2px solid #e0f2fe",
                      }}
                    >
                      <Box
                        component="img"
                        src={src}
                        alt={`p${i}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
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
            onClick={() => {
              setImageUploadOpen(false);
              setSelectedFiles([]);
              setImagePreviews([]);
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
            onClick={handleUploadImages}
            disabled={uploadingImages || selectedFiles.length < 5}
            startIcon={
              uploadingImages ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <CloudUploadIcon sx={{ fontSize: "13px !important" }} />
              )
            }
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#7c3aed",
              borderRadius: 2,
              "&:hover": { bgcolor: "#6d28d9" },
            }}
          >
            {uploadingImages
              ? "Uploading..."
              : `Upload ${selectedFiles.length}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Modal */}
      <Dialog
        open={galleryOpen}
        onClose={() => {
          setGalleryOpen(false);
          setGalleryImages([]);
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
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
          >
            <ImageIcon sx={{ color: "#d97706", fontSize: 16, flexShrink: 0 }} />
            <Typography
              noWrap
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.78rem", sm: "0.88rem" },
                color: "white",
                fontWeight: 700,
              }}
            >
              {galleryPostTitle}
            </Typography>
            {galleryImages.length > 0 && (
              <Chip
                label={`${galleryImages.length}`}
                size="small"
                sx={{
                  bgcolor: "#1e293b",
                  color: "#94a3b8",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.62rem",
                  height: 18,
                  flexShrink: 0,
                }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setGalleryOpen(false);
              setGalleryImages([]);
            }}
            sx={{ color: "white", flexShrink: 0 }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 2 }, bgcolor: "#0f172a" }}>
          {loadingGallery ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress sx={{ color: "#d97706" }} />
            </Box>
          ) : galleryImages.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <ImageIcon sx={{ fontSize: 40, color: "#334155", mb: 1 }} />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#64748b",
                  fontSize: { xs: "0.78rem", sm: "0.88rem" },
                }}
              >
                No images uploaded for this listing
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Box
                  component="img"
                  src={galleryImages[galleryIndex]?.imageUrl}
                  alt="property"
                  sx={{
                    width: "100%",
                    maxHeight: { xs: 250, sm: 400 },
                    objectFit: "contain",
                    bgcolor: "#1e293b",
                  }}
                />
              </Box>
              <Box
                sx={{ display: "flex", gap: 0.8, overflowX: "auto", pb: 0.5 }}
              >
                {galleryImages.map((img, i) => (
                  <Box
                    key={img.id}
                    onClick={() => setGalleryIndex(i)}
                    sx={{
                      width: { xs: 48, sm: 60 },
                      height: { xs: 48, sm: 60 },
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
                    }}
                  >
                    <Box
                      component="img"
                      src={img.imageUrl}
                      alt={`t${i}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                ))}
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.68rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                {galleryIndex + 1} / {galleryImages.length}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PropertyPage;
