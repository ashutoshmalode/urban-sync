import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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

const ResidentBillsPage = () => {
  const flatNumber = useSelector((state) => state.auth.flatNumber);
  const [profile, setProfile] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileRes = await axiosInstance.get(
        `/api/resident/profile?flatNumber=${flatNumber}`,
      );
      setProfile(profileRes.data);
      const billsRes = await axiosInstance.get(
        `/api/maintenance/bills/resident/${profileRes.data.id}`,
      );
      setBills(billsRes.data);
    } catch {
      showError("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flatNumber) loadData();
  }, [flatNumber]);

  const handlePayNow = async (bill) => {
    setPayingBillId(bill.id);
    try {
      // Create Razorpay order
      const orderRes = await axiosInstance.post("/api/payment/create-order", {
        billId: bill.id,
      });
      console.log("Order response:", orderRes.data);

      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount, // already in paise from backend — don't multiply again
        currency: currency,
        name: "UrbanSync",
        description: `Maintenance Bill — ${MONTHS[bill.billMonth - 1]} ${bill.billYear}`,
        order_id: razorpayOrderId, // field is razorpayOrderId not orderId
        handler: async (response) => {
          try {
            await axiosInstance.post("/api/payment/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              billId: bill.id,
            });
            showSuccess("Payment successful! Bill marked as paid.");
            loadData();
          } catch {
            showError("Payment verification failed. Contact secretary.");
          }
        },
        prefill: {
          contact: profile?.mobileNumber,
        },
        theme: { color: "#0891b2" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPayingBillId(null);
    }
  };

  const pendingBills = bills.filter((b) => b.status === "PENDING");
  const paidBills = bills.filter((b) => b.status === "PAID");

  const LoadingSkeleton = () => (
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
  );

  return (
    <Box>
      {/* Header */}
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
        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "#1e293b",
            }}
          >
            My Bills
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            Flat {flatNumber} — Maintenance history
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mb: 2.5,
        }}
      >
        {[
          { label: "Total Bills", value: bills.length, color: "#0891b2" },
          { label: "Pending", value: pendingBills.length, color: "#dc2626" },
          { label: "Paid", value: paidBills.length, color: "#059669" },
        ].map((s) => (
          <Paper
            key={s.label}
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
              }}
            >
              {s.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: s.color,
              }}
            >
              {loading ? "—" : s.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Bills Table */}
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
          <LoadingSkeleton />
        ) : bills.length === 0 ? (
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
                  <TableCell sx={headSx}>Month</TableCell>
                  <TableCell sx={headSx}>Base Amount</TableCell>
                  <TableCell sx={headSx}>Fine</TableCell>
                  <TableCell sx={headSx}>Total</TableCell>
                  <TableCell sx={headSx}>Due Date</TableCell>
                  <TableCell sx={headSx}>Status</TableCell>
                  <TableCell sx={headSx} align="center">
                    Action
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
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        {MONTHS[bill.billMonth - 1]} {bill.billYear}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      ₹{Number(bill.baseAmount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {Number(bill.fineAmount) > 0 ? (
                        <Typography
                          sx={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "0.82rem",
                            color: "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          +₹{Number(bill.fineAmount).toLocaleString("en-IN")}
                        </Typography>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color:
                            bill.status === "PENDING" ? "#dc2626" : "#059669",
                        }}
                      >
                        ₹{Number(bill.totalAmount).toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {bill.dueDate
                        ? new Date(bill.dueDate).toLocaleDateString("en-IN")
                        : "—"}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={bill.status}
                        size="small"
                        sx={{
                          bgcolor:
                            bill.status === "PAID" ? "#dcfce7" : "#fee2e2",
                          color: bill.status === "PAID" ? "#166534" : "#991b1b",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          fontFamily: "Inter, sans-serif",
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      {bill.status === "PENDING" ? (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handlePayNow(bill)}
                          disabled={payingBillId === bill.id}
                          startIcon={<PaymentIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            bgcolor: "#0891b2",
                            borderRadius: 2,
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "none",
                            px: 1.5,
                            "&:hover": { bgcolor: "#0e7490" },
                          }}
                        >
                          {payingBillId === bill.id ? "Opening..." : "Pay Now"}
                        </Button>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            justifyContent: "center",
                          }}
                        >
                          <CheckCircleIcon
                            sx={{ fontSize: 16, color: "#059669" }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "0.75rem",
                              color: "#059669",
                              fontWeight: 600,
                            }}
                          >
                            {bill.paidAt
                              ? new Date(bill.paidAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : "Paid"}
                          </Typography>
                        </Box>
                      )}
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

export default ResidentBillsPage;
