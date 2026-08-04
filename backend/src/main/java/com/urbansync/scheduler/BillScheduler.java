package com.urbansync.scheduler;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.urbansync.maintenance.GlobalMaintenanceSetting;
import com.urbansync.maintenance.GlobalMaintenanceSettingsRepository;
import com.urbansync.maintenance.MaintenanceBill;
import com.urbansync.maintenance.MaintenanceBillRepository;
import com.urbansync.property.Flat;
import com.urbansync.property.FlatRepository;

@Component
public class BillScheduler {

    private final FlatRepository flatRepository;
    private final MaintenanceBillRepository billRepository;
    private final GlobalMaintenanceSettingsRepository settingsRepository;
    private final SchedulerLogRepository logRepository;

    public BillScheduler(
            FlatRepository flatRepository,
            MaintenanceBillRepository billRepository,
            GlobalMaintenanceSettingsRepository settingsRepository,
            SchedulerLogRepository logRepository) {

        this.flatRepository = flatRepository;
        this.billRepository = billRepository;
        this.settingsRepository = settingsRepository;
        this.logRepository = logRepository;
    }

    // Runs on 1st of every month at 8:00 AM
    @Scheduled(cron = "0 0 8 1 * *")
    @Transactional
    public void generateMonthlyBills() {

        String jobName = "MONTHLY_BILL_GENERATION";
        int processed = 0;

        try {
            GlobalMaintenanceSetting settings = settingsRepository
                    .findFirstByOrderByIdAsc()
                    .orElseThrow(() ->
                            new RuntimeException("Maintenance settings not found"));

            LocalDate today = LocalDate.now();
            int month = today.getMonthValue();
            int year = today.getYear();

            LocalDate dueDate = LocalDate.of(year, month, settings.getValidityDays());

            List<Flat> flats = flatRepository.findAllByOrderByFlatNumberAsc();

            for (Flat flat : flats) {
                if (flat.getOwner() == null) continue;

                // Skip if bill already exists
                boolean exists = billRepository
                        .existsByFlatIdAndBillMonthAndBillYear(
                                flat.getId(), month, year);
                if (exists) continue;

                // Determine resident — tenant first, else owner
                var resident = flat.getCurrentTenant() != null
                        ? flat.getCurrentTenant()
                        : flat.getOwner();

                MaintenanceBill bill = MaintenanceBill.builder()
                        .flat(flat)
                        .resident(resident)
                        .baseAmount(settings.getMaintenanceAmount())
                        .fineAmount(BigDecimal.ZERO)
                        .totalAmount(settings.getMaintenanceAmount())
                        .status("PENDING")
                        .billMonth(month)
                        .billYear(year)
                        .dueDate(dueDate)
                        .createdAt(LocalDateTime.now())
                        .build();

                billRepository.save(bill);
                processed++;
            }

            saveLog(jobName, "SUCCESS",
                    "Generated " + processed + " bills for "
                    + month + "/" + year, processed);

        } catch (Exception e) {
            saveLog(jobName, "FAILED", e.getMessage(), processed);
        }
    }

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void recalculateFines() {

        String jobName = "DAILY_FINE_RECALCULATION";
        int processed = 0;

        try {
            GlobalMaintenanceSetting settings = settingsRepository
                    .findFirstByOrderByIdAsc()
                    .orElseThrow(() ->
                            new RuntimeException("Maintenance settings not found"));

            LocalDate today = LocalDate.now();

            List<MaintenanceBill> pendingBills =
                    billRepository.findAllPending();

            for (MaintenanceBill bill : pendingBills) {
                if (today.isAfter(bill.getDueDate())) {
                    long daysOverdue = today.toEpochDay()
                            - bill.getDueDate().toEpochDay();

                    BigDecimal fine = settings.getDueFinePerDay()
                            .multiply(BigDecimal.valueOf(daysOverdue));

                    bill.setFineAmount(fine);
                    bill.setTotalAmount(bill.getBaseAmount().add(fine));
                    billRepository.save(bill);
                    processed++;
                }
            }

            saveLog(jobName, "SUCCESS",
                    "Recalculated fines for " + processed + " bills",
                    processed);

        } catch (Exception e) {
            saveLog(jobName, "FAILED", e.getMessage(), processed);
        }
    }

    private void saveLog(String jobName, String status,
            String message, int processed) {
        SchedulerLog log = SchedulerLog.builder()
                .jobName(jobName)
                .status(status)
                .message(message)
                .recordsProcessed(processed)
                .ranAt(LocalDateTime.now())
                .build();
        logRepository.save(log);
    }

}