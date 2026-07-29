import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Alert,
  Chip,
  // Divider,
  Grid,
  Avatar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BadgeIcon from "@mui/icons-material/Badge";
import EditIcon from "@mui/icons-material/Edit";
import axiosInstance from "../../api/axiosInstance";

const InfoRow = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
      py: 1.5,
      borderBottom: "1px solid #f1f5f9",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 2,
        bgcolor: "#f0f9ff",
        border: "1px solid #e0f2fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: 0.2,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        sx={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
          mb: 0.2,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#1e293b",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);

const SectionCard = ({ title, icon, children }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid #e0f2fe",
      overflow: "hidden",
      height: "100%",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
    }}
  >
    <Box
      sx={{
        px: 2.5,
        py: 1.8,
        bgcolor: "#f8fbff",
        borderBottom: "1px solid #e0f2fe",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1.5,
          bgcolor: "#e0f2fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#0891b2",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {title}
      </Typography>
    </Box>
    <Box sx={{ px: 2.5, py: 1 }}>{children}</Box>
  </Paper>
);

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/api/secretary/profile")
      .then((res) => setProfile(res.data))
      .catch(() => setError("Failed to load profile. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box>
        <Skeleton
          variant="rounded"
          height={90}
          sx={{ mb: 2, borderRadius: 3 }}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );

  if (error)
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 2, fontFamily: "Inter, sans-serif" }}
      >
        {error}
      </Alert>
    );

  return (
    <Box sx={{ fontFamily: "Inter, sans-serif" }}>
      {/* Profile Hero Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          mb: 2.5,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
            px: { xs: 2.5, sm: 3 },
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              bgcolor: "rgba(255,255,255,0.2)",
              fontSize: { xs: "1.4rem", sm: "1.6rem" },
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            {profile?.firstName?.[0]}
            {profile?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: "1rem", sm: "1.2rem" },
                fontWeight: 800,
                color: "white",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.2,
              }}
            >
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "Inter, sans-serif",
                mt: 0.3,
              }}
            >
              {profile.email}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.8,
            }}
          >
            <Chip
              label="SECRETARY"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.65rem",
                fontFamily: "Inter, sans-serif",
                border: "1px solid rgba(255,255,255,0.3)",
                height: 22,
              }}
            />
            <Chip
              icon={
                <EditIcon
                  sx={{
                    fontSize: "12px !important",
                    color: "rgba(255,255,255,0.7) !important",
                  }}
                />
              }
              label="Edit coming soon"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
                fontSize: "0.6rem",
                fontFamily: "Inter, sans-serif",
                height: 20,
                cursor: "default",
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Info Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Personal Information"
            icon={<BadgeIcon sx={{ fontSize: 15, color: "#0891b2" }} />}
          >
            <InfoRow
              icon={
                <AccountCircleIcon sx={{ fontSize: 16, color: "#0891b2" }} />
              }
              label="Full Name"
              value={`${profile.firstName} ${profile.lastName}`}
            />
            <InfoRow
              icon={<EmailIcon sx={{ fontSize: 16, color: "#0891b2" }} />}
              label="Email Address"
              value={profile.email}
            />
            <InfoRow
              icon={<PhoneIcon sx={{ fontSize: 16, color: "#0891b2" }} />}
              label="Mobile Number"
              value={profile.mobileNumber}
            />
            <InfoRow
              icon={<HomeIcon sx={{ fontSize: 16, color: "#0891b2" }} />}
              label="Flat Number"
              value={profile.flatNumber}
            />
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Bank Details"
            icon={
              <AccountBalanceIcon sx={{ fontSize: 15, color: "#0891b2" }} />
            }
          >
            <InfoRow
              icon={
                <AccountBalanceIcon sx={{ fontSize: 16, color: "#0891b2" }} />
              }
              label="Bank Name"
              value={profile.bankName}
            />
            <InfoRow
              icon={<CreditCardIcon sx={{ fontSize: 16, color: "#0891b2" }} />}
              label="Account Number"
              value={profile.accountNumber}
            />
            <InfoRow
              icon={<CreditCardIcon sx={{ fontSize: 16, color: "#0891b2" }} />}
              label="IFSC Code"
              value={profile.ifscCode}
            />
            <Box sx={{ py: 1.5 }}>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: "#94a3b8",
                  fontFamily: "Inter, sans-serif",
                  fontStyle: "italic",
                }}
              >
                Bank details are used for society fund management and
                maintenance collection.
              </Typography>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
