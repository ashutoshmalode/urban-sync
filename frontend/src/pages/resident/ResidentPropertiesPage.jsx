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
  useMediaQuery,
  useTheme,
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
        <ImageIcon sx={{ fontSize: { xs: 28, sm: 40 }, color: "#bae6fd" }} />
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

const FURNISHING_LABELS = {
  FULLY_FURNISHED: "Fully Furnished",
  SEMI_FURNISHED: "Semi Furnished",
  NON_FURNISHED: "Non Furnished",
};

const ResidentPropertiesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  return (
    <Box>
      {/* Header */}
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
          <HomeWorkIcon sx={{ color: "#d97706", fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "0.9rem", sm: "1.05rem" },
              color: "#1e293b",
            }}
          >
            Available Properties
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            {isMobile
              ? "Flats for rent or sale"
              : "Flats available for rent or sale in the society"}
          </Typography>
        </Box>
      </Box>

      {/* Filter Chips */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 0.8, sm: 1 },
          mb: { xs: 1.5, sm: 2.5 },
          flexWrap: "nowrap",
          overflowX: "auto",
        }}
      >
        {[
          { key: "ALL", label: `All (${posts.length})` },
          {
            key: "RENT",
            label: `Rent (${posts.filter((p) => p.listingType === "RENT").length})`,
          },
          {
            key: "SALE",
            label: `Sale (${posts.filter((p) => p.listingType === "SALE").length})`,
          },
        ].map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            onClick={() => setFilter(f.key)}
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.68rem", sm: "0.75rem" },
              height: { xs: 26, sm: 30 },
              cursor: "pointer",
              flexShrink: 0,
              bgcolor:
                filter === f.key
                  ? f.key === "RENT"
                    ? "#f3e8ff"
                    : f.key === "SALE"
                      ? "#fef3c7"
                      : "#e0f2fe"
                  : "#f1f5f9",
              color:
                filter === f.key
                  ? f.key === "RENT"
                    ? "#7c3aed"
                    : f.key === "SALE"
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
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {[...Array(6)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton
                variant="rounded"
                height={{ xs: 180, sm: 220 }}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <HomeWorkIcon
            sx={{ fontSize: { xs: 40, sm: 56 }, color: "#cbd5e1", mb: 1.5 }}
          />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#94a3b8",
              fontSize: "0.85rem",
            }}
          >
            No properties available right now
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
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
                {/* Thumbnail */}
                <Box
                  sx={{
                    height: { xs: 120, sm: 140 },
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
                      top: 8,
                      right: 8,
                      bgcolor:
                        post.listingType === "RENT" ? "#f3e8ff" : "#fef3c7",
                      color:
                        post.listingType === "RENT" ? "#7c3aed" : "#d97706",
                      fontWeight: 700,
                      fontSize: { xs: "0.6rem", sm: "0.68rem" },
                      fontFamily: "Inter, sans-serif",
                      height: { xs: 18, sm: 22 },
                    }}
                  />
                </Box>

                {/* Card Details */}
                <Box sx={{ p: { xs: 1.2, sm: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      mb: 0.6,
                    }}
                  >
                    <LocationOnIcon
                      sx={{
                        fontSize: { xs: 13, sm: 16 },
                        color: "#0891b2",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: { xs: "0.78rem", sm: "0.88rem" },
                        color: "#1e293b",
                      }}
                    >
                      Flat {post.flatNumber || "-"}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      color: "#64748b",
                      mb: 0.8,
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
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        minWidth: 0,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: { xs: 16, sm: 20 },
                          height: { xs: 16, sm: 20 },
                          bgcolor: "#e0f2fe",
                          fontSize: "0.55rem",
                          color: "#0891b2",
                          flexShrink: 0,
                        }}
                      >
                        {post.ownerName?.[0]}
                      </Avatar>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
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
                          fontSize: { xs: "0.58rem", sm: "0.68rem" },
                          color: "#94a3b8",
                          flexShrink: 0,
                          ml: 0.5,
                        }}
                      >
                        {new Date(post.availabilityDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short" },
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
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, mx: { xs: 1, sm: 3 } } } }}
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
          >
            <HomeWorkIcon
              sx={{ color: "#d97706", fontSize: 16, flexShrink: 0 }}
            />
            <Typography
              noWrap
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                color: "#1e293b",
              }}
            >
              Flat {selected?.flatNumber} - {selected?.listingType}
            </Typography>
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
              p: 0.5,
            }}
          >
            <CancelIcon sx={{ fontSize: 18 }} />
          </Button>
        </DialogTitle>

        {selected && (
          <DialogContent sx={{ pt: 1.5, px: { xs: 1.5, sm: 2 } }}>
            {/* Image Gallery */}
            {loadingImages ? (
              <Skeleton
                variant="rounded"
                height={{ xs: 180, sm: 240 }}
                sx={{ borderRadius: 2, mb: 1.5 }}
              />
            ) : images.length > 0 ? (
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ borderRadius: 2, overflow: "hidden", mb: 1 }}>
                  <Box
                    component="img"
                    src={images[galleryIndex]?.imageUrl}
                    alt="property"
                    sx={{
                      width: "100%",
                      height: { xs: 180, sm: 240 },
                      objectFit: "cover",
                    }}
                  />
                </Box>
                {images.length > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.8,
                      overflowX: "auto",
                      pb: 0.5,
                    }}
                  >
                    {images.map((img, i) => (
                      <Box
                        key={img.id}
                        onClick={() => setGalleryIndex(i)}
                        sx={{
                          width: { xs: 44, sm: 56 },
                          height: { xs: 44, sm: 56 },
                          flexShrink: 0,
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border:
                            i === galleryIndex
                              ? "2px solid #0891b2"
                              : "2px solid #e0f2fe",
                          cursor: "pointer",
                          opacity: i === galleryIndex ? 1 : 0.6,
                          transition: "all 0.2s",
                        }}
                      >
                        <Box
                          component="img"
                          src={img.imageUrl}
                          alt={`t${i}`}
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
                  height: { xs: 120, sm: 160 },
                  bgcolor: "#f0f9ff",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                }}
              >
                <ImageIcon
                  sx={{ fontSize: { xs: 32, sm: 40 }, color: "#bae6fd" }}
                />
              </Box>
            )}

            {/* Property Details */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <DetailRow
                label="Flat Number"
                value={selected.flatNumber || "-"}
              />
              <DetailRow label="Listing Type" value={selected.listingType} />
              <DetailRow
                label="Furnishing"
                value={
                  FURNISHING_LABELS[selected.furnishingStatus] ||
                  selected.furnishingStatus
                }
              />
              <DetailRow
                label="Available From"
                value={
                  selected.availabilityDate
                    ? new Date(selected.availabilityDate).toLocaleDateString(
                        "en-IN",
                      )
                    : "-"
                }
              />
            </Box>

            {/* Contact Owner */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                mt: 1.5,
                borderRadius: 2,
                bgcolor: "#f0f9ff",
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
                  mb: 0.8,
                }}
              >
                Contact Owner
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "0.82rem", sm: "0.92rem" },
                  color: "#1e293b",
                  mb: 0.5,
                }}
              >
                {selected.ownerName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <PhoneIcon
                  sx={{ fontSize: { xs: 14, sm: 16 }, color: "#0891b2" }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.82rem", sm: "0.88rem" },
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
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  color: "#64748b",
                  mt: 0.8,
                }}
              >
                Contact directly to arrange a visit or discuss terms.
              </Typography>
            </Paper>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 1.5, px: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => {
              setDetailOpen(false);
              setImages([]);
            }}
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
    </Box>
  );
};

export default ResidentPropertiesPage;
