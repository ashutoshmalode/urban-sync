package com.urbansync.payment;

import java.math.BigDecimal;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrderResponse {

    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private String keyId;
    private Long billId;

}