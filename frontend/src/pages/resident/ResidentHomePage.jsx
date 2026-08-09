import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography, Paper, Grid, Skeleton } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CampaignIcon from "@mui/icons-material/Campaign";
import PaymentIcon from "@mui/icons-material/Payment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const C = "#7c3aed";
const CD = "#6d28d9";
const ff = "Inter, sans-serif";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getDate = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const KpiCard = ({ label, value, trend, trendColor, borderColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1, sm: 1.2 },
      borderRadius: 2,
      border: `1.5px solid ${borderColor || C}40`,
      borderLeft: `3px solid ${borderColor || C}`,
      boxShadow: `0 2px 8px ${borderColor || C}18`,
      bgcolor: `${borderColor || C}04`,
      height: "100%",
    }}
  >
    <Typography
      sx={{
        fontFamily: ff,
        fontWeight: 800,
        fontSize: { xs: "1.1rem", sm: "1.3rem" },
        color: "#0f172a",
        lineHeight: 1,
      }}
    >
      {value ?? "—"}
    </Typography>
    <Typography
      sx={{
        fontFamily: ff,
        fontSize: { xs: "0.55rem", sm: "0.6rem" },
        fontWeight: 600,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        mt: 0.4,
      }}
    >
      {label}
    </Typography>
    {trend && (
      <Typography
        sx={{
          fontFamily: ff,
          fontSize: { xs: "0.55rem", sm: "0.58rem" },
          fontWeight: 600,
          color: trendColor || C,
          mt: 0.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {trend}
      </Typography>
    )}
  </Paper>
);

const QuickCard = ({ icon, title, sub, subColor, onClick, accentColor }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: { xs: 1, sm: 1.2 },
      borderRadius: 2,
      border: "1px solid #ede9fe",
      bgcolor: "white",
      cursor: "pointer",
      transition: "all 0.18s",
      "&:hover": {
        boxShadow: "0 3px 12px rgba(124,58,237,0.1)",
        transform: "translateY(-1px)",
      },
      display: "flex",
      flexDirection: "column",
      gap: 0.7,
      height: "100%",
    }}
  >
    <Box
      sx={{
        width: { xs: 26, sm: 30 },
        height: { xs: 26, sm: 30 },
        borderRadius: 1.5,
        bgcolor: `${accentColor}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography
        sx={{
          fontFamily: ff,
          fontWeight: 700,
          fontSize: { xs: "0.68rem", sm: "0.75rem" },
          color: "#0f172a",
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: ff,
          fontSize: { xs: "0.55rem", sm: "0.6rem" },
          color: subColor || "#94a3b8",
          mt: 0.3,
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {sub}
      </Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
      <Typography
        sx={{
          fontFamily: ff,
          fontSize: "0.55rem",
          fontWeight: 700,
          color: accentColor,
        }}
      >
        Open
      </Typography>
      <ArrowForwardIcon sx={{ fontSize: 9, color: accentColor }} />
    </Box>
  </Paper>
);

const ResidentHomePage = () => {
  const navigate = useNavigate();
  const flatNumber = useSelector((state) => state.auth.flatNumber);
  const [profile, setProfile] = useState(null);
  const [bills, setBills] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const go = (path) => navigate(`/resident/dashboard/${path}`);

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
  const totalDue = pendingBills.reduce((s, b) => s + Number(b.totalAmount), 0);

  if (loading)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="rounded" height={70} sx={{ borderRadius: 2.5 }} />
        <Grid container spacing={1}>
          {[...Array(4)].map((_, i) => (
            <Grid key={i} size={{ xs: 6, sm: 3 }}>
              <Skeleton
                variant="rounded"
                height={70}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={1}>
          {[...Array(4)].map((_, i) => (
            <Grid key={i} size={{ xs: 6, sm: 3 }}>
              <Skeleton
                variant="rounded"
                height={85}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, sm: 1.2 } }}
    >
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: "1px solid #ede9fe",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${C} 0%, ${CD} 100%)`,
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1.2, sm: 1.6 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 800,
                fontSize: { xs: "0.82rem", sm: "0.95rem" },
                color: "white",
              }}
            >
              {getGreeting()}, {profile?.firstName}
            </Typography>
            <Typography
              sx={{
                fontFamily: ff,
                fontSize: { xs: "0.55rem", sm: "0.62rem" },
                color: "rgba(255,255,255,0.75)",
                mt: 0.2,
              }}
            >
              {getDate()} · Flat {flatNumber} · {profile?.residentType}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1.5, sm: 2.5 },
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: 1.5,
              px: { xs: 1.2, sm: 2 },
              py: { xs: 0.7, sm: 1 },
            }}
          >
            {[
              { num: bills.length, lbl: "Bills" },
              {
                num: pendingBills.length,
                lbl: "Unpaid",
                warn: pendingBills.length > 0,
              },
              { num: complaints.length, lbl: "Issues" },
            ].map((s, i) => (
              <Box key={i} sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: ff,
                    fontWeight: 800,
                    fontSize: { xs: "0.78rem", sm: "0.9rem" },
                    color: s.warn ? "#fde68a" : "white",
                  }}
                >
                  {s.num}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: ff,
                    fontSize: { xs: "0.48rem", sm: "0.55rem" },
                    color: "rgba(255,255,255,0.65)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.lbl}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Pending bill alert */}
      {pendingBills.length > 0 && (
        <Paper
          elevation={0}
          onClick={() => go("bills")}
          sx={{
            borderRadius: 2,
            border: "1px solid #fecaca",
            bgcolor: "#fef2f2",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.9, sm: 1.1 },
            cursor: "pointer",
            transition: "all 0.18s",
            "&:hover": { boxShadow: "0 3px 10px rgba(220,38,38,0.1)" },
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <ReceiptIcon
            sx={{
              color: "#dc2626",
              fontSize: { xs: 15, sm: 18 },
              flexShrink: 0,
            }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 700,
                fontSize: { xs: "0.7rem", sm: "0.78rem" },
                color: "#dc2626",
              }}
            >
              {pendingBills.length} unpaid bill
              {pendingBills.length > 1 ? "s" : ""} — ₹
              {totalDue.toLocaleString("en-IN")} due
            </Typography>
            <Typography
              sx={{
                fontFamily: ff,
                fontSize: { xs: "0.58rem", sm: "0.62rem" },
                color: "#991b1b",
              }}
            >
              Tap to view and pay pending maintenance bills
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              bgcolor: "#dc2626",
              borderRadius: 1.2,
              px: 1,
              py: 0.4,
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontFamily: ff,
                fontSize: "0.58rem",
                fontWeight: 700,
                color: "white",
              }}
            >
              Pay Now
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 9, color: "white" }} />
          </Box>
        </Paper>
      )}

      {/* KPI row */}
      <Grid container spacing={{ xs: 0.8, sm: 1 }}>
        {[
          {
            label: "Total Bills",
            value: bills.length,
            trend: `${pendingBills.length} pending · ₹${totalDue.toLocaleString("en-IN")} due`,
            trendColor: pendingBills.length > 0 ? "#dc2626" : "#059669",
            borderColor: C,
          },
          {
            label: "Complaints",
            value: complaints.length,
            trend: `${pendingComplaints.length} pending`,
            trendColor: pendingComplaints.length > 0 ? "#d97706" : "#059669",
            borderColor: "#dc2626",
          },
          {
            label: "Permissions",
            value: permissions.length,
            trend: `${pendingPermissions.length} awaiting`,
            trendColor: "#d97706",
            borderColor: "#d97706",
          },
          {
            label: "Announcements",
            value: announcements.length,
            trend: "From secretary",
            trendColor: "#94a3b8",
            borderColor: "#059669",
          },
        ].map((k, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <KpiCard {...k} />
          </Grid>
        ))}
      </Grid>

      {/* Quick actions label */}
      <Typography
        sx={{
          fontFamily: ff,
          fontWeight: 700,
          fontSize: { xs: "0.6rem", sm: "0.65rem" },
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mt: 0.2,
        }}
      >
        Quick Actions
      </Typography>

      {/* Quick action cards */}
      <Grid container spacing={{ xs: 0.8, sm: 1 }}>
        {[
          {
            icon: (
              <PaymentIcon
                sx={{ color: "#dc2626", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Pay Bills",
            sub:
              pendingBills.length > 0
                ? `₹${totalDue.toLocaleString("en-IN")} due`
                : "All clear ✓",
            subColor: pendingBills.length > 0 ? "#dc2626" : "#059669",
            accentColor: "#dc2626",
            path: "bills",
          },
          {
            icon: (
              <ReportProblemIcon
                sx={{ color: C, fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Complaints",
            sub: `${complaints.length} raised`,
            subColor: pendingComplaints.length > 0 ? "#d97706" : "#94a3b8",
            accentColor: C,
            path: "complaints",
          },
          {
            icon: (
              <LockOpenIcon
                sx={{ color: "#059669", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Permissions",
            sub: `${permissions.length} total`,
            subColor: pendingPermissions.length > 0 ? "#d97706" : "#94a3b8",
            accentColor: "#059669",
            path: "permissions",
          },
          {
            icon: (
              <CampaignIcon
                sx={{ color: "#d97706", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Notices",
            sub: `${announcements.length} posted`,
            subColor: "#94a3b8",
            accentColor: "#d97706",
            path: "announcements",
          },
        ].map((q, i) => (
          <Grid key={i} size={{ xs: 3, sm: 3 }}>
            <QuickCard {...q} onClick={() => go(q.path)} />
          </Grid>
        ))}
      </Grid>

      {/* Recent announcements */}
      {announcements.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid #ede9fe",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.8, sm: 1 },
              bgcolor: "#faf5ff",
              borderBottom: "1px solid #ede9fe",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 700,
                fontSize: { xs: "0.65rem", sm: "0.72rem" },
                color: "#1e293b",
              }}
            >
              Recent Announcements
            </Typography>
            <Typography
              onClick={() => go("announcements")}
              sx={{
                fontFamily: ff,
                fontSize: "0.58rem",
                fontWeight: 700,
                color: C,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View all →
            </Typography>
          </Box>
          {announcements.slice(0, 3).map((a, i) => (
            <Box
              key={a.id}
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.9, sm: 1 },
                borderBottom: i < 2 ? "1px solid #f5f3ff" : "none",
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  mt: 0.5,
                  flexShrink: 0,
                  bgcolor:
                    a.type === "ALERT"
                      ? "#dc2626"
                      : a.type === "NOTIFICATION"
                        ? C
                        : "#94a3b8",
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: ff,
                    fontWeight: 600,
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    color: "#1e293b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: ff,
                    fontSize: { xs: "0.58rem", sm: "0.62rem" },
                    color: "#64748b",
                    mt: 0.2,
                  }}
                >
                  {a.message?.substring(0, 70)}
                  {a.message?.length > 70 ? "..." : ""}
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
