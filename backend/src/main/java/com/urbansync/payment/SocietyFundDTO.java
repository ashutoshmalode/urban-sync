package com.urbansync.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocietyFundDTO {

    private Long id;
    private BigDecimal balance;
    private LocalDateTime lastUpdated;

}