import { useEffect, useState } from "react";
import { Box, Typography, Paper, Skeleton, Avatar, Chip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import BadgeIcon from "@mui/icons-material/Badge";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const InfoRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: { xs: 1.2, sm: 1.5 },
      py: { xs: 1.2, sm: 1.5 },
      borderBottom: "1px solid #f1f5f9",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Box
      sx={{
        width: { xs: 28, sm: 32 },
        height: { xs: 28, sm: 32 },
        borderRadius: 1.5,
        bgcolor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: { xs: "0.6rem", sm: "0.68rem" },
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          mb: 0.2,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: { xs: "0.8rem", sm: "0.88rem" },
          fontWeight: 600,
          color: "#1e293b",
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  </Box>
);

const CaretakerProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/caretaker/profile/me")
      .then((res) => setProfile(res.data))
      .catch(() => showError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
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
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PersonIcon sx={{ color: "#059669", fontSize: 18 }} />
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
            My Profile
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            Your caretaker details
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #bbf7d0",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(5,150,105,0.06)",
        }}
      >
        {/* Profile Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            flexWrap: "nowrap",
          }}
        >
          <Avatar
            src={profile?.photoUrl || undefined}
            sx={{
              width: { xs: 48, sm: 64 },
              height: { xs: 48, sm: 64 },
              bgcolor: "#059669",
              fontSize: { xs: "1.1rem", sm: "1.5rem" },
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {!profile?.photoUrl && profile?.firstName?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile?.firstName} {profile?.lastName}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.6, mt: 0.5, flexWrap: "wrap" }}>
              <Chip
                label={`Serial #${profile?.serialNumber}`}
                size="small"
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#059669",
                  fontWeight: 700,
                  fontSize: { xs: "0.58rem", sm: "0.68rem" },
                  fontFamily: "Inter, sans-serif",
                  height: { xs: 18, sm: 20 },
                }}
              />
              <Chip
                label={profile?.status || "ACTIVE"}
                size="small"
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: { xs: "0.58rem", sm: "0.68rem" },
                  fontFamily: "Inter, sans-serif",
                  height: { xs: 18, sm: 20 },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Details */}
        <Box sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>
          <InfoRow
            icon={
              <PhoneIcon
                sx={{ fontSize: { xs: 12, sm: 14 }, color: "#059669" }}
              />
            }
            label="Mobile Number"
            value={`+91 ${profile?.mobileNumber}`}
          />
          <InfoRow
            icon={
              <BadgeIcon
                sx={{ fontSize: { xs: 12, sm: 14 }, color: "#059669" }}
              />
            }
            label="Age"
            value={`${profile?.age} years`}
          />
          <InfoRow
            icon={
              <FingerprintIcon
                sx={{ fontSize: { xs: 12, sm: 14 }, color: "#059669" }}
              />
            }
            label="Aadhaar Number"
            value={
              profile?.aadhaarNumber
                ? `XXXX XXXX ${profile.aadhaarNumber.slice(-4)}`
                : "-"
            }
          />
          <InfoRow
            icon={
              <HomeIcon
                sx={{ fontSize: { xs: 12, sm: 14 }, color: "#059669" }}
              />
            }
            label="Permanent Address"
            value={profile?.permanentAddress}
          />
          <InfoRow
            icon={
              <BadgeIcon
                sx={{ fontSize: { xs: 12, sm: 14 }, color: "#059669" }}
              />
            }
            label="Joined On"
            value={
              profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-IN")
                : "-"
            }
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default CaretakerProfilePage;
