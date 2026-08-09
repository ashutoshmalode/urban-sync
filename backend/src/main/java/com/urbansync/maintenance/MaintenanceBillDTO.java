package com.urbansync.maintenance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceBillDTO {

    private Long id;
    private Long flatId;
    private String flatNumber;
    private Long residentId;
    private String residentName;
    private BigDecimal baseAmount;
    private BigDecimal fineAmount;
    private BigDecimal totalAmount;
    private String status;
    private Integer billMonth;
    private Integer billYear;
    private LocalDate dueDate;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

}