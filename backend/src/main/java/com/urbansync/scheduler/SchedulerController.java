package com.urbansync.scheduler;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scheduler")
public class SchedulerController {

    private final SchedulerLogRepository logRepository;
    private final BillScheduler billScheduler;

    public SchedulerController(
            SchedulerLogRepository logRepository,
            BillScheduler billScheduler) {
        this.logRepository = logRepository;
        this.billScheduler = billScheduler;
    }

    @GetMapping("/logs")
    public ResponseEntity<List<SchedulerLogDTO>> getLogs() {
        List<SchedulerLogDTO> logs = logRepository
                .findTop10ByOrderByRanAtDesc()
                .stream()
                .map(l -> SchedulerLogDTO.builder()
                        .id(l.getId())
                        .jobName(l.getJobName())
                        .status(l.getStatus())
                        .message(l.getMessage())
                        .recordsProcessed(l.getRecordsProcessed())
                        .ranAt(l.getRanAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/run/monthly-bills")
    public ResponseEntity<String> runMonthlyBills() {
        billScheduler.generateMonthlyBills();
        return ResponseEntity.ok(
                "Monthly bill generation completed successfully");
    }

    @PostMapping("/run/fine-recalculation")
    public ResponseEntity<String> runFineRecalculation() {
        billScheduler.recalculateFines();
        return ResponseEntity.ok(
                "Fine recalculation completed successfully");
    }

}