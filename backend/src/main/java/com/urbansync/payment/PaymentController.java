package com.urbansync.payment;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @Valid @RequestBody PaymentOrderRequest request) {

        return ResponseEntity.ok(
                paymentService.createOrder(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentTransactionDTO> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {

        return ResponseEntity.ok(
                paymentService.verifyPayment(request));
    }

    @GetMapping("/fund/balance")
    public ResponseEntity<SocietyFundDTO> getFundBalance() {

        return ResponseEntity.ok(
                paymentService.getFundBalance());
    }

    @GetMapping("/transactions/all")
    public ResponseEntity<List<PaymentTransactionDTO>>
            getAllTransactions() {

        return ResponseEntity.ok(
                paymentService.getAllTransactions());
    }

    @GetMapping("/transactions/bill/{billId}")
    public ResponseEntity<List<PaymentTransactionDTO>>
            getByBillId(@PathVariable Long billId) {

        return ResponseEntity.ok(
                paymentService.getTransactionsByBillId(billId));
    }

}