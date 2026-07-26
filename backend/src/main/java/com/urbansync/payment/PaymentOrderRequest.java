package com.urbansync.payment;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrderRequest {

    @NotNull(message = "Bill ID is required")
    private Long billId;

}