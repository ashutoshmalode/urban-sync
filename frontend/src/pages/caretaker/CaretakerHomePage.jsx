import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography, Paper, Grid, Skeleton, Chip } from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const CaretakerHomePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <Box>
        <Skeleton
          variant="rounded"
          height={36}
          sx={{ mb: 2, width: { xs: 160, sm: 200 }, borderRadius: 2 }}
        />
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 4, sm: 4 }}>
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
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: { xs: "1rem", sm: "1.15rem", md: "1.2rem" },
            color: "#1e293b",
          }}
        >
          Welcome, {profile?.firstName}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: { xs: "0.65rem", sm: "0.78rem" },
            color: "#64748b",
          }}
        >
          Serial #{profile?.serialNumber} - {issues.length} total issues
          assigned
        </Typography>
      </Box>

      {/* Pending Alert */}
      {pending.length > 0 && (
        <Paper
          elevation={0}
          onClick={() => navigate("/caretaker/dashboard/issues")}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: { xs: 1.5, sm: 2.5 },
            borderRadius: 3,
            border: "1px solid #fecaca",
            bgcolor: "#fef2f2",
            cursor: "pointer",
            "&:hover": { boxShadow: "0 4px 12px rgba(220,38,38,0.1)" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <HourglassEmptyIcon
              sx={{
                color: "#dc2626",
                fontSize: { xs: 16, sm: 20 },
                flexShrink: 0,
              }}
            />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "0.78rem", sm: "0.85rem" },
                  color: "#dc2626",
                }}
              >
                {pending.length} Pending Issue{pending.length > 1 ? "s" : ""}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.65rem", sm: "0.72rem" },
                  color: "#991b1b",
                }}
              >
                Tap to view and update status
              </Typography>
            </Box>
            <Chip
              label="View"
              size="small"
              sx={{
                bgcolor: "#dc2626",
                color: "white",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.6rem", sm: "0.68rem" },
                height: { xs: 20, sm: 24 },
                flexShrink: 0,
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Stats - 3 columns on all screens */}
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {[
          {
            label: "Total",
            value: issues.length,
            color: "#059669",
            bgcolor: "#dcfce7",
            icon: (
              <EngineeringIcon
                sx={{ color: "#059669", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
          },
          {
            label: "Pending",
            value: pending.length,
            color: "#dc2626",
            bgcolor: "#fee2e2",
            icon: (
              <HourglassEmptyIcon
                sx={{ color: "#dc2626", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
          },
          {
            label: "Resolved",
            value: resolved.length,
            color: "#0891b2",
            bgcolor: "#e0f2fe",
            icon: (
              <CheckCircleIcon
                sx={{ color: "#0891b2", fontSize: { xs: 16, sm: 20 } }}
              />
            ),
          },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 4, sm: 4 }}>
            <Paper
              elevation={0}
              onClick={() => navigate("/caretaker/dashboard/issues")}
              sx={{
                p: { xs: 1.2, sm: 2 },
                borderRadius: 3,
                border: "1px solid #e0f2fe",
                boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
                cursor: "pointer",
                transition: "all 0.2s",
                height: "100%",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(5,150,105,0.12)",
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 30, sm: 40 },
                  height: { xs: 30, sm: 40 },
                  borderRadius: 2,
                  bgcolor: s.bgcolor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: { xs: 0.8, sm: 1.5 },
                }}
              >
                {s.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "1.1rem", sm: "1.4rem", md: "1.6rem" },
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.58rem", sm: "0.68rem", md: "0.72rem" },
                  fontWeight: 600,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  mt: 0.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Issues */}
      {issues.length > 0 && (
        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "0.78rem", sm: "0.85rem" },
              color: "#1e293b",
              mb: 1.2,
            }}
          >
            Recent Issues
          </Typography>
          {issues.slice(0, 3).map((issue) => (
            <Paper
              key={issue.id}
              elevation={0}
              onClick={() => navigate("/caretaker/dashboard/issues")}
              sx={{
                p: { xs: 1.2, sm: 2 },
                mb: { xs: 0.8, sm: 1 },
                borderRadius: 2,
                border: "1px solid #e0f2fe",
                cursor: "pointer",
                "&:hover": { bgcolor: "#f0fdf4" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.78rem", sm: "0.85rem" },
                    fontWeight: 600,
                    color: "#1e293b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flexGrow: 1,
                  }}
                >
                  {issue.title}
                </Typography>
                <Chip
                  label={issue.status}
                  size="small"
                  sx={{
                    bgcolor:
                      issue.status === "RESOLVED"
                        ? "#dcfce7"
                        : issue.status === "PROCESSING"
                          ? "#e0f2fe"
                          : "#fef9c3",
                    color:
                      issue.status === "RESOLVED"
                        ? "#166534"
                        : issue.status === "PROCESSING"
                          ? "#0891b2"
                          : "#854d0e",
                    fontWeight: 700,
                    fontSize: "0.6rem",
                    fontFamily: "Inter, sans-serif",
                    height: 18,
                    flexShrink: 0,
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.62rem", sm: "0.72rem" },
                  color: "#64748b",
                  mt: 0.3,
                }}
              >
                {issue.createdAt
                  ? new Date(issue.createdAt).toLocaleDateString("en-IN")
                  : "-"}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CaretakerHomePage;
