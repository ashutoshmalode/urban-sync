package com.urbansync.dashboard;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/secretary")
    public ResponseEntity<DashboardDTO> getSecretaryDashboard() {
        return ResponseEntity.ok(
                dashboardService.getSecretaryDashboard());
    }

}