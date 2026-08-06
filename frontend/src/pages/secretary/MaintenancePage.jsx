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
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
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

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
};

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
        fontSize: "0.7rem",
        fontFamily: "Inter, sans-serif",
        height: 22,
      }}
    />
  );
};

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

  // Bill detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Generate bill modal
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    wingName: "",
    flatNumber: "",
    billMonth: new Date().getMonth() + 1,
    billYear: new Date().getFullYear(),
  });
  const [generateErrors, setGenerateErrors] = useState({});

  // Settings modal
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
      if (!res.data) {
        setFlatInfoError(
          `Flat ${wingName}-${flatNumber} is not registered in the system.`,
        );
      } else if (!res.data.residentId) {
        setFlatInfoError(
          `Flat ${wingName}-${flatNumber} has no resident assigned.`,
        );
      } else {
        setFlatInfo(res.data);
      }
    } catch {
      setFlatInfoError("Failed to fetch flat details. Please try again.");
    } finally {
      setFlatInfoLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update settings
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
      showSuccess("Settings updated successfully");
      setSettingsOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update settings");
    } finally {
      setActionLoading(false);
    }
  };

  // Generate bill
  const handleGenerateBill = async () => {
    if (!generateForm.wingName || !generateForm.flatNumber) {
      showError("Please enter wing and flat number");
      return;
    }
    if (!flatInfo) {
      showError("Please wait for flat details to load");
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
      showSuccess(
        `Bill generated for ${flatInfo.residentName} — ${flatInfo.flatNumber}`,
      );
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
      showError(err.response?.data?.message || "Failed to generate bill");
    } finally {
      setActionLoading(false);
    }
  };

  // Mark as paid
  const handleMarkPaid = async (billId) => {
    setActionLoading(true);
    try {
      await axiosInstance.put(`/api/maintenance/bills/${billId}/pay`);
      showSuccess("Bill marked as paid");
      setDetailOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to mark as paid");
    } finally {
      setActionLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={48}
          sx={{ mb: 1, borderRadius: 1.5 }}
        />
      ))}
    </Box>
  );

  const BillsTable = ({ bills }) =>
    bills.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <ReceiptIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            color: "#94a3b8",
            fontSize: "0.88rem",
          }}
        >
          No bills found
        </Typography>
      </Box>
    ) : (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headSx}>Flat</TableCell>
              <TableCell sx={headSx}>Resident</TableCell>
              <TableCell sx={headSx}>Month</TableCell>
              <TableCell sx={headSx}>Base</TableCell>
              <TableCell sx={headSx}>Fine</TableCell>
              <TableCell sx={headSx}>Total</TableCell>
              <TableCell sx={headSx}>Due Date</TableCell>
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
                      fontSize: "0.7rem",
                      fontFamily: "Inter, sans-serif",
                      height: 22,
                    }}
                  />
                </TableCell>
                <TableCell sx={cellSx}>{bill.residentName || "—"}</TableCell>
                <TableCell sx={cellSx}>
                  {MONTHS[(bill.billMonth || 1) - 1]} {bill.billYear}
                </TableCell>
                <TableCell sx={cellSx}>
                  ₹{bill.baseAmount?.toLocaleString("en-IN")}
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
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
                      fontSize: "0.82rem",
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
                <TableCell align="center" sx={{ py: 1 }}>
                  <Box
                    sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}
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
                          width: 28,
                          height: 28,
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 14 }} />
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
                            width: 28,
                            height: 28,
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 14 }} />
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
          <ReceiptIcon sx={{ color: "#0891b2", fontSize: 20 }} />
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
            Maintenance
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Manage maintenance bills and settings
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SettingsIcon fontSize="small" />}
          onClick={() => setSettingsOpen(true)}
          sx={{
            borderRadius: 2,
            borderColor: "#0891b2",
            color: "#0891b2",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "0.8rem",
            px: 2,
            mr: 1,
          }}
        >
          Settings
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setGenerateOpen(true)}
          sx={{
            bgcolor: "#0891b2",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "0.8rem",
            px: 2,
            boxShadow: "0 2px 6px rgba(8,145,178,0.25)",
            "&:hover": { bgcolor: "#0e7490" },
          }}
        >
          Generate Bill
        </Button>
      </Box>

      {/* Stats Row */}
      {settings && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
            mb: 2.5,
          }}
        >
          {[
            {
              label: "Monthly Amount",
              value: `₹${Number(settings.maintenanceAmount).toLocaleString("en-IN")}`,
              color: "#0891b2",
              bg: "#e0f2fe",
            },
            {
              label: "Fine Per Day",
              value: `₹${Number(settings.dueFinePerDay).toLocaleString("en-IN")}`,
              color: "#dc2626",
              bg: "#fee2e2",
            },
            {
              label: "Pending Bills",
              value: pendingBills.length,
              color: "#d97706",
              bg: "#fef3c7",
            },
            {
              label: "Paid Bills",
              value: paidBills.length,
              color: "#059669",
              bg: "#dcfce7",
            },
          ].map((stat) => (
            <Paper
              key={stat.label}
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
                {stat.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: stat.color,
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
            "& .Mui-selected": { color: "#0891b2" },
            "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
          }}
        >
          <Tab label={`All Bills (${allBills.length})`} />
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
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ReceiptIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Bill Details
          {selectedBill && <StatusChip status={selectedBill.status} />}
        </DialogTitle>
        {selectedBill && (
          <DialogContent sx={{ pt: 2 }}>
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
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1,
                  borderBottom: "1px solid #f1f5f9",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.8rem",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.85rem",
                    color: label === "Total Amount" ? "#0891b2" : "#1e293b",
                    fontWeight: label === "Total Amount" ? 800 : 600,
                  }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setDetailOpen(false)}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
            }}
          >
            Close
          </Button>
          {selectedBill?.status === "PENDING" && (
            <Button
              variant="contained"
              onClick={() => handleMarkPaid(selectedBill?.id)}
              disabled={actionLoading}
              startIcon={<CheckCircleIcon fontSize="small" />}
              sx={{
                fontFamily: "Inter, sans-serif",
                textTransform: "none",
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
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SettingsIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Maintenance Settings
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              sx={fieldStyle}
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
              sx={fieldStyle}
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
              sx={fieldStyle}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => setSettingsOpen(false)}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateSettings}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
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
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1e293b",
            borderBottom: "1px solid #e0f2fe",
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Generate Maintenance Bill
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Settings info */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f0f9ff",
                borderRadius: 2,
                border: "1px solid #e0f2fe",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.75rem",
                  color: "#64748b",
                  mb: 0.3,
                }}
              >
                Current Settings
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#0891b2",
                }}
              >
                ₹{settings?.maintenanceAmount?.toLocaleString("en-IN")} / month
                • Fine ₹{settings?.dueFinePerDay}/day after{" "}
                {settings?.validityDays}th
              </Typography>
            </Box>

            {/* Wing + Flat Number */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <FormControl size="small" sx={fieldStyle}>
                <InputLabel sx={{ fontFamily: "Inter, sans-serif" }}>
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
                    if (generateForm.flatNumber) {
                      fetchFlatInfo(e.target.value, generateForm.flatNumber);
                    }
                  }}
                  label="Wing *"
                  sx={{ fontFamily: "Inter, sans-serif" }}
                >
                  <MenuItem value="" sx={{ fontFamily: "Inter, sans-serif" }}>
                    <em>Select Wing</em>
                  </MenuItem>
                  {["A", "B", "C", "D", "E"].map((w) => (
                    <MenuItem
                      key={w}
                      value={w}
                      sx={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Wing {w}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Flat Number *"
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
                  if (generateForm.wingName && generateForm.flatNumber) {
                    fetchFlatInfo(
                      generateForm.wingName,
                      generateForm.flatNumber,
                    );
                  }
                }}
                size="small"
                inputprops={{ maxLength: 4 }}
                helperText="1-4 digits e.g. 201"
                sx={fieldStyle}
              />
            </Box>

            {/* Flat loading */}
            {flatInfoLoading && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
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
                    fontSize: "0.75rem",
                    color: "#64748b",
                  }}
                >
                  Fetching flat details...
                </Typography>
              </Box>
            )}

            {/* Flat error */}
            {flatInfoError && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.8,
                  bgcolor: "#fef2f2",
                  borderRadius: 1.5,
                  border: "1px solid #fecaca",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    color: "#991b1b",
                    fontWeight: 600,
                  }}
                >
                  {flatInfoError}
                </Typography>
              </Box>
            )}

            {/* Flat info — auto fetched */}
            {flatInfo && (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "#f0fdf4",
                  borderRadius: 2,
                  border: "1px solid #bbf7d0",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#059669",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 1,
                  }}
                >
                  ✓ Flat Found — Bill will be generated for:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8rem",
                      color: "#64748b",
                    }}
                  >
                    Flat
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {flatInfo.flatNumber}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8rem",
                      color: "#64748b",
                    }}
                  >
                    Resident
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {flatInfo.residentName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8rem",
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
                      fontSize: "0.68rem",
                      fontFamily: "Inter, sans-serif",
                      height: 20,
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Month + Year */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
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
                sx={fieldStyle}
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
                sx={fieldStyle}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #e0f2fe" }}>
          <Button
            onClick={() => {
              setGenerateOpen(false);
              setGenerateForm({
                flatId: "",
                residentId: "",
                billMonth: new Date().getMonth() + 1,
                billYear: new Date().getFullYear(),
              });
              setGenerateErrors({});
            }}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#64748b",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateBill}
            disabled={actionLoading}
            sx={{
              fontFamily: "Inter, sans-serif",
              textTransform: "none",
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
