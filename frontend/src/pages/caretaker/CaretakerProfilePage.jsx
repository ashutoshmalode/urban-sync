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
      gap: 1.5,
      py: 1.5,
      borderBottom: "1px solid #f1f5f9",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
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
    <Box>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.68rem",
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
          fontSize: "0.88rem",
          fontWeight: 600,
          color: "#1e293b",
        }}
      >
        {value || "—"}
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
      <Box sx={{ p: 3 }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
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

  return (
    <Box>
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
          <PersonIcon sx={{ color: "#059669", fontSize: 20 }} />
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
            My Profile
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
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
        {/* Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            src={profile?.photoUrl || undefined}
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#059669",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            {!profile?.photoUrl && profile?.firstName?.[0]}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "#1e293b",
              }}
            >
              {profile?.firstName} {profile?.lastName}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.8, mt: 0.5 }}>
              <Chip
                label={`Serial #${profile?.serialNumber}`}
                size="small"
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#059669",
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  fontFamily: "Inter, sans-serif",
                  height: 20,
                }}
              />
              <Chip
                label={profile?.status || "ACTIVE"}
                size="small"
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  fontFamily: "Inter, sans-serif",
                  height: 20,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Details */}
        <Box sx={{ p: 2 }}>
          <InfoRow
            icon={<PhoneIcon sx={{ fontSize: 14, color: "#059669" }} />}
            label="Mobile Number"
            value={`+91 ${profile?.mobileNumber}`}
          />
          <InfoRow
            icon={<BadgeIcon sx={{ fontSize: 14, color: "#059669" }} />}
            label="Age"
            value={`${profile?.age} years`}
          />
          <InfoRow
            icon={<FingerprintIcon sx={{ fontSize: 14, color: "#059669" }} />}
            label="Aadhaar Number"
            value={
              profile?.aadhaarNumber
                ? `XXXX XXXX ${profile.aadhaarNumber.slice(-4)}`
                : "—"
            }
          />
          <InfoRow
            icon={<HomeIcon sx={{ fontSize: 14, color: "#059669" }} />}
            label="Permanent Address"
            value={profile?.permanentAddress}
          />
          <InfoRow
            icon={<BadgeIcon sx={{ fontSize: 14, color: "#059669" }} />}
            label="Joined On"
            value={
              profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-IN")
                : "—"
            }
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default CaretakerProfilePage;
