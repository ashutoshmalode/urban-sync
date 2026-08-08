import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Skeleton, Grid, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EngineeringIcon from "@mui/icons-material/Engineering";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CampaignIcon from "@mui/icons-material/Campaign";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const StatCard = ({ icon, label, value, sub, color, bgcolor, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: { xs: 1.2, sm: 1.8, md: 2 },
      borderRadius: 3,
      border: "1px solid #e0f2fe",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
      height: "100%",
      "&:hover": onClick
        ? {
            boxShadow: "0 4px 20px rgba(8,145,178,0.15)",
            transform: "translateY(-2px)",
          }
        : {},
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        mb: { xs: 1, sm: 1.5 },
      }}
    >
      <Box
        sx={{
          width: { xs: 32, sm: 38, md: 40 },
          height: { xs: 32, sm: 38, md: 40 },
          borderRadius: 2,
          bgcolor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      {sub && (
        <Chip
          label={sub}
          size="small"
          sx={{
            bgcolor: "#f1f5f9",
            color: "#64748b",
            fontFamily: "Inter, sans-serif",
            fontSize: { xs: "0.55rem", sm: "0.62rem" },
            fontWeight: 600,
            height: 18,
            maxWidth: { xs: 80, sm: 120 },
            "& .MuiChip-label": {
              px: 0.8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          }}
        />
      )}
    </Box>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "1.1rem", sm: "1.4rem", md: "1.6rem" },
        fontWeight: 800,
        color,
        lineHeight: 1,
      }}
    >
      {value ?? "—"}
    </Typography>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "0.6rem", sm: "0.68rem", md: "0.72rem" },
        fontWeight: 600,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        mt: 0.5,
        lineHeight: 1.3,
      }}
    >
      {label}
    </Typography>
  </Paper>
);

