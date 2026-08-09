import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Tabs,
  Tab,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InfoIcon from "@mui/icons-material/Info";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const TypeChip = ({ type }) => {
  const map = {
    ALERT: { label: "Alert", bgcolor: "#fee2e2", color: "#dc2626" },
    NOTIFICATION: { label: "Notif", bgcolor: "#e0f2fe", color: "#0891b2" },
    GENERAL: { label: "General", bgcolor: "#f1f5f9", color: "#475569" },
  };
  const t = map[type] || map.GENERAL;
  return (
    <Chip
      label={t.label}
      size="small"
      sx={{
        bgcolor: t.bgcolor,
        color: t.color,
        fontWeight: 700,
        fontSize: "0.62rem",
        fontFamily: "Inter, sans-serif",
        height: 20,
        flexShrink: 0,
      }}
    />
  );
};

const AnnouncementCard = ({ a }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2 },
      mb: { xs: 1, sm: 1.5 },
      borderRadius: 3,
      border: `1px solid ${a.type === "ALERT" ? "#fecaca" : "#e0f2fe"}`,
      bgcolor: a.type === "ALERT" ? "#fef2f2" : "white",
      boxShadow: "0 2px 8px rgba(8,145,178,0.04)",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        mb: 0.8,
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0.8,
          minWidth: 0,
        }}
      >
        {a.type === "ALERT" ? (
          <WarningAmberIcon
            sx={{
              color: "#dc2626",
              fontSize: { xs: 15, sm: 18 },
              flexShrink: 0,
              mt: 0.1,
            }}
          />
        ) : a.type === "NOTIFICATION" ? (
          <NotificationsIcon
            sx={{
              color: "#0891b2",
              fontSize: { xs: 15, sm: 18 },
              flexShrink: 0,
              mt: 0.1,
            }}
          />
        ) : (
          <InfoIcon
            sx={{
              color: "#64748b",
              fontSize: { xs: 15, sm: 18 },
              flexShrink: 0,
              mt: 0.1,
            }}
          />
        )}
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.78rem", sm: "0.88rem" },
            color: "#1e293b",
            lineHeight: 1.3,
          }}
        >
          {a.title}
        </Typography>
      </Box>
      <TypeChip type={a.type} />
    </Box>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "0.72rem", sm: "0.82rem" },
        color: "#475569",
        lineHeight: 1.6,
        ml: { xs: 2.8, sm: 3.5 },
      }}
    >
      {a.message}
    </Typography>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "0.6rem", sm: "0.68rem" },
        color: "#94a3b8",
        mt: 0.8,
        ml: { xs: 2.8, sm: 3.5 },
      }}
    >
      {a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN") : "-"}
    </Typography>
  </Paper>
);

const ResidentAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    axiosInstance
      .get("/api/announcement/all")
      .then((res) => setAnnouncements(res.data))
      .catch(() => showError("Failed to load announcements"))
      .finally(() => setLoading(false));
  }, []);

  const alerts = announcements.filter((a) => a.type === "ALERT");
  const notifications = announcements.filter((a) => a.type === "NOTIFICATION");
  const general = announcements.filter((a) => a.type === "GENERAL");
  const data =
    tab === 0
      ? announcements
      : tab === 1
        ? alerts
        : tab === 2
          ? notifications
          : general;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CampaignIcon sx={{ color: "#d97706", fontSize: 18 }} />
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
            Announcements
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            Society announcements and alerts
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            bgcolor: "#f8fbff",
            borderBottom: "1px solid #e0f2fe",
            "& .MuiTab-root": {
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.68rem", sm: "0.8rem" },
              textTransform: "none",
              minHeight: 42,
              px: { xs: 1.2, sm: 2 },
            },
            "& .Mui-selected": { color: "#d97706" },
            "& .MuiTabs-indicator": { bgcolor: "#d97706" },
          }}
        >
          <Tab label={`All (${announcements.length})`} />
          <Tab label={`Alerts (${alerts.length})`} />
          <Tab label={`Notifs (${notifications.length})`} />
          <Tab label={`General (${general.length})`} />
        </Tabs>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={{ xs: 70, sm: 90 }}
              sx={{ mb: { xs: 1, sm: 1.5 }, borderRadius: 3 }}
            />
          ))}
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <CampaignIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#94a3b8",
              fontSize: "0.85rem",
            }}
          >
            No announcements found
          </Typography>
        </Box>
      ) : (
        data.map((a) => <AnnouncementCard key={a.id} a={a} />)
      )}
    </Box>
  );
};

export default ResidentAnnouncementsPage;
