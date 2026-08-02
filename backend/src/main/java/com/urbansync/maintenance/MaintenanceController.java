package com.urbansync.maintenance;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final com.urbansync.property.FlatRepository flatRepository;

    public MaintenanceController(
            MaintenanceService maintenanceService,
            com.urbansync.property.FlatRepository flatRepository) {
        this.maintenanceService = maintenanceService;
        this.flatRepository = flatRepository;
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
    
    @GetMapping("/bills/flat-info")
    @Transactional
    public ResponseEntity<?> getFlatInfo(
            @RequestParam String wingName,
            @RequestParam String flatNumber) {

        String fullFlatNumber = wingName + "-" + flatNumber;

        return flatRepository.findByFlatNumber(fullFlatNumber)
                .map(flat -> {
                    java.util.Map<String, Object> info = new java.util.LinkedHashMap<>();
                    info.put("flatId", flat.getId());
                    info.put("flatNumber", flat.getFlatNumber());

                    if (flat.getCurrentTenant() != null) {
                        info.put("residentId", flat.getCurrentTenant().getId());
                        info.put("residentName",
                                flat.getCurrentTenant().getFirstName() + " "
                                + flat.getCurrentTenant().getLastName());
                        info.put("residentType", "TENANT");
                    } else if (flat.getOwner() != null) {
                        info.put("residentId", flat.getOwner().getId());
                        info.put("residentName",
                                flat.getOwner().getFirstName() + " "
                                + flat.getOwner().getLastName());
                        info.put("residentType", "OWNER");
                    } else {
                        info.put("residentId", null);
                        info.put("residentName", null);
                        info.put("residentType", null);
                    }

                    return ResponseEntity.ok(info);
                })
                .orElse(ResponseEntity.ok(null));
    }

}