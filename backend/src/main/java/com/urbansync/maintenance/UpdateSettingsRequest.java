package com.urbansync.maintenance;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSettingsRequest {

    @NotNull(message = "Maintenance amount is required")
    private BigDecimal maintenanceAmount;

    @NotNull(message = "Fine per day is required")
    private BigDecimal dueFinePerDay;

    @NotNull(message = "Validity days is required")
    private Integer validityDays;

}