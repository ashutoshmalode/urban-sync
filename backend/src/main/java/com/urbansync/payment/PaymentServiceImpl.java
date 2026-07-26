package com.urbansync.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;
import com.urbansync.maintenance.MaintenanceBill;
import com.urbansync.maintenance.MaintenanceBillRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final SocietyFundRepository societyFundRepository;
    private final MaintenanceBillRepository billRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public PaymentServiceImpl(
            PaymentTransactionRepository transactionRepository,
            SocietyFundRepository societyFundRepository,
            MaintenanceBillRepository billRepository) {

        this.transactionRepository = transactionRepository;
        this.societyFundRepository = societyFundRepository;
        this.billRepository = billRepository;
    }

    @Override
    @Transactional
    public PaymentOrderResponse createOrder(
            PaymentOrderRequest request) {

        MaintenanceBill bill = billRepository
                .findById(request.getBillId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bill not found."));

        if (bill.getStatus().equals("PAID")) {
            throw new BadRequestException(
                    "Bill is already paid.");
        }

        try {
            RazorpayClient client = new RazorpayClient(
                    keyId, keySecret);

            JSONObject orderRequest = new JSONObject();

            // Razorpay amount is in paise (1 rupee = 100 paise)
            orderRequest.put("amount",
                    bill.getTotalAmount()
                            .multiply(BigDecimal.valueOf(100))
                            .intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "bill_" + bill.getId());

            Order order = client.orders.create(orderRequest);

            // Save pending transaction
            PaymentTransaction transaction =
                    PaymentTransaction.builder()
                            .bill(bill)
                            .razorpayOrderId(
                                    order.get("id").toString())
                            .amountPaid(bill.getTotalAmount())
                            .status("PENDING")
                            .createdAt(LocalDateTime.now())
                            .build();

            transactionRepository.save(transaction);

            return PaymentOrderResponse.builder()
                    .razorpayOrderId(order.get("id").toString())
                    .amount(bill.getTotalAmount())
                    .currency("INR")
                    .keyId(keyId)
                    .billId(bill.getId())
                    .build();

        } catch (RazorpayException e) {
            throw new BadRequestException(
                    "Failed to create Razorpay order: "
                    + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentTransactionDTO verifyPayment(
            PaymentVerifyRequest request) {

        // Verify signature
        String generated = generateSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId());

        if (!generated.equals(request.getRazorpaySignature())) {
            throw new BadRequestException(
                    "Invalid payment signature.");
        }

        // Find transaction
        PaymentTransaction transaction = transactionRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Transaction not found."));

        // Update transaction
        transaction.setRazorpayPaymentId(
                request.getRazorpayPaymentId());
        transaction.setStatus("SUCCESS");
        transactionRepository.save(transaction);

        // Mark bill as paid
        MaintenanceBill bill = transaction.getBill();
        bill.setStatus("PAID");
        bill.setPaidAt(LocalDateTime.now());
        billRepository.save(bill);

        // Credit society fund
        SocietyFund fund = societyFundRepository
                .findFirstByOrderByIdAsc()
                .orElseGet(() -> SocietyFund.builder()
                        .balance(BigDecimal.ZERO)
                        .build());

        fund.setBalance(
                fund.getBalance().add(transaction.getAmountPaid()));
        fund.setLastUpdated(LocalDateTime.now());
        societyFundRepository.save(fund);

        return PaymentMapper.toDTO(transaction);
    }

    @Override
    public SocietyFundDTO getFundBalance() {
        return societyFundRepository
                .findFirstByOrderByIdAsc()
                .map(PaymentMapper::toFundDTO)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Society fund not found."));
    }

    @Override
    public List<PaymentTransactionDTO> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentTransactionDTO> getTransactionsByBillId(
            Long billId) {
        return transactionRepository
                .findByBillId(billId)
                .stream()
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Generate HMAC SHA256 signature for verification
    private String generateSignature(
            String orderId, String paymentId) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec =
                    new SecretKeySpec(
                            keySecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes());

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();

        } catch (Exception e) {
            throw new BadRequestException(
                    "Signature generation failed.");
        }
    }

}