import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Divider,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalculateIcon from "@mui/icons-material/Calculate";
import axiosInstance from "../../api/axiosInstance";
import { showSuccess, showError } from "../../utils/toast";

const headSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.68rem",
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  bgcolor: "#f8fbff",
  py: 1,
  px: 1,
  whiteSpace: "nowrap",
};

const cellSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.78rem",
  color: "#1e293b",
  py: 1,
  px: 1,
  whiteSpace: "nowrap",
};

const JobCard = ({
  icon,
  title,
  description,
  schedule,
  color,
  bgcolor,
  onRun,
  running,
  isMobile,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2.5 },
      borderRadius: 3,
      border: "1px solid #e0f2fe",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: { xs: 1.2, sm: 2 },
      }}
    >
      <Box
        sx={{
          width: { xs: 36, sm: 44 },
          height: { xs: 36, sm: 44 },
          borderRadius: 2,
          bgcolor,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.82rem", sm: "0.92rem" },
            color: "#1e293b",
          }}
        >
          {title}
        </Typography>
        {!isMobile && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
              mt: 0.3,
            }}
          >
            {description}
          </Typography>
        )}
        <Chip
          label={
            isMobile ? schedule.split(":")[1]?.trim() || schedule : schedule
          }
          size="small"
          sx={{
            mt: 0.6,
            bgcolor: "#f1f5f9",
            color: "#475569",
            fontFamily: "Inter, sans-serif",
            fontSize: { xs: "0.58rem", sm: "0.68rem" },
            fontWeight: 600,
            height: 18,
            maxWidth: "100%",
            "& .MuiChip-label": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          }}
        />
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={onRun}
        disabled={running}
        startIcon={
          running ? (
            <CircularProgress size={11} color="inherit" />
          ) : (
            <PlayArrowIcon sx={{ fontSize: "13px !important" }} />
          )
        }
        sx={{
          bgcolor: color,
          borderRadius: 2,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: { xs: "0.65rem", sm: "0.75rem" },
          px: { xs: 0.8, sm: 1.5 },
          whiteSpace: "nowrap",
          flexShrink: 0,
          minWidth: { xs: 60, sm: 90 },
          "&:hover": { bgcolor: color, filter: "brightness(0.9)" },
        }}
      >
        {running
          ? isMobile
            ? "..."
            : "Running..."
          : isMobile
            ? "Run"
            : "Run Now"}
      </Button>
    </Box>
  </Paper>
);

const SchedulerPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningBills, setRunningBills] = useState(false);
  const [runningFines, setRunningFines] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/scheduler/logs");
      setLogs(res.data);
    } catch {
      showError("Failed to load scheduler logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleRunBills = async () => {
    setRunningBills(true);
    try {
      await axiosInstance.post("/api/scheduler/run/monthly-bills");
      showSuccess("Monthly bill generation completed");
      loadLogs();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setRunningBills(false);
    }
  };

  const handleRunFines = async () => {
    setRunningFines(true);
    try {
      await axiosInstance.post("/api/scheduler/run/fine-recalculation");
      showSuccess("Fine recalculation completed");
      loadLogs();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setRunningFines(false);
    }
  };

  const formatJobName = (name) => {
    const map = {
      MONTHLY_BILL_GENERATION: isMobile
        ? "Bill Gen"
        : "Monthly Bill Generation",
      DAILY_FINE_RECALCULATION: isMobile
        ? "Fine Recalc"
        : "Daily Fine Recalculation",
    };
    return map[name] || name;
  };

  const lastBillRun = logs.find((l) => l.jobName === "MONTHLY_BILL_GENERATION");
  const lastFineRun = logs.find(
    (l) => l.jobName === "DAILY_FINE_RECALCULATION",
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ScheduleIcon sx={{ color: "#0891b2", fontSize: 18 }} />
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
            Scheduler
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isMobile
              ? "Cron jobs & logs"
              : "Manage automated cron jobs and view execution logs"}
          </Typography>
        </Box>
      </Box>

      {/* Last Run Info */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: { xs: 1, sm: 2 },
          mb: 2,
        }}
      >
        {[
          {
            label: isMobile ? "Last Bill Gen" : "Last Bill Generation",
            log: lastBillRun,
            color: "#0891b2",
          },
          {
            label: isMobile ? "Last Fine Recalc" : "Last Fine Recalculation",
            log: lastFineRun,
            color: "#d97706",
          },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: { xs: 1.2, sm: 2 },
              borderRadius: 3,
              border: "1px solid #e0f2fe",
              boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.58rem", sm: "0.7rem" },
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 0.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Typography>
            {item.log ? (
              <>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    fontWeight: 700,
                    color: item.color,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.log.recordsProcessed} records
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.6rem", sm: "0.72rem" },
                    color: "#64748b",
                    mt: 0.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(item.log.ranAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    ...(isMobile ? {} : { year: "numeric" }),
                  })}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.72rem", sm: "0.82rem" },
                  color: "#94a3b8",
                  fontStyle: "italic",
                }}
              >
                Never run
              </Typography>
            )}
          </Paper>
        ))}
      </Box>

      {/* Job Cards */}
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: { xs: "0.78rem", sm: "0.85rem" },
          color: "#1e293b",
          mb: 1.2,
        }}
      >
        Cron Jobs
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, sm: 2 },
          mb: 2.5,
        }}
      >
        <JobCard
          icon={
            <ReceiptIcon
              sx={{ color: "#0891b2", fontSize: { xs: 18, sm: 22 } }}
            />
          }
          title="Monthly Bill Generation"
          description="Automatically generates maintenance bills for all active flats on the 1st of every month."
          schedule="Auto: 1st of every month at 8:00 AM"
          color="#0891b2"
          bgcolor="#e0f2fe"
          onRun={handleRunBills}
          running={runningBills}
          isMobile={isMobile}
        />
        <JobCard
          icon={
            <CalculateIcon
              sx={{ color: "#d97706", fontSize: { xs: 18, sm: 22 } }}
            />
          }
          title="Daily Fine Recalculation"
          description="Recalculates overdue fines for all pending maintenance bills every day at midnight."
          schedule="Auto: Every day at 12:00 AM midnight"
          color="#d97706"
          bgcolor="#fef3c7"
          onRun={handleRunFines}
          running={runningFines}
          isMobile={isMobile}
        />
      </Box>

      <Divider sx={{ borderColor: "#e0f2fe", mb: 2 }} />

      {/* Logs Table */}
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: { xs: "0.78rem", sm: "0.85rem" },
          color: "#1e293b",
          mb: 1.2,
        }}
      >
        Recent Execution Logs
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
        }}
      >
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={44}
                sx={{ mb: 1, borderRadius: 1.5 }}
              />
            ))}
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <ScheduleIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            >
              No logs yet - run a job to see logs
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 460 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Job</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx}>Records</TableCell>
                  <TableCell sx={headSx}>Message</TableCell>
                  <TableCell sx={headSx}>Ran At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                  >
                    <TableCell sx={cellSx}>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        {formatJobName(log.jobName)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        icon={
                          log.status === "SUCCESS" ? (
                            <CheckCircleIcon sx={{ fontSize: 11 }} />
                          ) : (
                            <ErrorIcon sx={{ fontSize: 11 }} />
                          )
                        }
                        label={log.status}
                        size="small"
                        sx={{
                          bgcolor:
                            log.status === "SUCCESS" ? "#dcfce7" : "#fee2e2",
                          color:
                            log.status === "SUCCESS" ? "#166534" : "#991b1b",
                          fontWeight: 700,
                          fontSize: "0.62rem",
                          fontFamily: "Inter, sans-serif",
                          height: 20,
                          "& .MuiChip-icon": {
                            color:
                              log.status === "SUCCESS" ? "#166534" : "#991b1b",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={log.recordsProcessed ?? 0}
                        size="small"
                        sx={{
                          bgcolor: "#e0f2fe",
                          color: "#0891b2",
                          fontWeight: 700,
                          fontSize: "0.62rem",
                          fontFamily: "Inter, sans-serif",
                          height: 20,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, maxWidth: 180 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.72rem",
                          color: "#64748b",
                        }}
                      >
                        {log.message || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {log.ranAt
                        ? new Date(log.ranAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            ...(isMobile ? {} : { year: "numeric" }),
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default SchedulerPage;
