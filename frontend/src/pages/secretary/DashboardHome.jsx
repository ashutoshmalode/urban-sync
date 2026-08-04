import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Skeleton, Grid,
  Chip,
} from "@mui/material";
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
  <Paper elevation={0} onClick={onClick}
    sx={{
      p: 2, borderRadius: 3, border: "1px solid #e0f2fe",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
      "&:hover": onClick ? { boxShadow: "0 4px 20px rgba(8,145,178,0.15)", transform: "translateY(-2px)" } : {},
    }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </Box>
      {sub && (
        <Chip label={sub} size="small" sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontFamily: "Inter, sans-serif", fontSize: "0.65rem", fontWeight: 600, height: 20 }} />
      )}
    </Box>
    <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>
      {value ?? "—"}
    </Typography>
    <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.5 }}>
      {label}
    </Typography>
  </Paper>
);

const SectionTitle = ({ title, subtitle }) => (
  <Box sx={{ mb: 1.5, mt: 2 }}>
    <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "#94a3b8" }}>
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

  if (loading) return (
    <Box>
      <Skeleton variant="rounded" height={40} sx={{ mb: 3, borderRadius: 2, width: 200 }} />
      <Grid container spacing={2}>
        {[...Array(12)].map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
            <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#1e293b" }}>
          Society Overview
        </Typography>
        <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "#94a3b8" }}>
          Live stats across all modules — click any card to navigate
        </Typography>
      </Box>

      {/* Residents + Flats */}
      <SectionTitle title="Residents & Flats" subtitle="Current occupancy status" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<PeopleIcon sx={{ color: "#0891b2", fontSize: 20 }} />}
            label="Total Residents" value={stats?.totalResidents}
            sub={`${stats?.totalOwners} owners`}
            color="#0891b2" bgcolor="#e0f2fe"
            onClick={() => go("registrations")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<PeopleIcon sx={{ color: "#7c3aed", fontSize: 20 }} />}
            label="Owners" value={stats?.totalOwners}
            color="#7c3aed" bgcolor="#f3e8ff"
            onClick={() => go("registrations")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<PeopleIcon sx={{ color: "#059669", fontSize: 20 }} />}
            label="Tenants" value={stats?.totalTenants}
            color="#059669" bgcolor="#dcfce7"
            onClick={() => go("registrations")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<ApartmentIcon sx={{ color: "#d97706", fontSize: 20 }} />}
            label="Total Flats" value={stats?.totalFlats}
            sub={`${stats?.vacantFlats} vacant`}
            color="#d97706" bgcolor="#fef3c7"
            onClick={() => go("property")}
          />
        </Grid>
      </Grid>

      {/* Finance */}
      <SectionTitle title="Finance & Maintenance" subtitle="Collection and billing overview" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<AccountBalanceWalletIcon sx={{ color: "#0891b2", fontSize: 20 }} />}
            label="Society Fund" value={`₹${Number(stats?.societyFundBalance || 0).toLocaleString("en-IN")}`}
            color="#0891b2" bgcolor="#e0f2fe"
            onClick={() => go("payments")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<ReceiptIcon sx={{ color: "#059669", fontSize: 20 }} />}
            label="Amount Collected" value={`₹${Number(stats?.totalAmountCollected || 0).toLocaleString("en-IN")}`}
            color="#059669" bgcolor="#dcfce7"
            onClick={() => go("payments")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<ReceiptIcon sx={{ color: "#dc2626", fontSize: 20 }} />}
            label="Pending Bills" value={stats?.pendingBills}
            sub={`₹${Number(stats?.totalAmountPending || 0).toLocaleString("en-IN")} due`}
            color="#dc2626" bgcolor="#fee2e2"
            onClick={() => go("maintenance")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<ReceiptIcon sx={{ color: "#7c3aed", fontSize: 20 }} />}
            label="Paid Bills" value={stats?.paidBills}
            color="#7c3aed" bgcolor="#f3e8ff"
            onClick={() => go("maintenance")}
          />
        </Grid>
      </Grid>

      {/* Complaints + Issues */}
      <SectionTitle title="Complaints & Issues" subtitle="Resident complaints and caretaker tasks" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<ReportProblemIcon sx={{ color: "#dc2626", fontSize: 20 }} />}
            label="Total Complaints" value={stats?.totalComplaints}
            sub={`${stats?.pendingComplaints} pending`}
            color="#dc2626" bgcolor="#fee2e2"
            onClick={() => go("complaints")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<ReportProblemIcon sx={{ color: "#d97706", fontSize: 20 }} />}
            label="Pending Complaints" value={stats?.pendingComplaints}
            color="#d97706" bgcolor="#fef3c7"
            onClick={() => go("complaints")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<EngineeringIcon sx={{ color: "#0891b2", fontSize: 20 }} />}
            label="Caretaker Issues" value={stats?.totalIssues}
            sub={`${stats?.pendingIssues} pending`}
            color="#0891b2" bgcolor="#e0f2fe"
            onClick={() => go("complaints")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<EngineeringIcon sx={{ color: "#059669", fontSize: 20 }} />}
            label="Active Caretakers" value={stats?.activeCaretakers}
            color="#059669" bgcolor="#dcfce7"
            onClick={() => go("caretakers")}
          />
        </Grid>
      </Grid>

      {/* Registrations + Permissions + Announcements */}
      <SectionTitle title="Requests & Communication" subtitle="Pending actions and announcements" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<HowToRegIcon sx={{ color: "#0891b2", fontSize: 20 }} />}
            label="Registrations" value={stats?.totalRegistrations}
            sub={`${stats?.pendingRegistrations} pending`}
            color="#0891b2" bgcolor="#e0f2fe"
            onClick={() => go("registrations")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<LockOpenIcon sx={{ color: "#7c3aed", fontSize: 20 }} />}
            label="Permissions" value={stats?.totalPermissions}
            sub={`${stats?.pendingPermissions} pending`}
            color="#7c3aed" bgcolor="#f3e8ff"
            onClick={() => go("permissions")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<CampaignIcon sx={{ color: "#d97706", fontSize: 20 }} />}
            label="Announcements" value={stats?.totalAnnouncements}
            sub={`${stats?.alertAnnouncements} alerts`}
            color="#d97706" bgcolor="#fef3c7"
            onClick={() => go("announcements")}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <StatCard
            icon={<HomeWorkIcon sx={{ color: "#059669", fontSize: 20 }} />}
            label="Active Listings" value={stats?.activeListings}
            sub={`of ${stats?.totalListings} total`}
            color="#059669" bgcolor="#dcfce7"
            onClick={() => go("property")}
          />
        </Grid>
      </Grid>

    </Box>
  );
};

export default DashboardHome;