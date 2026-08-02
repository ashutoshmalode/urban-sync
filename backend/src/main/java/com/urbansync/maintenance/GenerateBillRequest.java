package com.urbansync.maintenance;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateBillRequest {

    @NotNull(message = "Flat ID is required")
    private Long flatId;

    @NotNull(message = "Resident ID is required")
    private Long residentId;

    @NotNull(message = "Bill month is required")
    private Integer billMonth;

    @NotNull(message = "Bill year is required")
    private Integer billYear;

}