import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Grid, Skeleton } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CampaignIcon from "@mui/icons-material/Campaign";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const C = "#0891b2";
const CD = "#0e7490";

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

const ff = "Inter, sans-serif";

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
      border: "1px solid #e0f2fe",
      bgcolor: "white",
      cursor: "pointer",
      transition: "all 0.18s",
      "&:hover": {
        boxShadow: "0 3px 12px rgba(8,145,178,0.1)",
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

const BarRow = ({ label, pct, color }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.8,
      py: 0.6,
      borderBottom: "1px solid #f8fafc",
    }}
  >
    <Typography
      sx={{
        fontFamily: ff,
        fontSize: { xs: "0.58rem", sm: "0.62rem" },
        color: "#475569",
        width: { xs: 38, sm: 46 },
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1, bgcolor: "#f1f5f9", borderRadius: 2, height: 5 }}>
      <Box
        sx={{
          width: `${pct}%`,
          bgcolor: pct >= 80 ? color : "#bae6fd",
          height: 5,
          borderRadius: 2,
        }}
      />
    </Box>
    <Typography
      sx={{
        fontFamily: ff,
        fontSize: { xs: "0.55rem", sm: "0.6rem" },
        fontWeight: 700,
        color: "#64748b",
        width: 24,
        textAlign: "right",
        flexShrink: 0,
      }}
    >
      {pct}%
    </Typography>
  </Box>
);

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const go = (path) => navigate(`/secretary/dashboard/${path}`);

  useEffect(() => {
    axiosInstance
      .get("/api/dashboard/secretary")
      .then((res) => setStats(res.data))
      .catch(() => showError("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

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
          {[...Array(8)].map((_, i) => (
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

  const collectionPct = stats?.totalBills
    ? Math.round((stats.paidBills / stats.totalBills) * 100)
    : 0;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, sm: 1.2 } }}
    >
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: "1px solid #e0f2fe",
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
              {getGreeting()},{" "}
              {stats?.secretaryName?.split(" ")[0] || "Secretary"}
            </Typography>
            <Typography
              sx={{
                fontFamily: ff,
                fontSize: { xs: "0.55rem", sm: "0.62rem" },
                color: "rgba(255,255,255,0.75)",
                mt: 0.2,
              }}
            >
              {getDate()} · Sunrise Heights Society
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
              { num: stats?.totalResidents ?? "—", lbl: "Residents" },
              {
                num: stats?.pendingRegistrations ?? "—",
                lbl: "Pending",
                warn: true,
              },
              {
                num: `₹${Number(stats?.totalAmountCollected || 0).toLocaleString("en-IN")}`,
                lbl: "Collected",
              },
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

      {/* KPI row */}
      <Grid container spacing={{ xs: 0.8, sm: 1 }}>
        {[
          {
            label: "Total Residents",
            value: stats?.totalResidents,
            trend: `${stats?.totalOwners ?? 0} owners · ${stats?.totalTenants ?? 0} tenants`,
            borderColor: C,
          },
          {
            label: "Society Fund",
            value: `₹${Number(stats?.societyFundBalance || 0).toLocaleString("en-IN")}`,
            trend: `₹${Number(stats?.totalAmountCollected || 0).toLocaleString("en-IN")} collected`,
            trendColor: "#059669",
            borderColor: "#059669",
          },
          {
            label: "Pending Bills",
            value: stats?.pendingBills,
            trend: `₹${Number(stats?.totalAmountPending || 0).toLocaleString("en-IN")} due`,
            trendColor: "#dc2626",
            borderColor: "#dc2626",
          },
          {
            label: "Open Complaints",
            value: stats?.pendingComplaints,
            trend: `${stats?.totalComplaints ?? 0} total raised`,
            trendColor: "#d97706",
            borderColor: "#d97706",
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
              <HowToRegIcon sx={{ color: C, fontSize: { xs: 13, sm: 15 } }} />
            ),
            title: "Registrations",
            sub: `${stats?.pendingRegistrations ?? 0} pending`,
            subColor: stats?.pendingRegistrations > 0 ? "#d97706" : "#94a3b8",
            accentColor: C,
            path: "registrations",
          },
          {
            icon: (
              <ReceiptIcon
                sx={{ color: "#dc2626", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Maintenance",
            sub: `${stats?.pendingBills ?? 0} unpaid`,
            subColor: stats?.pendingBills > 0 ? "#dc2626" : "#94a3b8",
            accentColor: "#dc2626",
            path: "maintenance",
          },
          {
            icon: (
              <ReportProblemIcon
                sx={{ color: "#d97706", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Complaints",
            sub: `${stats?.pendingComplaints ?? 0} open`,
            subColor: stats?.pendingComplaints > 0 ? "#d97706" : "#94a3b8",
            accentColor: "#d97706",
            path: "complaints",
          },
          {
            icon: (
              <LockOpenIcon
                sx={{ color: "#7c3aed", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Permissions",
            sub: `${stats?.pendingPermissions ?? 0} pending`,
            subColor: stats?.pendingPermissions > 0 ? "#7c3aed" : "#94a3b8",
            accentColor: "#7c3aed",
            path: "permissions",
          },
          {
            icon: (
              <CampaignIcon
                sx={{ color: "#059669", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Announcements",
            sub: `${stats?.totalAnnouncements ?? 0} posted`,
            subColor: "#94a3b8",
            accentColor: "#059669",
            path: "announcements",
          },
          {
            icon: (
              <EngineeringIcon
                sx={{ color: C, fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Caretakers",
            sub: `${stats?.activeCaretakers ?? 0} active`,
            subColor: "#94a3b8",
            accentColor: C,
            path: "caretakers",
          },
          {
            icon: (
              <AccountBalanceWalletIcon
                sx={{ color: "#059669", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Payments",
            sub: `₹${Number(stats?.societyFundBalance || 0).toLocaleString("en-IN")}`,
            subColor: "#059669",
            accentColor: "#059669",
            path: "payments",
          },
          {
            icon: (
              <ApartmentIcon
                sx={{ color: "#d97706", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Property",
            sub: `${stats?.activeListings ?? 0} listings`,
            subColor: "#94a3b8",
            accentColor: "#d97706",
            path: "property",
          },
        ].map((q, i) => (
          <Grid key={i} size={{ xs: 3, sm: 3 }}>
            <QuickCard {...q} onClick={() => go(q.path)} />
          </Grid>
        ))}
      </Grid>

      {/* Bottom panels */}
      <Grid container spacing={{ xs: 0.8, sm: 1 }}>
        {/* Wing collection */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid #e0f2fe",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.8, sm: 1 },
                bgcolor: "#f8fbff",
                borderBottom: "1px solid #e0f2fe",
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
                Maintenance Collection
              </Typography>
              <Typography
                sx={{
                  fontFamily: ff,
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  color: collectionPct >= 80 ? "#059669" : "#d97706",
                  bgcolor: collectionPct >= 80 ? "#dcfce7" : "#fef9c3",
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                }}
              >
                {collectionPct}% collected
              </Typography>
            </Box>
            <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 0.5 }}>
              {["Wing A", "Wing B", "Wing C", "Wing D", "Wing E"].map(
                (w, i) => (
                  <BarRow
                    key={w}
                    label={w}
                    pct={[92, 78, 85, 60, 70][i]}
                    color={C}
                  />
                ),
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right side panels */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Caretaker issues */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #e0f2fe",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.8, sm: 1 },
                  bgcolor: "#f8fbff",
                  borderBottom: "1px solid #e0f2fe",
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
                  Caretaker Issues
                </Typography>
                <Typography
                  onClick={() => go("complaints")}
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
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: 0.8,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 0.8,
                }}
              >
                {[
                  {
                    lbl: "Total",
                    val: stats?.totalIssues ?? 0,
                    color: C,
                    bg: "#e0f2fe",
                  },
                  {
                    lbl: "Pending",
                    val: stats?.pendingIssues ?? 0,
                    color: "#d97706",
                    bg: "#fef9c3",
                  },
                  {
                    lbl: "Staff",
                    val: stats?.activeCaretakers ?? 0,
                    color: "#059669",
                    bg: "#dcfce7",
                  },
                ].map((s) => (
                  <Box
                    key={s.lbl}
                    sx={{
                      bgcolor: s.bg,
                      borderRadius: 1.5,
                      p: { xs: 0.8, sm: 1 },
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: ff,
                        fontWeight: 800,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        color: s.color,
                      }}
                    >
                      {s.val}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: ff,
                        fontSize: { xs: "0.5rem", sm: "0.55rem" },
                        fontWeight: 600,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        mt: 0.2,
                      }}
                    >
                      {s.lbl}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Resident breakdown */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #e0f2fe",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.8, sm: 1 },
                  bgcolor: "#f8fbff",
                  borderBottom: "1px solid #e0f2fe",
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
                  Resident Breakdown
                </Typography>
              </Box>
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: 0.8,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0.8,
                }}
              >
                {[
                  {
                    lbl: "Total",
                    val: stats?.totalResidents ?? 0,
                    color: C,
                    bg: "#e0f2fe",
                  },
                  {
                    lbl: "Owners",
                    val: stats?.totalOwners ?? 0,
                    color: "#7c3aed",
                    bg: "#f3e8ff",
                  },
                  {
                    lbl: "Tenants",
                    val: stats?.totalTenants ?? 0,
                    color: "#059669",
                    bg: "#dcfce7",
                  },
                  {
                    lbl: "Vacant",
                    val: stats?.vacantFlats ?? 0,
                    color: "#d97706",
                    bg: "#fef9c3",
                  },
                ].map((s) => (
                  <Box
                    key={s.lbl}
                    sx={{
                      bgcolor: s.bg,
                      borderRadius: 1.5,
                      p: { xs: 0.8, sm: 1 },
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: ff,
                        fontWeight: 800,
                        fontSize: { xs: "0.88rem", sm: "1rem" },
                        color: s.color,
                      }}
                    >
                      {s.val}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: ff,
                        fontSize: { xs: "0.52rem", sm: "0.58rem" },
                        fontWeight: 600,
                        color: "#64748b",
                        lineHeight: 1.2,
                      }}
                    >
                      {s.lbl}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
