package com.urbansync.payment;

public class PaymentMapper {

    private PaymentMapper() {}

    public static PaymentTransactionDTO toDTO(
            PaymentTransaction transaction) {

        PaymentTransactionDTO.PaymentTransactionDTOBuilder builder =
                PaymentTransactionDTO.builder()
                .id(transaction.getId())
                .razorpayOrderId(transaction.getRazorpayOrderId())
                .razorpayPaymentId(transaction.getRazorpayPaymentId())
                .amountPaid(transaction.getAmountPaid())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt());

        if (transaction.getBill() != null) {
            builder.billId(transaction.getBill().getId());
            builder.billMonth(transaction.getBill().getBillMonth());
            builder.billYear(transaction.getBill().getBillYear());

            if (transaction.getBill().getResident() != null) {
                builder.residentName(
                    transaction.getBill().getResident().getFirstName()
                    + " "
                    + transaction.getBill().getResident().getLastName()
                );
            }

            if (transaction.getBill().getFlat() != null) {
                builder.flatNumber(
                    transaction.getBill().getFlat().getFlatNumber()
                );
            }
        }

        return builder.build();
    }

    public static SocietyFundDTO toFundDTO(SocietyFund fund) {
        return SocietyFundDTO.builder()
                .id(fund.getId())
                .balance(fund.getBalance())
                .lastUpdated(fund.getLastUpdated())
                .build();
    }

}