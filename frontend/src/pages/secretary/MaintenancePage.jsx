import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
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

const fieldStyle = (isMobile) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.78rem" : "0.875rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiFormHelperText-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.6rem" : "0.7rem",
  },
});

const StatusChip = ({ status }) => {
  const map = {
    PENDING: { label: "Pending", bgcolor: "#fef9c3", color: "#854d0e" },
    PAID: { label: "Paid", bgcolor: "#dcfce7", color: "#166534" },
  };
  const s = map[status] || map.PENDING;
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        bgcolor: s.bgcolor,
        color: s.color,
        fontWeight: 700,
        fontSize: "0.62rem",
        fontFamily: "Inter, sans-serif",
        height: 20,
      }}
    />
  );
};

const DetailRow = ({ label, value, highlight }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      py: 0.8,
      borderBottom: "1px solid #f1f5f9",
      alignItems: "flex-start",
      gap: 1,
    }}
  >
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "0.72rem", sm: "0.8rem" },
        color: "#64748b",
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: { xs: "0.75rem", sm: "0.85rem" },
        color: highlight ? "#0891b2" : "#1e293b",
        fontWeight: highlight ? 800 : 600,
        textAlign: "right",
        wordBreak: "break-word",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MaintenancePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);
  const [allBills, setAllBills] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [flatInfo, setFlatInfo] = useState(null);
  const [flatInfoLoading, setFlatInfoLoading] = useState(false);
  const [flatInfoError, setFlatInfoError] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    wingName: "",
    flatNumber: "",
    billMonth: new Date().getMonth() + 1,
    billYear: new Date().getFullYear(),
  });
  const [generateErrors, setGenerateErrors] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    maintenanceAmount: "",
    dueFinePerDay: "",
    validityDays: "",
  });
  const [settingsErrors, setSettingsErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [allRes, pendingRes, paidRes, settingsRes] = await Promise.all([
        axiosInstance.get("/api/maintenance/bills/all"),
        axiosInstance.get("/api/maintenance/bills/pending"),
        axiosInstance.get("/api/maintenance/bills/paid"),
        axiosInstance.get("/api/maintenance/settings"),
      ]);
      setAllBills(allRes.data);
      setPendingBills(pendingRes.data);
      setPaidBills(paidRes.data);
      setSettings(settingsRes.data);
      setSettingsForm({
        maintenanceAmount: settingsRes.data.maintenanceAmount,
        dueFinePerDay: settingsRes.data.dueFinePerDay,
        validityDays: settingsRes.data.validityDays,
      });
    } catch {
      showError("Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFlatInfo = async (wingName, flatNumber) => {
    if (!wingName || !flatNumber) return;
    setFlatInfoLoading(true);
    setFlatInfoError("");
    setFlatInfo(null);
    try {
      const res = await axiosInstance.get("/api/maintenance/bills/flat-info", {
        params: { wingName, flatNumber },
      });
      if (!res.data)
        setFlatInfoError(`Flat ${wingName}-${flatNumber} is not registered.`);
      else if (!res.data.residentId)
        setFlatInfoError(
          `Flat ${wingName}-${flatNumber} has no resident assigned.`,
        );
      else setFlatInfo(res.data);
    } catch {
      setFlatInfoError("Failed to fetch flat details.");
    } finally {
      setFlatInfoLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSettings = async () => {
    const e = {};
    if (!settingsForm.maintenanceAmount) e.maintenanceAmount = "Required";
    if (!settingsForm.dueFinePerDay) e.dueFinePerDay = "Required";
    if (!settingsForm.validityDays) e.validityDays = "Required";
    setSettingsErrors(e);
    if (Object.values(e).some((v) => v)) return;
    setActionLoading(true);
    try {
      await axiosInstance.put("/api/maintenance/settings", {
        maintenanceAmount: Number(settingsForm.maintenanceAmount),
        dueFinePerDay: Number(settingsForm.dueFinePerDay),
        validityDays: Number(settingsForm.validityDays),
      });
      showSuccess("Settings updated");
      setSettingsOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!generateForm.wingName || !generateForm.flatNumber) {
      showError("Enter wing and flat number");
      return;
    }
    if (!flatInfo) {
      showError("Wait for flat details to load");
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.post("/api/maintenance/bills/generate", {
        flatId: flatInfo.flatId,
        residentId: flatInfo.residentId,
        billMonth: Number(generateForm.billMonth),
        billYear: Number(generateForm.billYear),
      });
      showSuccess(`Bill generated for ${flatInfo.residentName}`);
      setGenerateOpen(false);
      setGenerateForm({
        wingName: "",
        flatNumber: "",
        billMonth: new Date().getMonth() + 1,
        billYear: new Date().getFullYear(),
      });
      setFlatInfo(null);
      setFlatInfoError("");
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (billId) => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/maintenance/bills/${billId}/pay`);
      showSuccess("Bill marked as paid");
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={44}
          sx={{ mb: 1, borderRadius: 1.5 }}
        />
      ))}
    </Box>
  );

  const BillsTable = ({ bills }) =>
    bills.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <ReceiptIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            color: "#94a3b8",
            fontSize: "0.85rem",
          }}
        >
          No bills found
        </Typography>
      </Box>
    ) : (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 580 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headSx}>Flat</TableCell>
              <TableCell sx={headSx}>Resident</TableCell>
              <TableCell sx={headSx}>Month</TableCell>
              <TableCell sx={headSx}>Base</TableCell>
              <TableCell sx={headSx}>Fine</TableCell>
              <TableCell sx={headSx}>Total</TableCell>
              <TableCell sx={headSx}>Due</TableCell>
              <TableCell sx={headSx}>Status</TableCell>
              <TableCell sx={headSx} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((bill) => (
              <TableRow
                key={bill.id}
                hover
                sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
              >
                <TableCell sx={cellSx}>
                  <Chip
                    label={bill.flatNumber || "—"}
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
                <TableCell sx={cellSx}>{bill.residentName || "—"}</TableCell>
                <TableCell sx={cellSx}>
                  {MONTHS[(bill.billMonth || 1) - 1].slice(0, 3)}{" "}
                  {bill.billYear}
                </TableCell>
                <TableCell sx={cellSx}>
                  ₹{bill.baseAmount?.toLocaleString("en-IN")}
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.78rem",
                      color: bill.fineAmount > 0 ? "#dc2626" : "#1e293b",
                      fontWeight: bill.fineAmount > 0 ? 700 : 400,
                    }}
                  >
                    ₹{bill.fineAmount?.toLocaleString("en-IN")}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    ₹{bill.totalAmount?.toLocaleString("en-IN")}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  {bill.dueDate
                    ? new Date(bill.dueDate).toLocaleDateString("en-IN")
                    : "—"}
                </TableCell>
                <TableCell sx={cellSx}>
                  <StatusChip status={bill.status} />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ py: 0.8, px: 1, whiteSpace: "nowrap" }}
                >
                  <Box
                    sx={{ display: "flex", gap: 0.4, justifyContent: "center" }}
                  >
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedBill(bill);
                          setDetailOpen(true);
                        }}
                        sx={{
                          color: "#0891b2",
                          bgcolor: "#e0f2fe",
                          borderRadius: 1.5,
                          width: 26,
                          height: 26,
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                    {bill.status === "PENDING" && (
                      <Tooltip title="Mark as Paid">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkPaid(bill.id)}
                          disabled={actionLoading}
                          sx={{
                            color: "#059669",
                            bgcolor: "#dcfce7",
                            borderRadius: 1.5,
                            width: 26,
                            height: 26,
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          flexWrap: "nowrap",
        }}
      >
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
          <ReceiptIcon sx={{ color: "#0891b2", fontSize: 18 }} />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "0.9rem", sm: "1.05rem" },
              color: "#1e293b",
            }}
          >
            Maintenance
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
              ? "Bills & Settings"
              : "Manage maintenance bills and settings"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.8, flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon sx={{ fontSize: "13px !important" }} />}
            onClick={() => setSettingsOpen(true)}
            sx={{
              borderRadius: 2,
              borderColor: "#0891b2",
              color: "#0891b2",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.68rem", sm: "0.78rem" },
              px: { xs: 1, sm: 1.5 },
              whiteSpace: "nowrap",
            }}
          >
            {isMobile ? "Settings" : "Settings"}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
            onClick={() => setGenerateOpen(true)}
            sx={{
              bgcolor: "#0891b2",
              borderRadius: 2,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.68rem", sm: "0.78rem" },
              px: { xs: 1, sm: 1.5 },
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px rgba(8,145,178,0.25)",
              "&:hover": { bgcolor: "#0e7490" },
            }}
          >
            {isMobile ? "Bill" : "Generate Bill"}
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      {settings && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: { xs: 1, sm: 1.5, md: 2 },
            mb: 2,
          }}
        >
          {[
            {
              label: "Monthly Amt",
              value: `₹${Number(settings.maintenanceAmount).toLocaleString("en-IN")}`,
              color: "#0891b2",
              bg: "#e0f2fe",
            },
            {
              label: "Fine/Day",
              value: `₹${Number(settings.dueFinePerDay).toLocaleString("en-IN")}`,
              color: "#dc2626",
              bg: "#fee2e2",
            },
            {
              label: "Pending",
              value: pendingBills.length,
              color: "#d97706",
              bg: "#fef3c7",
            },
            {
              label: "Paid",
              value: paidBills.length,
              color: "#059669",
              bg: "#dcfce7",
            },
          ].map((stat) => (
            <Paper
              key={stat.label}
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
                  fontSize: { xs: "0.6rem", sm: "0.7rem" },
                  fontWeight: 600,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {stat.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
                  fontWeight: 800,
                  color: stat.color,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "—" : stat.value}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
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
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              textTransform: "none",
              minHeight: 42,
              px: { xs: 1.5, sm: 2 },
            },
            "& .Mui-selected": { color: "#0891b2" },
            "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
          }}
        >
          <Tab label={`All (${allBills.length})`} />
          <Tab label={`Pending (${pendingBills.length})`} />
          <Tab label={`Paid (${paidBills.length})`} />
        </Tabs>

        {loading ? (
          <LoadingSkeleton />
        ) : tab === 0 ? (
          <BillsTable bills={allBills} />
        ) : tab === 1 ? (
          <BillsTable bills={pendingBills} />
        ) : (
          <BillsTable bills={paidBills} />
        )}
      </Paper>

      {/* Bill Detail Modal */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, mx: { xs: 1.5, sm: 3 } } },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.88rem", sm: "1rem" },
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ReceiptIcon sx={{ color: "#0891b2", fontSize: 16 }} />
          Bill Details
          {selectedBill && <StatusChip status={selectedBill.status} />}
        </DialogTitle>
        {selectedBill && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            {[
              ["Flat Number", selectedBill.flatNumber || "—"],
              ["Resident", selectedBill.residentName || "—"],
              [
                "Bill Month",
                `${MONTHS[(selectedBill.billMonth || 1) - 1]} ${selectedBill.billYear}`,
              ],
              [
                "Due Date",
                selectedBill.dueDate
                  ? new Date(selectedBill.dueDate).toLocaleDateString("en-IN")
                  : "—",
              ],
              [
                "Base Amount",
                `₹${selectedBill.baseAmount?.toLocaleString("en-IN")}`,
              ],
              [
                "Fine Amount",
                `₹${selectedBill.fineAmount?.toLocaleString("en-IN")}`,
              ],
              [
                "Total Amount",
                `₹${selectedBill.totalAmount?.toLocaleString("en-IN")}`,
                true,
              ],
              ["Status", selectedBill.status],
              ...(selectedBill.paidAt
                ? [
                    [
                      "Paid On",
                      new Date(selectedBill.paidAt).toLocaleString("en-IN"),
                    ],
                  ]
                : []),
              [
                "Generated On",
                new Date(selectedBill.createdAt).toLocaleString("en-IN"),
              ],
            ].map(([label, value, highlight]) => (
              <DetailRow
                key={label}
                label={label}
                value={value}
                highlight={highlight}
              />
            ))}
          </DialogContent>
        )}
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => setDetailOpen(false)}
            size="small"
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
              fontSize: "0.78rem",
            }}
          >
            Close
          </Button>
          {selectedBill?.status === "PENDING" && (
            <Button
              variant="contained"
              size="small"
              onClick={() => handleMarkPaid(selectedBill?.id)}
              disabled={actionLoading}
              startIcon={
                <CheckCircleIcon sx={{ fontSize: "13px !important" }} />
              }
              sx={{
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
                fontSize: "0.78rem",
                bgcolor: "#059669",
                borderRadius: 2,
                "&:hover": { bgcolor: "#047857" },
              }}
            >
              {actionLoading ? "Processing..." : "Mark as Paid"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Settings Modal */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, mx: { xs: 1.5, sm: 3 } } },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.88rem", sm: "1rem" },
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SettingsIcon sx={{ color: "#0891b2", fontSize: 16 }} />
          Maintenance Settings
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
              label="Monthly Amount (₹) *"
              value={settingsForm.maintenanceAmount}
              onChange={(e) => {
                if (/^\d*\.?\d*$/.test(e.target.value))
                  setSettingsForm({
                    ...settingsForm,
                    maintenanceAmount: e.target.value,
                  });
              }}
              size="small"
              fullWidth
              error={!!settingsErrors.maintenanceAmount}
              helperText={settingsErrors.maintenanceAmount}
              sx={fieldStyle(isMobile)}
            />
            <TextField
              label="Fine Per Day (₹) *"
              value={settingsForm.dueFinePerDay}
              onChange={(e) => {
                if (/^\d*\.?\d*$/.test(e.target.value))
                  setSettingsForm({
                    ...settingsForm,
                    dueFinePerDay: e.target.value,
                  });
              }}
              size="small"
              fullWidth
              error={!!settingsErrors.dueFinePerDay}
              helperText={settingsErrors.dueFinePerDay}
              sx={fieldStyle(isMobile)}
            />
            <TextField
              label="Payment Validity Days *"
              value={settingsForm.validityDays}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value))
                  setSettingsForm({
                    ...settingsForm,
                    validityDays: e.target.value,
                  });
              }}
              size="small"
              fullWidth
              error={!!settingsErrors.validityDays}
              helperText={
                settingsErrors.validityDays ||
                "Bill due on this day of each month"
              }
              sx={fieldStyle(isMobile)}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => setSettingsOpen(false)}
            size="small"
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
              fontSize: "0.78rem",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleUpdateSettings}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#0891b2",
              borderRadius: 2,
              "&:hover": { bgcolor: "#0e7490" },
            }}
          >
            {actionLoading ? "Saving..." : "Save Settings"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Bill Modal */}
      <Dialog
        open={generateOpen}
        onClose={() => {
          setGenerateOpen(false);
          setGenerateForm({
            wingName: "",
            flatNumber: "",
            billMonth: new Date().getMonth() + 1,
            billYear: new Date().getFullYear(),
          });
          setGenerateErrors({});
          setFlatInfo(null);
          setFlatInfoError("");
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, mx: { xs: 1.5, sm: 3 } } },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "0.88rem", sm: "1rem" },
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddIcon sx={{ color: "#0891b2", fontSize: 16 }} />
          Generate Maintenance Bill
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Settings info */}
            <Box
              sx={{
                p: 1.2,
                bgcolor: "#f0f9ff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  color: "#64748b",
                  mb: 0.3,
                }}
              >
                Current Settings
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.72rem", sm: "0.82rem" },
                  fontWeight: 600,
                  color: "#0891b2",
                }}
              >
                ₹{settings?.maintenanceAmount?.toLocaleString("en-IN")}/mo •
                Fine ₹{settings?.dueFinePerDay}/day after{" "}
                {settings?.validityDays}th
              </Typography>
            </Box>

            {/* Wing + Flat */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}
            >
              <FormControl size="small" sx={fieldStyle(isMobile)}>
                <InputLabel
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: isMobile ? "0.78rem" : "0.875rem",
                  }}
                >
                  Wing *
                </InputLabel>
                <Select
                  value={generateForm.wingName}
                  onChange={(e) => {
                    setGenerateForm({
                      ...generateForm,
                      wingName: e.target.value,
                    });
                    setFlatInfo(null);
                    setFlatInfoError("");
                    if (generateForm.flatNumber)
                      fetchFlatInfo(e.target.value, generateForm.flatNumber);
                  }}
                  label="Wing *"
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: isMobile ? "0.78rem" : "0.875rem",
                  }}
                >
                  <MenuItem
                    value=""
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
                    }}
                  >
                    <em>Select</em>
                  </MenuItem>
                  {["A", "B", "C", "D", "E"].map((w) => (
                    <MenuItem
                      key={w}
                      value={w}
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.82rem",
                      }}
                    >
                      Wing {w}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Flat No. *"
                value={generateForm.flatNumber}
                onChange={(e) => {
                  if (
                    !/^\d*$/.test(e.target.value) ||
                    e.target.value.length > 4
                  )
                    return;
                  setGenerateForm({
                    ...generateForm,
                    flatNumber: e.target.value,
                  });
                  setFlatInfo(null);
                  setFlatInfoError("");
                }}
                onBlur={() => {
                  if (generateForm.wingName && generateForm.flatNumber)
                    fetchFlatInfo(
                      generateForm.wingName,
                      generateForm.flatNumber,
                    );
                }}
                size="small"
                helperText="e.g. 201"
                sx={fieldStyle(isMobile)}
              />
            </Box>

            {flatInfoLoading && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.2,
                  py: 0.8,
                  bgcolor: "#f8fbff",
                  borderRadius: 1.5,
                  border: "1px solid #e0f2fe",
                }}
              >
                <CircularProgress size={12} sx={{ color: "#0891b2" }} />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    color: "#64748b",
                  }}
                >
                  Fetching flat details...
                </Typography>
              </Box>
            )}

            {flatInfoError && (
              <Box
                sx={{
                  px: 1.2,
                  py: 0.8,
                  bgcolor: "#fef2f2",
                  borderRadius: 1.5,
                  border: "1px solid #fecaca",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    color: "#991b1b",
                    fontWeight: 600,
                  }}
                >
                  {flatInfoError}
                </Typography>
              </Box>
            )}

            {flatInfo && (
              <Box
                sx={{
                  p: 1.2,
                  bgcolor: "#f0fdf4",
                  borderRadius: 2,
                  border: "1px solid #bbf7d0",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: "#059669",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 0.8,
                  }}
                >
                  ✓ Flat Found
                </Typography>
                {[
                  ["Flat", flatInfo.flatNumber],
                  ["Resident", flatInfo.residentName],
                ].map(([l, v]) => (
                  <Box
                    key={l}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.4,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: { xs: "0.72rem", sm: "0.8rem" },
                        color: "#64748b",
                      }}
                    >
                      {l}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: { xs: "0.72rem", sm: "0.8rem" },
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {v}
                    </Typography>
                  </Box>
                ))}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      color: "#64748b",
                    }}
                  >
                    Type
                  </Typography>
                  <Chip
                    label={flatInfo.residentType}
                    size="small"
                    sx={{
                      bgcolor:
                        flatInfo.residentType === "TENANT"
                          ? "#f3e8ff"
                          : "#e0f2fe",
                      color:
                        flatInfo.residentType === "TENANT"
                          ? "#7c3aed"
                          : "#0891b2",
                      fontWeight: 700,
                      fontSize: "0.6rem",
                      fontFamily: "Inter, sans-serif",
                      height: 18,
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Month + Year */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}
            >
              <TextField
                label="Month *"
                value={generateForm.billMonth}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 1 && v <= 12)
                    setGenerateForm({ ...generateForm, billMonth: v });
                }}
                size="small"
                type="number"
                slotProps={{ htmlInput: { min: 1, max: 12 } }}
                sx={fieldStyle(isMobile)}
              />
              <TextField
                label="Year *"
                value={generateForm.billYear}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value))
                    setGenerateForm({
                      ...generateForm,
                      billYear: e.target.value,
                    });
                }}
                size="small"
                sx={fieldStyle(isMobile)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 1.5, px: 2, gap: 0.8, borderTop: "1px solid #e0f2fe" }}
        >
          <Button
            onClick={() => {
              setGenerateOpen(false);
              setGenerateForm({
                wingName: "",
                flatNumber: "",
                billMonth: new Date().getMonth() + 1,
                billYear: new Date().getFullYear(),
              });
              setGenerateErrors({});
              setFlatInfo(null);
              setFlatInfoError("");
            }}
            size="small"
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
              fontSize: "0.78rem",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleGenerateBill}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
              fontSize: "0.78rem",
              bgcolor: "#0891b2",
              borderRadius: 2,
              "&:hover": { bgcolor: "#0e7490" },
            }}
          >
            {actionLoading ? "Generating..." : "Generate Bill"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenancePage;
