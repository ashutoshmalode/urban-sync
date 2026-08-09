import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
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

const StatCard = ({ icon, label, value, color, bgcolor }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2 },
      borderRadius: 3,
      border: "1px solid #e0f2fe",
      boxShadow: "0 2px 12px rgba(8,145,178,0.06)",
      display: "flex",
      alignItems: "center",
      gap: { xs: 1.2, sm: 2 },
    }}
  >
    <Box
      sx={{
        width: { xs: 36, sm: 44 },
        height: { xs: 36, sm: 44 },
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
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: { xs: "0.6rem", sm: "0.7rem" },
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: { xs: "0.95rem", sm: "1.1rem" },
          fontWeight: 800,
          color,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
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
        fontSize: "0.62rem",
        fontFamily: "Inter, sans-serif",
        height: 20,
      }}
    />
  );
};

const DetailRow = ({ label, value }) => (
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
        fontSize: { xs: "0.7rem", sm: "0.8rem" },
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
        fontSize: { xs: "0.72rem", sm: "0.82rem" },
        color: "#1e293b",
        fontWeight: 600,
        textAlign: "right",
        wordBreak: "break-all",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const PaymentsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [transactions, setTransactions] = useState([]);
  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);
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

  const successful = transactions.filter((t) => t.status === "SUCCESS");
  const pending = transactions.filter((t) => t.status === "PENDING");
  const displayData = tab === 0 ? transactions : successful;
  const filtered = displayData.filter(
    (t) =>
      !search ||
      t.razorpayOrderId?.toLowerCase().includes(search.toLowerCase()) ||
      t.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase()) ||
      t.status?.toLowerCase().includes(search.toLowerCase()) ||
      String(t.billId)?.includes(search) ||
      t.residentName?.toLowerCase().includes(search.toLowerCase()) ||
      t.flatNumber?.toLowerCase().includes(search.toLowerCase()),
  );
  const totalCollected = successful.reduce(
    (sum, t) => sum + Number(t.amountPaid || 0),
    0,
  );

  const TransactionTable = ({ data }) =>
    data.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <ReceiptIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            color: "#94a3b8",
            fontSize: "0.85rem",
          }}
        >
          {search ? "No transactions match your search" : "No transactions yet"}
        </Typography>
      </Box>
    ) : (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headSx}>Bill</TableCell>
              <TableCell sx={headSx}>Resident</TableCell>
              <TableCell sx={headSx}>Flat</TableCell>
              <TableCell sx={headSx}>Order ID</TableCell>
              <TableCell sx={headSx}>Amount</TableCell>
              <TableCell sx={headSx}>Status</TableCell>
              <TableCell sx={headSx}>Date</TableCell>
              <TableCell sx={headSx} align="center">
                Details
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((t) => (
              <TableRow
                key={t.id}
                hover
                sx={{ "&:hover": { bgcolor: "#f8fbff" } }}
              >
                <TableCell sx={cellSx}>
                  <Chip
                    label={`#${t.billId || "-"}`}
                    size="small"
                    sx={{
                      bgcolor: "#f1f5f9",
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: "0.62rem",
                      fontFamily: "Inter, sans-serif",
                      height: 20,
                    }}
                  />
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    {t.residentName || "-"}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  {t.flatNumber ? (
                    <Chip
                      label={t.flatNumber}
                      size="small"
                      sx={{
                        bgcolor: "#e0f2fe",
                        color: "#0891b2",
                        fontWeight: 600,
                        fontSize: "0.62rem",
                        fontFamily: "Inter, sans-serif",
                        height: 20,
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell sx={{ ...cellSx, maxWidth: 120 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.7rem",
                      color: "#64748b",
                    }}
                  >
                    {t.razorpayOrderId || "-"}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      color: t.status === "SUCCESS" ? "#059669" : "#d97706",
                      fontSize: "0.78rem",
                    }}
                  >
                    {t.amountPaid
                      ? `₹${Number(t.amountPaid).toLocaleString("en-IN")}`
                      : "-"}
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
                      })
                    : "-"}
                </TableCell>
                <TableCell align="center" sx={{ py: 0.8, px: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelected(t);
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
          <PaymentIcon sx={{ color: "#0891b2", fontSize: 18 }} />
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
            Payments
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "#64748b",
            }}
          >
            {isMobile
              ? "Fund & transactions"
              : "Society fund and transaction history"}
          </Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      {loading ? (
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Skeleton
                variant="rounded"
                height={72}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={
                <AccountBalanceWalletIcon
                  sx={{ color: "#0891b2", fontSize: { xs: 18, sm: 22 } }}
                />
              }
              label={isMobile ? "Fund Balance" : "Society Fund Balance"}
              value={
                fund ? `₹${Number(fund.balance).toLocaleString("en-IN")}` : "-"
              }
              color="#0891b2"
              bgcolor="#e0f2fe"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={
                <TrendingUpIcon
                  sx={{ color: "#059669", fontSize: { xs: 18, sm: 22 } }}
                />
              }
              label="Collected"
              value={`₹${totalCollected.toLocaleString("en-IN")}`}
              color="#059669"
              bgcolor="#dcfce7"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={
                <ReceiptIcon
                  sx={{ color: "#7c3aed", fontSize: { xs: 18, sm: 22 } }}
                />
              }
              label="Successful"
              value={successful.length}
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
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setSearch("");
          }}
          variant="fullWidth"
          sx={{
            bgcolor: "#f8fbff",
            borderBottom: "1px solid #e0f2fe",
            "& .MuiTab-root": {
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              textTransform: "none",
              minHeight: 42,
            },
            "& .Mui-selected": { color: "#0891b2" },
            "& .MuiTabs-indicator": { bgcolor: "#0891b2" },
          }}
        >
          <Tab label={`All (${transactions.length})`} />
          <Tab label={`Successful (${successful.length})`} />
        </Tabs>

        {/* Search */}
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            py: 1.2,
            bgcolor: "#f8fbff",
            borderBottom: "1px solid #e0f2fe",
          }}
        >
          <TextField
            placeholder={
              isMobile ? "Search..." : "Search by resident, flat, order ID..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.75rem", sm: "0.82rem" },
                "&.Mui-focused fieldset": { borderColor: "#0891b2" },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <ClearIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </Box>

        {loading ? (
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
        ) : (
          <TransactionTable data={filtered} />
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <Box
            sx={{
              px: { xs: 1.5, sm: 2.5 },
              py: 1.2,
              bgcolor: "#f8fbff",
              borderTop: "1px solid #e0f2fe",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                color: "#94a3b8",
              }}
            >
              {filtered.length} of {displayData.length} transactions
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              Updated:{" "}
              {fund?.lastUpdated
                ? new Date(fund.lastUpdated).toLocaleDateString("en-IN")
                : "-"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Transaction Detail Modal */}
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
          Transaction Details
          {selected && <StatusChip status={selected.status} />}
        </DialogTitle>
        {selected && (
          <DialogContent sx={{ pt: 1.5, px: 2 }}>
            <DetailRow label="Transaction ID" value={`#${selected.id}`} />
            <DetailRow label="Bill ID" value={`#${selected.billId || "-"}`} />
            <DetailRow label="Resident" value={selected.residentName || "-"} />
            <DetailRow label="Flat" value={selected.flatNumber || "-"} />
            <DetailRow
              label="Amount"
              value={
                selected.amountPaid
                  ? `₹${Number(selected.amountPaid).toLocaleString("en-IN")}`
                  : "-"
              }
            />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow
              label="Order ID"
              value={selected.razorpayOrderId || "-"}
            />
            <DetailRow
              label="Payment ID"
              value={selected.razorpayPaymentId || "-"}
            />
            <DetailRow
              label="Date"
              value={
                selected.createdAt
                  ? new Date(selected.createdAt).toLocaleString("en-IN")
                  : "-"
              }
            />
          </DialogContent>
        )}
        <DialogActions sx={{ p: 1.5, px: 2, borderTop: "1px solid #e0f2fe" }}>
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
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsPage;
