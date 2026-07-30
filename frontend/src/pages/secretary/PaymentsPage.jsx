import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  // Avatar,
  Grid,
  // Divider,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptIcon from "@mui/icons-material/Receipt";
import axiosInstance from "../../api/axiosInstance";

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

const StatCard = ({ icon, label, value, color, bgcolor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      border: "1px solid #e0f2fe",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
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
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: "1.1rem",
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Paper>
);

const StatusChip = ({ status }) => {
  const map = {
    SUCCESS: { label: "Success", bgcolor: "#dcfce7", color: "#166534" },
    PENDING: { label: "Pending", bgcolor: "#fef9c3", color: "#854d0e" },
    FAILED: { label: "Failed", bgcolor: "#fee2e2", color: "#991b1b" },
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

const PaymentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, showError] = useState("");
  const [search, setSearch] = useState("");

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

  const filtered = transactions.filter(
    (t) =>
      !search ||
      t.razorpayOrderId?.toLowerCase().includes(search.toLowerCase()) ||
      t.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase()) ||
      t.status?.toLowerCase().includes(search.toLowerCase()) ||
      String(t.billId)?.includes(search),
  );

  const successCount = transactions.filter(
    (t) => t.status === "SUCCESS",
  ).length;
  const totalCollected = transactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((sum, t) => sum + Number(t.amountPaid || 0), 0);

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
          <PaymentIcon sx={{ color: "#0891b2", fontSize: 20 }} />
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
            Payments
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Society fund and transaction history
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => showError("")}
          sx={{ mb: 2, borderRadius: 2, fontFamily: "Inter, sans-serif" }}
        >
          {error}
        </Alert>
      )}

      {/* Stat Cards */}
      {loading ? (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {[...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Skeleton
                variant="rounded"
                height={80}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={
                <AccountBalanceWalletIcon
                  sx={{ color: "#0891b2", fontSize: 22 }}
                />
              }
              label="Society Fund Balance"
              value={
                fund ? `₹${Number(fund.balance).toLocaleString("en-IN")}` : "—"
              }
              color="#0891b2"
              bgcolor="#e0f2fe"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={<TrendingUpIcon sx={{ color: "#059669", fontSize: 22 }} />}
              label="Total Collected"
              value={`₹${totalCollected.toLocaleString("en-IN")}`}
              color="#059669"
              bgcolor="#dcfce7"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={<ReceiptIcon sx={{ color: "#7c3aed", fontSize: 22 }} />}
              label="Successful Payments"
              value={successCount}
              color="#7c3aed"
              bgcolor="#f3e8ff"
            />
          </Grid>
        </Grid>
      )}

      {/* Transactions Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0f2fe",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
        }}
      >
        {/* Table Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            bgcolor: "#f8fbff",
            borderBottom: "1px solid #e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#1e293b",
            }}
          >
            Transaction History
          </Typography>
          <TextField
            placeholder="Search by bill ID, order ID or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: 280 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "Inter, sans-serif",
                fontSize: "0.82rem",
                "&.Mui-focused fieldset": { borderColor: "#0891b2" },
              },
            }}
            inputprops={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <ClearIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {loading ? (
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
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <ReceiptIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#94a3b8",
                fontSize: "0.88rem",
              }}
            >
              {search
                ? "No transactions match your search"
                : "No transactions yet"}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Bill ID</TableCell>
                  <TableCell sx={headSx}>Razorpay Order ID</TableCell>
                  <TableCell sx={headSx}>Payment ID</TableCell>
                  <TableCell sx={headSx}>Amount</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
                  >
                    <TableCell sx={cellSx}>
                      <Chip
                        label={`Bill #${t.billId}`}
                        size="small"
                        sx={{
                          bgcolor: "#f1f5f9",
                          color: "#475569",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          fontFamily: "Inter, sans-serif",
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, maxWidth: 160 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.78rem",
                          color: "#64748b",
                          fontStyle: t.razorpayOrderId ? "normal" : "italic",
                        }}
                      >
                        {t.razorpayOrderId || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, maxWidth: 160 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.78rem",
                          color: "#64748b",
                          fontStyle: t.razorpayPaymentId ? "normal" : "italic",
                        }}
                      >
                        {t.razorpayPaymentId || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 700,
                          color: "#059669",
                          fontSize: "0.85rem",
                        }}
                      >
                        {t.amountPaid
                          ? `₹${Number(t.amountPaid).toLocaleString("en-IN")}`
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <StatusChip status={t.status} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Table Footer */}
        {!loading && filtered.length > 0 && (
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: "#f8fbff",
              borderTop: "1px solid #e0f2fe",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                color: "#94a3b8",
              }}
            >
              Showing {filtered.length} of {transactions.length} transactions
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.75rem",
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              Last updated:{" "}
              {fund?.lastUpdated
                ? new Date(fund.lastUpdated).toLocaleString("en-IN")
                : "—"}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentsPage;
