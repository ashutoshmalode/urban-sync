package com.urbansync.payment;

public class PaymentMapper {

    private PaymentMapper() {}

    public static PaymentTransactionDTO toDTO(
            PaymentTransaction transaction) {
        return PaymentTransactionDTO.builder()
                .id(transaction.getId())
                .billId(transaction.getBill().getId())
                .razorpayOrderId(transaction.getRazorpayOrderId())
                .razorpayPaymentId(transaction.getRazorpayPaymentId())
                .amountPaid(transaction.getAmountPaid())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    public static SocietyFundDTO toFundDTO(SocietyFund fund) {
        return SocietyFundDTO.builder()
                .id(fund.getId())
                .balance(fund.getBalance())
                .lastUpdated(fund.getLastUpdated())
                .build();
    }

}