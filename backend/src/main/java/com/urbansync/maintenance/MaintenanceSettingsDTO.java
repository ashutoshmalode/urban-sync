package com.urbansync.maintenance;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceSettingsDTO {

    private Long id;
    private BigDecimal maintenanceAmount;
    private BigDecimal dueFinePerDay;
    private Integer validityDays;
    private LocalDateTime lastUpdatedAt;

}