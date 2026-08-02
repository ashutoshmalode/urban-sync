package com.urbansync.maintenance;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("/settings")
    public ResponseEntity<MaintenanceSettingsDTO> getSettings() {
        return ResponseEntity.ok(maintenanceService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<MaintenanceSettingsDTO> updateSettings(
            @Valid @RequestBody UpdateSettingsRequest request) {
        return ResponseEntity.ok(
                maintenanceService.updateSettings(request));
    }

    @PostMapping("/bills/generate")
    public ResponseEntity<MaintenanceBillDTO> generateBill(
            @Valid @RequestBody GenerateBillRequest request) {
        return ResponseEntity.ok(
                maintenanceService.generateBill(request));
    }

    @GetMapping("/bills/all")
    public ResponseEntity<List<MaintenanceBillDTO>> getAllBills() {
        return ResponseEntity.ok(maintenanceService.getAllBills());
    }

    @GetMapping("/bills/pending")
    public ResponseEntity<List<MaintenanceBillDTO>> getPendingBills() {
        return ResponseEntity.ok(maintenanceService.getPendingBills());
    }

    @GetMapping("/bills/paid")
    public ResponseEntity<List<MaintenanceBillDTO>> getPaidBills() {
        return ResponseEntity.ok(maintenanceService.getPaidBills());
    }

    @GetMapping("/bills/resident/{residentId}")
    public ResponseEntity<List<MaintenanceBillDTO>> getByResident(
            @PathVariable Long residentId) {
        return ResponseEntity.ok(
                maintenanceService.getBillsByResident(residentId));
    }

    @GetMapping("/bills/flat/{flatId}")
    public ResponseEntity<List<MaintenanceBillDTO>> getByFlat(
            @PathVariable Long flatId) {
        return ResponseEntity.ok(
                maintenanceService.getBillsByFlat(flatId));
    }

    @PutMapping("/bills/{billId}/pay")
    public ResponseEntity<MaintenanceBillDTO> markAsPaid(
            @PathVariable Long billId) {
        return ResponseEntity.ok(
                maintenanceService.markAsPaid(billId));
    }

}