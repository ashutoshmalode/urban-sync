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
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  bgcolor: "#f8fbff",
  py: 1.2,
};

const cellSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.82rem",
  color: "#1e293b",
  py: 1.2,
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
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: "1px solid #e0f2fe",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
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
        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "0.92rem",
              color: "#1e293b",
            }}
          >
            {title}
          </Typography>
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
          <Chip
            label={schedule}
            size="small"
            sx={{
              mt: 0.8,
              bgcolor: "#f1f5f9",
              color: "#475569",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.68rem",
              fontWeight: 600,
              height: 20,
            }}
          />
        </Box>
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={onRun}
        disabled={running}
        startIcon={
          running ? (
            <CircularProgress size={12} color="inherit" />
          ) : (
            <PlayArrowIcon fontSize="small" />
          )
        }
        sx={{
          bgcolor: color,
          borderRadius: 2,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "0.78rem",
          px: 2,
          whiteSpace: "nowrap",
          flexShrink: 0,
          "&:hover": { bgcolor: color, filter: "brightness(0.9)" },
        }}
      >
        {running ? "Running..." : "Run Now"}
      </Button>
    </Box>
  </Paper>
);

const SchedulerPage = () => {
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
      showSuccess("Monthly bill generation completed successfully");
      loadLogs();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to run bill generation");
    } finally {
      setRunningBills(false);
    }
  };

  const handleRunFines = async () => {
    setRunningFines(true);
    try {
      await axiosInstance.post("/api/scheduler/run/fine-recalculation");
      showSuccess("Fine recalculation completed successfully");
      loadLogs();
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to run fine recalculation",
      );
    } finally {
      setRunningFines(false);
    }
  };

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatJobName = (name) => {
    const map = {
      MONTHLY_BILL_GENERATION: "Monthly Bill Generation",
      DAILY_FINE_RECALCULATION: "Daily Fine Recalculation",
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
      <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ScheduleIcon sx={{ color: "#0891b2", fontSize: 20 }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "#1e293b",
            }}
          >
            Scheduler
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Manage automated cron jobs and view execution logs
          </Typography>
        </Box>
      </Box>

      {/* Last Run Info */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          mb: 2.5,
        }}
      >
        {[
          {
            label: "Last Bill Generation",
            log: lastBillRun,
            color: "#0891b2",
          },
          {
            label: "Last Fine Recalculation",
            log: lastFineRun,
            color: "#d97706",
          },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #e0f2fe",
              boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 0.5,
              }}
            >
              {item.label}
            </Typography>
            {item.log ? (
              <>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  {item.log.recordsProcessed} records processed
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.72rem",
                    color: "#64748b",
                    mt: 0.3,
                  }}
                >
                  {new Date(item.log.ranAt).toLocaleString("en-IN")}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.82rem",
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
          fontSize: "0.85rem",
          color: "#1e293b",
          mb: 1.5,
        }}
      >
        Cron Jobs
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        <JobCard
          icon={<ReceiptIcon sx={{ color: "#0891b2", fontSize: 22 }} />}
          title="Monthly Bill Generation"
          description="Automatically generates maintenance bills for all active flats on the 1st of every month."
          schedule="Auto: 1st of every month at 8:00 AM"
          color="#0891b2"
          bgcolor="#e0f2fe"
          onRun={handleRunBills}
          running={runningBills}
        />
        <JobCard
          icon={<CalculateIcon sx={{ color: "#d97706", fontSize: 22 }} />}
          title="Daily Fine Recalculation"
          description="Recalculates overdue fines for all pending maintenance bills every day at midnight."
          schedule="Auto: Every day at 12:00 AM midnight"
          color="#d97706"
          bgcolor="#fef3c7"
          onRun={handleRunFines}
          running={runningFines}
        />
      </Box>

      <Divider sx={{ borderColor: "#e0f2fe", mb: 2.5 }} />

      {/* Logs Table */}
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "0.85rem",
          color: "#1e293b",
          mb: 1.5,
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
          <Box sx={{ p: 3 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={48}
                sx={{ mb: 1, borderRadius: 1.5 }}
              />
            ))}
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <ScheduleIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                fontSize: "0.88rem",
              }}
            >
              No scheduler logs yet — run a job to see logs
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Job Name</TableCell>
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
                          fontSize: "0.82rem",
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
                            <CheckCircleIcon sx={{ fontSize: 12 }} />
                          ) : (
                            <ErrorIcon sx={{ fontSize: 12 }} />
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
                          fontSize: "0.7rem",
                          fontFamily: "Inter, sans-serif",
                          height: 22,
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
                          fontSize: "0.7rem",
                          fontFamily: "Inter, sans-serif",
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, maxWidth: 250 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.78rem",
                          color: "#64748b",
                        }}
                      >
                        {log.message || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {log.ranAt
                        ? new Date(log.ranAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
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
