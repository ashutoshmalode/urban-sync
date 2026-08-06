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
    NOTIFICATION: {
      label: "Notification",
      bgcolor: "#e0f2fe",
      color: "#0891b2",
    },
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
        fontSize: "0.7rem",
        fontFamily: "Inter, sans-serif",
        height: 22,
      }}
    />
  );
};

const AnnouncementCard = ({ a }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 1.5,
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
        mb: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {a.type === "ALERT" ? (
          <WarningAmberIcon sx={{ color: "#dc2626", fontSize: 18 }} />
        ) : a.type === "NOTIFICATION" ? (
          <NotificationsIcon sx={{ color: "#0891b2", fontSize: 18 }} />
        ) : (
          <InfoIcon sx={{ color: "#64748b", fontSize: 18 }} />
        )}
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "0.88rem",
            color: "#1e293b",
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
        fontSize: "0.82rem",
        color: "#475569",
        lineHeight: 1.6,
        ml: 3.5,
      }}
    >
      {a.message}
    </Typography>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: "0.68rem",
        color: "#94a3b8",
        mt: 1,
        ml: 3.5,
      }}
    >
      {a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN") : "—"}
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
      <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CampaignIcon sx={{ color: "#d97706", fontSize: 20 }} />
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
            Announcements
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Society announcements and alerts
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
          mb: 2,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            bgcolor: "#f8fbff",
            borderBottom: "1px solid #e0f2fe",
            "& .MuiTab-root": {
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "none",
              minHeight: 44,
            },
            "& .Mui-selected": { color: "#d97706" },
            "& .MuiTabs-indicator": { bgcolor: "#d97706" },
          }}
        >
          <Tab label={`All (${announcements.length})`} />
          <Tab label={`Alerts (${alerts.length})`} />
          <Tab label={`Notifications (${notifications.length})`} />
          <Tab label={`General (${general.length})`} />
        </Tabs>
      </Paper>

      {loading ? (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={90}
              sx={{ mb: 1.5, borderRadius: 3 }}
            />
          ))}
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CampaignIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#94a3b8",
              fontSize: "0.88rem",
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
