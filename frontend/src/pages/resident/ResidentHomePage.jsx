import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography, Paper, Grid, Skeleton, Chip } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CampaignIcon from "@mui/icons-material/Campaign";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const StatCard = ({ icon, label, value, sub, color, bgcolor, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 2,
      borderRadius: 3,
      border: "1px solid #e0f2fe",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
      "&:hover": onClick
        ? {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 20px rgba(8,145,178,0.12)",
          }
        : {},
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            fontSize: "0.65rem",
            fontWeight: 600,
            height: 20,
          }}
        />
      )}
    </Box>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: "1.6rem",
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
        fontSize: "0.72rem",
        fontWeight: 600,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        mt: 0.5,
      }}
    >
      {label}
    </Typography>
  </Paper>
);

const ResidentHomePage = () => {
  const navigate = useNavigate();
  const flatNumber = useSelector((state) => state.auth.flatNumber);
  const loginIdentifier = useSelector((state) => state.auth.loginIdentifier);

  const [profile, setProfile] = useState(null);
  const [bills, setBills] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const profileRes = await axiosInstance.get(
          `/api/resident/profile?flatNumber=${flatNumber}`,
        );
        setProfile(profileRes.data);

        const [billsRes, complaintsRes, permissionsRes, announcementsRes] =
          await Promise.all([
            axiosInstance.get(
              `/api/maintenance/bills/resident/${profileRes.data.id}`,
            ),
            axiosInstance.get(`/api/complaint/resident/${profileRes.data.id}`),
            axiosInstance.get(`/api/permission/resident/${profileRes.data.id}`),
            axiosInstance.get("/api/announcement/all"),
          ]);

        setBills(billsRes.data);
        setComplaints(complaintsRes.data);
        setPermissions(permissionsRes.data);
        setAnnouncements(announcementsRes.data);
      } catch {
        showError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    if (flatNumber) loadData();
  }, [flatNumber]);

  const pendingBills = bills.filter((b) => b.status === "PENDING");
  const pendingComplaints = complaints.filter((c) => c.status === "PENDING");
  const pendingPermissions = permissions.filter((p) => p.status === "PENDING");

  const go = (path) => navigate(`/resident/dashboard/${path}`);

  if (loading)
    return (
      <Box>
        <Skeleton
          variant="rounded"
          height={40}
          sx={{ mb: 3, width: 200, borderRadius: 2 }}
        />
        <Grid container spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Grid key={i} size={{ xs: 6, md: 3 }}>
              <Skeleton
                variant="rounded"
                height={110}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: "1.2rem",
            color: "#1e293b",
          }}
        >
          Welcome back 👋
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.78rem",
            color: "#64748b",
          }}
        >
          {profile?.firstName} {profile?.lastName} — Flat {flatNumber} —{" "}
          {profile?.residentType}
        </Typography>
      </Box>

      {/* Pending Bills Alert */}
      {pendingBills.length > 0 && (
        <Paper
          elevation={0}
          onClick={() => go("bills")}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 3,
            border: "1px solid #fecaca",
            bgcolor: "#fef2f2",
            cursor: "pointer",
            "&:hover": { boxShadow: "0 4px 12px rgba(220,38,38,0.1)" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ReceiptIcon sx={{ color: "#dc2626", fontSize: 20 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#dc2626",
                }}
              >
                {pendingBills.length} Pending Bill
                {pendingBills.length > 1 ? "s" : ""}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.72rem",
                  color: "#991b1b",
                }}
              >
                Total due: ₹
                {pendingBills
                  .reduce((s, b) => s + Number(b.totalAmount), 0)
                  .toLocaleString("en-IN")}{" "}
                — Click to pay
              </Typography>
            </Box>
            <Chip
              label="Pay Now"
              size="small"
              sx={{
                bgcolor: "#dc2626",
                color: "white",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<ReceiptIcon sx={{ color: "#0891b2", fontSize: 20 }} />}
            label="Total Bills"
            value={bills.length}
            sub={`${pendingBills.length} pending`}
            color="#0891b2"
            bgcolor="#e0f2fe"
            onClick={() => go("bills")}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<ReportProblemIcon sx={{ color: "#dc2626", fontSize: 20 }} />}
            label="Complaints"
            value={complaints.length}
            sub={`${pendingComplaints.length} pending`}
            color="#dc2626"
            bgcolor="#fee2e2"
            onClick={() => go("complaints")}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<LockOpenIcon sx={{ color: "#7c3aed", fontSize: 20 }} />}
            label="Permissions"
            value={permissions.length}
            sub={`${pendingPermissions.length} pending`}
            color="#7c3aed"
            bgcolor="#f3e8ff"
            onClick={() => go("permissions")}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<CampaignIcon sx={{ color: "#d97706", fontSize: 20 }} />}
            label="Announcements"
            value={announcements.length}
            color="#d97706"
            bgcolor="#fef3c7"
            onClick={() => go("announcements")}
          />
        </Grid>
      </Grid>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e0f2fe",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: "#f8fbff",
              borderBottom: "1px solid #e0f2fe",
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
              Recent Announcements
            </Typography>
          </Box>
          {announcements.slice(0, 3).map((a) => (
            <Box
              key={a.id}
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  mt: 0.7,
                  flexShrink: 0,
                  bgcolor:
                    a.type === "ALERT"
                      ? "#dc2626"
                      : a.type === "NOTIFICATION"
                        ? "#0891b2"
                        : "#94a3b8",
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  {a.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.72rem",
                    color: "#64748b",
                    mt: 0.2,
                  }}
                >
                  {a.message?.substring(0, 80)}
                  {a.message?.length > 80 ? "..." : ""}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default ResidentHomePage;
