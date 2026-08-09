import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Grid, Skeleton } from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CampaignIcon from "@mui/icons-material/Campaign";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const C = "#059669";
const CD = "#047857";
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
      border: "1px solid #bbf7d0",
      bgcolor: "white",
      cursor: "pointer",
      transition: "all 0.18s",
      "&:hover": {
        boxShadow: "0 3px 12px rgba(5,150,105,0.1)",
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

const CaretakerHomePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const go = (path) => navigate(`/caretaker/dashboard/${path}`);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const profileRes = await axiosInstance.get("/api/caretaker/profile/me");
        setProfile(profileRes.data);
        const issuesRes = await axiosInstance.get(
          `/api/caretaker-issue/caretaker/${profileRes.data.id}`,
        );
        setIssues(issuesRes.data);
      } catch {
        showError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pending = issues.filter((i) => i.status === "PENDING");
  const processing = issues.filter((i) => i.status === "PROCESSING");
  const resolved = issues.filter((i) => i.status === "RESOLVED");

  if (loading)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="rounded" height={70} sx={{ borderRadius: 2.5 }} />
        <Grid container spacing={1}>
          {[...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 4 }}>
              <Skeleton
                variant="rounded"
                height={70}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={1}>
          {[...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 4 }}>
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
          border: "1px solid #bbf7d0",
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
              {getDate()} · Staff #{profile?.serialNumber}
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
              { num: issues.length, lbl: "Total" },
              { num: pending.length, lbl: "Pending", warn: pending.length > 0 },
              { num: resolved.length, lbl: "Resolved" },
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

      {/* Pending alert */}
      {pending.length > 0 && (
        <Paper
          elevation={0}
          onClick={() => go("issues")}
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
          <HourglassEmptyIcon
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
              {pending.length} pending issue{pending.length > 1 ? "s" : ""} need
              attention
            </Typography>
            <Typography
              sx={{
                fontFamily: ff,
                fontSize: { xs: "0.58rem", sm: "0.62rem" },
                color: "#991b1b",
              }}
            >
              Tap to view and update status
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
              View
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 9, color: "white" }} />
          </Box>
        </Paper>
      )}

      {/* KPI row */}
      <Grid container spacing={{ xs: 0.8, sm: 1 }}>
        {[
          {
            label: "Total Issues",
            value: issues.length,
            trend: "All assigned to you",
            borderColor: C,
          },
          {
            label: "Pending",
            value: pending.length,
            trend: pending.length > 0 ? "Needs action" : "All clear ✓",
            trendColor: pending.length > 0 ? "#dc2626" : "#059669",
            borderColor: "#dc2626",
          },
          {
            label: "In Progress",
            value: processing.length,
            trend: "Currently working",
            trendColor: "#d97706",
            borderColor: "#d97706",
          },
        ].map((k, i) => (
          <Grid key={i} size={{ xs: 4 }}>
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
              <EngineeringIcon
                sx={{ color: C, fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "My Issues",
            sub: `${pending.length} pending · ${processing.length} active`,
            subColor: pending.length > 0 ? "#d97706" : "#94a3b8",
            accentColor: C,
            path: "issues",
          },
          {
            icon: (
              <CheckCircleIcon
                sx={{ color: "#0891b2", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Resolved",
            sub: `${resolved.length} completed`,
            subColor: "#94a3b8",
            accentColor: "#0891b2",
            path: "issues",
          },
          {
            icon: (
              <CampaignIcon
                sx={{ color: "#d97706", fontSize: { xs: 13, sm: 15 } }}
              />
            ),
            title: "Notices",
            sub: "Society updates",
            subColor: "#94a3b8",
            accentColor: "#d97706",
            path: "announcements",
          },
        ].map((q, i) => (
          <Grid key={i} size={{ xs: 4 }}>
            <QuickCard {...q} onClick={() => go(q.path)} />
          </Grid>
        ))}
      </Grid>

      {/* Recent issues list */}
      {issues.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid #bbf7d0",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.8, sm: 1 },
              bgcolor: "#f0fdf4",
              borderBottom: "1px solid #bbf7d0",
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
              Recent Issues
            </Typography>
            <Typography
              onClick={() => go("issues")}
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
          {issues.slice(0, 4).map((issue, i) => (
            <Box
              key={issue.id}
              onClick={() => go("issues")}
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.8, sm: 1 },
                borderBottom:
                  i < Math.min(3, issues.length - 1)
                    ? "1px solid #f0fdf4"
                    : "none",
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
                "&:hover": { bgcolor: "#f0fdf4" },
                transition: "all 0.15s",
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  flexShrink: 0,
                  bgcolor:
                    issue.status === "RESOLVED"
                      ? "#059669"
                      : issue.status === "PROCESSING"
                        ? "#0891b2"
                        : "#d97706",
                }}
              />
              <Typography
                sx={{
                  fontFamily: ff,
                  fontWeight: 600,
                  fontSize: { xs: "0.68rem", sm: "0.75rem" },
                  color: "#1e293b",
                  flexGrow: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {issue.title}
              </Typography>
              <Box
                sx={{
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  flexShrink: 0,
                  bgcolor:
                    issue.status === "RESOLVED"
                      ? "#dcfce7"
                      : issue.status === "PROCESSING"
                        ? "#e0f2fe"
                        : "#fef9c3",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: ff,
                    fontSize: { xs: "0.5rem", sm: "0.55rem" },
                    fontWeight: 700,
                    color:
                      issue.status === "RESOLVED"
                        ? "#166534"
                        : issue.status === "PROCESSING"
                          ? "#0891b2"
                          : "#854d0e",
                  }}
                >
                  {issue.status}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default CaretakerHomePage;