const SectionTitle = ({ title, subtitle }) => (
  <Box sx={{ mb: 1.5, mt: { xs: 1.5, sm: 2 } }}>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: { xs: "0.78rem", sm: "0.85rem" },
        color: "#1e293b",
      }}
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: { xs: "0.65rem", sm: "0.72rem" },
          color: "#94a3b8",
        }}
      >
        {subtitle}
      </Typography>
    )}
  </Box>
);

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/api/dashboard/secretary");
        setStats(res.data);
      } catch {
        showError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const go = (path) => navigate(`/secretary/dashboard/${path}`);

  if (loading)
    return (
      <Box>
        <Skeleton
          variant="rounded"
          height={40}
          sx={{ mb: 2, borderRadius: 2, width: { xs: 160, sm: 200 } }}
        />
        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          {[...Array(12)].map((_, i) => (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
              <Skeleton
                variant="rounded"
                height={{ xs: 90, sm: 110 }}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: { xs: "1rem", sm: "1.15rem", md: "1.3rem" },
            color: "#1e293b",
          }}
        >
          Society Overview
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: { xs: "0.68rem", sm: "0.78rem" },
            color: "#94a3b8",
          }}
        >
          Live stats — tap any card to navigate
        </Typography>
      </Box>

      {/* Residents + Flats */}
      <SectionTitle
        title="Residents & Flats"
        subtitle="Current occupancy status"
      />
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: 0.5 }}>
        {[
          {
            icon: (
              <PeopleIcon
                sx={{ color: "#0891b2", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Total Residents",
            value: stats?.totalResidents,
            sub: `${stats?.totalOwners} owners`,
            color: "#0891b2",
            bgcolor: "#e0f2fe",
            path: "registrations",
          },
          {
            icon: (
              <PeopleIcon
                sx={{ color: "#7c3aed", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Owners",
            value: stats?.totalOwners,
            color: "#7c3aed",
            bgcolor: "#f3e8ff",
            path: "registrations",
          },
          {
            icon: (
              <PeopleIcon
                sx={{ color: "#059669", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Tenants",
            value: stats?.totalTenants,
            color: "#059669",
            bgcolor: "#dcfce7",
            path: "registrations",
          },
          {
            icon: (
              <ApartmentIcon
                sx={{ color: "#d97706", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Total Flats",
            value: stats?.totalFlats,
            sub: `${stats?.vacantFlats} vacant`,
            color: "#d97706",
            bgcolor: "#fef3c7",
            path: "property",
          },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
            <StatCard {...card} onClick={() => go(card.path)} />
          </Grid>
        ))}
      </Grid>

      {/* Finance */}
      <SectionTitle
        title="Finance & Maintenance"
        subtitle="Collection and billing overview"
      />
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: 0.5 }}>
        {[
          {
            icon: (
              <AccountBalanceWalletIcon
                sx={{ color: "#0891b2", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Society Fund",
            value: `₹${Number(stats?.societyFundBalance || 0).toLocaleString("en-IN")}`,
            color: "#0891b2",
            bgcolor: "#e0f2fe",
            path: "payments",
          },
          {
            icon: (
              <ReceiptIcon
                sx={{ color: "#059669", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Collected",
            value: `₹${Number(stats?.totalAmountCollected || 0).toLocaleString("en-IN")}`,
            color: "#059669",
            bgcolor: "#dcfce7",
            path: "payments",
          },
          {
            icon: (
              <ReceiptIcon
                sx={{ color: "#dc2626", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Pending Bills",
            value: stats?.pendingBills,
            sub: `₹${Number(stats?.totalAmountPending || 0).toLocaleString("en-IN")} due`,
            color: "#dc2626",
            bgcolor: "#fee2e2",
            path: "maintenance",
          },
          {
            icon: (
              <ReceiptIcon
                sx={{ color: "#7c3aed", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Paid Bills",
            value: stats?.paidBills,
            color: "#7c3aed",
            bgcolor: "#f3e8ff",
            path: "maintenance",
          },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
            <StatCard {...card} onClick={() => go(card.path)} />
          </Grid>
        ))}
      </Grid>

      {/* Complaints + Issues */}
      <SectionTitle
        title="Complaints & Issues"
        subtitle="Resident complaints and caretaker tasks"
      />
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: 0.5 }}>
        {[
          {
            icon: (
              <ReportProblemIcon
                sx={{ color: "#dc2626", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Total Complaints",
            value: stats?.totalComplaints,
            sub: `${stats?.pendingComplaints} pending`,
            color: "#dc2626",
            bgcolor: "#fee2e2",
            path: "complaints",
          },
          {
            icon: (
              <ReportProblemIcon
                sx={{ color: "#d97706", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Pending",
            value: stats?.pendingComplaints,
            color: "#d97706",
            bgcolor: "#fef3c7",
            path: "complaints",
          },
          {
            icon: (
              <EngineeringIcon
                sx={{ color: "#0891b2", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Caretaker Issues",
            value: stats?.totalIssues,
            sub: `${stats?.pendingIssues} pending`,
            color: "#0891b2",
            bgcolor: "#e0f2fe",
            path: "complaints",
          },
          {
            icon: (
              <EngineeringIcon
                sx={{ color: "#059669", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Caretakers",
            value: stats?.activeCaretakers,
            color: "#059669",
            bgcolor: "#dcfce7",
            path: "caretakers",
          },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
            <StatCard {...card} onClick={() => go(card.path)} />
          </Grid>
        ))}
      </Grid>

      {/* Requests + Communication */}
      <SectionTitle
        title="Requests & Communication"
        subtitle="Pending actions and announcements"
      />
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: 1 }}>
        {[
          {
            icon: (
              <HowToRegIcon
                sx={{ color: "#0891b2", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Registrations",
            value: stats?.totalRegistrations,
            sub: `${stats?.pendingRegistrations} pending`,
            color: "#0891b2",
            bgcolor: "#e0f2fe",
            path: "registrations",
          },
          {
            icon: (
              <LockOpenIcon
                sx={{ color: "#7c3aed", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Permissions",
            value: stats?.totalPermissions,
            sub: `${stats?.pendingPermissions} pending`,
            color: "#7c3aed",
            bgcolor: "#f3e8ff",
            path: "permissions",
          },
          {
            icon: (
              <CampaignIcon
                sx={{ color: "#d97706", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Announcements",
            value: stats?.totalAnnouncements,
            sub: `${stats?.alertAnnouncements} alerts`,
            color: "#d97706",
            bgcolor: "#fef3c7",
            path: "announcements",
          },
          {
            icon: (
              <HomeWorkIcon
                sx={{ color: "#059669", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
            label: "Active Listings",
            value: stats?.activeListings,
            sub: `of ${stats?.totalListings} total`,
            color: "#059669",
            bgcolor: "#dcfce7",
            path: "property",
          },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
            <StatCard {...card} onClick={() => go(card.path)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardHome;
