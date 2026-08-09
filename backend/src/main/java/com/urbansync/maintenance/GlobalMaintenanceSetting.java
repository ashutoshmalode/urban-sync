package com.urbansync.maintenance;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "global_maintenance_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalMaintenanceSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "maintenance_amount", nullable = false)
    private BigDecimal maintenanceAmount;

    @Column(name = "due_fine_per_day", nullable = false)
    private BigDecimal dueFinePerDay;

    @Column(name = "validity_days", nullable = false)
    private Integer validityDays;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    @Column(name = "last_updated_by_secretary_at")
    private LocalDateTime lastUpdatedBySecretaryAt;

}