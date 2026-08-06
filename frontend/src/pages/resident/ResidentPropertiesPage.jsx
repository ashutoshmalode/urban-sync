import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
} from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ImageIcon from "@mui/icons-material/Image";
import CancelIcon from "@mui/icons-material/Cancel";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const PropertyThumbnail = ({ postId }) => {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/api/property/post/${postId}/images`)
      .then((res) => {
        if (res.data.length > 0) setImgUrl(res.data[0].imageUrl);
      })
      .catch(() => {});
  }, [postId]);

  if (!imgUrl)
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageIcon sx={{ fontSize: 40, color: "#bae6fd" }} />
      </Box>
    );

  return (
    <Box
      component="img"
      src={imgUrl}
      alt="property"
      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

const ResidentPropertiesPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    axiosInstance
      .get("/api/property/post/all")
      .then((res) => setPosts(res.data))
      .catch(() => showError("Failed to load properties"))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (post) => {
    setSelected(post);
    setDetailOpen(true);
    setGalleryIndex(0);
    setImages([]);
    setLoadingImages(true);
    try {
      const res = await axiosInstance.get(
        `/api/property/post/${post.id}/images`,
      );
      setImages(res.data);
    } catch {
      showError("Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  };

  const filtered =
    filter === "ALL" ? posts : posts.filter((p) => p.listingType === filter);

  const FURNISHING_LABELS = {
    FULLY_FURNISHED: "Fully Furnished",
    SEMI_FURNISHED: "Semi Furnished",
    NON_FURNISHED: "Non Furnished",
  };

  return (
    <Box>
      {/* Header */}
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
          <HomeWorkIcon sx={{ color: "#d97706", fontSize: 20 }} />
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
            Available Properties
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Flats available for rent or sale in the society
          </Typography>
        </Box>
      </Box>

      {/* Filter Chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 2.5 }}>
        {["ALL", "RENT", "SALE"].map((f) => (
          <Chip
            key={f}
            label={
              f === "ALL"
                ? `All (${posts.length})`
                : f === "RENT"
                  ? `For Rent (${posts.filter((p) => p.listingType === "RENT").length})`
                  : `For Sale (${posts.filter((p) => p.listingType === "SALE").length})`
            }
            onClick={() => setFilter(f)}
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "0.78rem",
              cursor: "pointer",
              bgcolor:
                filter === f
                  ? f === "RENT"
                    ? "#f3e8ff"
                    : f === "SALE"
                      ? "#fef3c7"
                      : "#e0f2fe"
                  : "#f1f5f9",
              color:
                filter === f
                  ? f === "RENT"
                    ? "#7c3aed"
                    : f === "SALE"
                      ? "#d97706"
                      : "#0891b2"
                  : "#64748b",
              "&:hover": { opacity: 0.85 },
            }}
          />
        ))}
      </Box>

      {/* Properties Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton
                variant="rounded"
                height={220}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <HomeWorkIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 1.5 }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#94a3b8",
              fontSize: "0.88rem",
            }}
          >
            No properties available right now
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((post) => (
            <Grid key={post.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                onClick={() => openDetail(post)}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e0f2fe",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 24px rgba(8,145,178,0.12)",
                  },
                }}
              >
                {/* Image placeholder */}
                {/* Thumbnail */}
                <Box
                  sx={{
                    height: 140,
                    bgcolor: "#f0f9ff",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <PropertyThumbnail postId={post.id} />
                  <Chip
                    label={post.listingType}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      bgcolor:
                        post.listingType === "RENT" ? "#f3e8ff" : "#fef3c7",
                      color:
                        post.listingType === "RENT" ? "#7c3aed" : "#d97706",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      fontFamily: "Inter, sans-serif",
                    }}
                  />
                </Box>

                {/* Details */}
                <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 16, color: "#0891b2" }} />
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        color: "#1e293b",
                      }}
                    >
                      Flat {post.flatNumber || "—"}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.75rem",
                      color: "#64748b",
                      mb: 1,
                    }}
                  >
                    {FURNISHING_LABELS[post.furnishingStatus] ||
                      post.furnishingStatus}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: "#e0f2fe",
                          fontSize: "0.6rem",
                          color: "#0891b2",
                        }}
                      >
                        {post.ownerName?.[0]}
                      </Avatar>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.75rem",
                          color: "#475569",
                          fontWeight: 500,
                        }}
                      >
                        {post.ownerName}
                      </Typography>
                    </Box>
                    {post.availabilityDate && (
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.68rem",
                          color: "#94a3b8",
                        }}
                      >
                        From{" "}
                        {new Date(post.availabilityDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Modal */}
      <Dialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setImages([]);
        }}
        maxWidth="md"
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HomeWorkIcon sx={{ color: "#d97706", fontSize: 18 }} />
            Flat {selected?.flatNumber} — {selected?.listingType}
          </Box>
          <Button
            size="small"
            onClick={() => {
              setDetailOpen(false);
              setImages([]);
            }}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
              minWidth: 0,
            }}
          >
            <CancelIcon fontSize="small" />
          </Button>
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 2 }}>
            {/* Image Gallery */}
            {loadingImages ? (
              <Skeleton
                variant="rounded"
                height={280}
                sx={{ borderRadius: 2, mb: 2 }}
              />
            ) : images.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ borderRadius: 2, overflow: "hidden", mb: 1 }}>
                  <Box
                    component="img"
                    src={images[galleryIndex]?.imageUrl}
                    alt="property"
                    sx={{ width: "100%", height: 280, objectFit: "cover" }}
                  />
                </Box>
                {images.length > 1 && (
                  <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
                    {images.map((img, i) => (
                      <Box
                        key={img.id}
                        onClick={() => setGalleryIndex(i)}
                        sx={{
                          width: 60,
                          height: 60,
                          flexShrink: 0,
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border:
                            i === galleryIndex
                              ? "2px solid #0891b2"
                              : "2px solid #e0f2fe",
                          cursor: "pointer",
                          opacity: i === galleryIndex ? 1 : 0.6,
                        }}
                      >
                        <Box
                          component="img"
                          src={img.imageUrl}
                          alt={`thumb-${i}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  height: 160,
                  bgcolor: "#f0f9ff",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <ImageIcon sx={{ fontSize: 40, color: "#bae6fd" }} />
              </Box>
            )}

            {/* Property Details */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {[
                  ["Flat Number", selected.flatNumber || "—"],
                  ["Listing Type", selected.listingType],
                  [
                    "Furnishing",
                    FURNISHING_LABELS[selected.furnishingStatus] ||
                      selected.furnishingStatus,
                  ],
                  [
                    "Available From",
                    selected.availabilityDate
                      ? new Date(selected.availabilityDate).toLocaleDateString(
                          "en-IN",
                        )
                      : "—",
                  ],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid #f1f5f9",
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
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#f0f9ff",
                    border: "1px solid #e0f2fe",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#0891b2",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 1,
                    }}
                  >
                    Contact Owner
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      color: "#1e293b",
                      mb: 0.5,
                    }}
                  >
                    {selected.ownerName}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: "#0891b2" }} />
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.88rem",
                        color: "#0891b2",
                        fontWeight: 600,
                      }}
                    >
                      +91 {selected.contactNumber}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.7rem",
                      color: "#64748b",
                      mt: 1,
                    }}
                  >
                    Contact directly to arrange a visit or discuss terms.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => {
              setDetailOpen(false);
              setImages([]);
            }}
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
    </Box>
  );
};

export default ResidentPropertiesPage;
