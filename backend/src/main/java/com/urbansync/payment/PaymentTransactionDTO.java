package com.urbansync.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionDTO {

    private Long id;
    private Long billId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private BigDecimal amountPaid;
    private String status;
    private LocalDateTime createdAt;

}