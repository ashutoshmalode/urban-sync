import { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Skeleton, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Grid, TextField,
  InputAdornment, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptIcon from "@mui/icons-material/Receipt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axiosInstance from "../../api/axiosInstance";
import { showError } from "../../utils/toast";

const headSx = {
  fontFamily: "Inter, sans-serif", fontSize: "0.72rem",
  fontWeight: 700, color: "#64748b",
  letterSpacing: "0.05em", textTransform: "uppercase",
  bgcolor: "#f8fbff", py: 1.2,
};

const cellSx = {
  fontFamily: "Inter, sans-serif",
  fontSize: "0.82rem", color: "#1e293b", py: 1.2,
};

const StatCard = ({ icon, label, value, color, bgcolor }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e0f2fe", boxShadow: "0 2px 12px rgba(8,145,178,0.06)", display: "flex", alignItems: "center", gap: 2 }}>
    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "1.1rem", fontWeight: 800, color }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const StatusChip = ({ status }) => {
  const map = {
    SUCCESS: { label: "Success", bgcolor: "#dcfce7", color: "#166534" },
    PENDING: { label: "Pending", bgcolor: "#fef9c3", color: "#854d0e" },
    FAILED:  { label: "Failed",  bgcolor: "#fee2e2", color: "#991b1b" },
  };
  const s = map[status] || map.PENDING;
  return (
    <Chip label={s.label} size="small" sx={{ bgcolor: s.bgcolor, color: s.color, fontWeight: 700, fontSize: "0.7rem", fontFamily: "Inter, sans-serif", height: 22 }} />
  );
};

const PaymentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [txRes, fundRes] = await Promise.all([
          axiosInstance.get("/api/payment/transactions/all"),
          axiosInstance.get("/api/payment/fund/balance"),
        ]);
        setTransactions(txRes.data);
        setFund(fundRes.data);
      } catch {
        showError("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const successful = transactions.filter(t => t.status === "SUCCESS");
  const pending    = transactions.filter(t => t.status === "PENDING");

  const displayData = tab === 0 ? transactions : successful;

  const filtered = displayData.filter(t =>
    !search ||
    t.razorpayOrderId?.toLowerCase().includes(search.toLowerCase()) ||
    t.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase()) ||
    t.status?.toLowerCase().includes(search.toLowerCase()) ||
    String(t.billId)?.includes(search) ||
    t.residentName?.toLowerCase().includes(search.toLowerCase()) ||
    t.flatNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = successful.reduce((sum, t) => sum + Number(t.amountPaid || 0), 0);

  const TransactionTable = ({ data }) => (
    data.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <ReceiptIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
        <Typography sx={{ fontFamily: "Inter, sans-serif", color: "#94a3b8", fontSize: "0.88rem" }}>
          {search ? "No transactions match your search" : "No transactions yet"}
        </Typography>
      </Box>
    ) : (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headSx}>Bill</TableCell>
              <TableCell sx={headSx}>Resident</TableCell>
              <TableCell sx={headSx}>Flat</TableCell>
              <TableCell sx={headSx}>Order ID</TableCell>
              <TableCell sx={headSx}>Amount</TableCell>
              <TableCell sx={headSx}>Status</TableCell>
              <TableCell sx={headSx}>Date</TableCell>
              <TableCell sx={headSx}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((t) => (
              <TableRow key={t.id} hover sx={{ "&:hover": { bgcolor: "#f8fbff" } }}>
                <TableCell sx={cellSx}>
                  <Chip label={`#${t.billId || "—"}`} size="small" sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 600, fontSize: "0.7rem", fontFamily: "Inter, sans-serif", height: 22 }} />
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>
                    {t.residentName || "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  {t.flatNumber ? (
                    <Chip label={t.flatNumber} size="small" sx={{ bgcolor: "#e0f2fe", color: "#0891b2", fontWeight: 600, fontSize: "0.7rem", fontFamily: "Inter, sans-serif", height: 22 }} />
                  ) : "—"}
                </TableCell>
                <TableCell sx={{ ...cellSx, maxWidth: 150 }}>
                  <Typography noWrap sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "#64748b" }}>
                    {t.razorpayOrderId || "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 700, color: t.status === "SUCCESS" ? "#059669" : "#d97706", fontSize: "0.85rem" }}>
                    {t.amountPaid ? `₹${Number(t.amountPaid).toLocaleString("en-IN")}` : "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}><StatusChip status={t.status} /></TableCell>
                <TableCell sx={cellSx}>
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <IconButton size="small" onClick={() => { setSelected(t); setDetailOpen(true); }}
                    sx={{ color: "#0891b2", bgcolor: "#e0f2fe", borderRadius: 1.5, width: 28, height: 28 }}>
                    <VisibilityIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PaymentIcon sx={{ color: "#0891b2", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#1e293b" }}>
            Payments
          </Typography>
          <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "#64748b" }}>
            Society fund and transaction history
          </Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      {loading ? (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {[...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={<AccountBalanceWalletIcon sx={{ color: "#0891b2", fontSize: 22 }} />}
              label="Society Fund Balance"
              value={fund ? `₹${Number(fund.balance).toLocaleString("en-IN")}` : "—"}
              color="#0891b2" bgcolor="#e0f2fe"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={<TrendingUpIcon sx={{ color: "#059669", fontSize: 22 }} />}
              label="Total Collected"
              value={`₹${totalCollected.toLocaleString("en-IN")}`}
              color="#059669" bgcolor="#dcfce7"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={<ReceiptIcon sx={{ color: "#7c3aed", fontSize: 22 }} />}
              label="Successful Payments"
              value={successful.length}
              color="#7c3aed" bgcolor="#f3e8ff"
            />
          </Grid>
        </Grid>
      )}

      {/* Transactions Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0f2fe", overflow: "hidden", boxShadow: "0 2px 12px rgba(8,145,178,0.06)" }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setSearch(""); }}
          sx={{
            bgcolor: "#f8fbff", borderBottom: "1px solid #e0f2fe",
            "& .MuiTab-root": { fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "0.8rem", textTransform: "none", minHeight: 44 },
            "& .Mui-selected": { color: "#0891b2" },
            "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
          }}>
          <Tab label={`All Transactions (${transactions.length})`} />
          <Tab label={`Successful (${successful.length})`} />
        </Tabs>

        {/* Search */}
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#f8fbff", borderBottom: "1px solid #e0f2fe" }}>
          <TextField
            placeholder="Search by resident, flat, order ID or status..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            size="small" fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontFamily: "Inter, sans-serif", fontSize: "0.82rem", "&.Mui-focused fieldset": { borderColor: "#0891b2" } } }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment>,
                endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch("")}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment> : null,
              }
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1, borderRadius: 1.5 }} />
            ))}
          </Box>
        ) : <TransactionTable data={filtered} />}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#f8fbff", borderTop: "1px solid #e0f2fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "#94a3b8" }}>
              Showing {filtered.length} of {displayData.length} transactions
            </Typography>
            <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
              Last updated: {fund?.lastUpdated ? new Date(fund.lastUpdated).toLocaleString("en-IN") : "—"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Transaction Detail Modal */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1e293b", borderBottom: "1px solid #e0f2fe", py: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon sx={{ color: "#0891b2", fontSize: 18 }} />
          Transaction Details
          {selected && <StatusChip status={selected.status} />}
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 2 }}>
            {[
              ["Transaction ID", `#${selected.id}`],
              ["Bill ID", `#${selected.billId || "—"}`],
              ["Resident", selected.residentName || "—"],
              ["Flat", selected.flatNumber || "—"],
              ["Amount", selected.amountPaid ? `₹${Number(selected.amountPaid).toLocaleString("en-IN")}` : "—"],
              ["Status", selected.status],
              ["Razorpay Order ID", selected.razorpayOrderId || "—"],
              ["Razorpay Payment ID", selected.razorpayPaymentId || "—"],
              ["Date", selected.createdAt ? new Date(selected.createdAt).toLocaleString("en-IN") : "—"],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #f1f5f9", alignItems: "flex-start", gap: 2 }}>
                <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "#64748b", fontWeight: 500, flexShrink: 0 }}>{label}</Typography>
                <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "#1e293b", fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>{value}</Typography>
              </Box>
            ))}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0f2fe" }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ fontFamily: "Inter, sans-serif", color: "#64748b", textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default PaymentsPage;