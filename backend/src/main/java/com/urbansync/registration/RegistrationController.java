package com.urbansync.registration;

import java.util.List;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.urbansync.resident.ResidentRepository;
import com.urbansync.resident.ResidentProfile;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/registration")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final ResidentRepository residentRepository;

    public RegistrationController(
            RegistrationService registrationService,
            ResidentRepository residentRepository) {
        this.registrationService = registrationService;
        this.residentRepository = residentRepository;
    }

    @PostMapping("/resident")
    public ResponseEntity<RegistrationRequestDTO> submit(
            @Valid @RequestBody RegistrationSubmitRequest request) {
        return ResponseEntity.ok(
                registrationService.submit(request));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<RegistrationRequestDTO>> getPending() {
        return ResponseEntity.ok(
                registrationService.getPendingRequests());
    }

    @GetMapping("/history")
    public ResponseEntity<List<RegistrationRequestDTO>> getHistory() {
        return ResponseEntity.ok(
                registrationService.getHistory());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<RegistrationRequestDTO> approve(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                registrationService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<RegistrationRequestDTO> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectionRequest request) {
        return ResponseEntity.ok(
                registrationService.reject(id, request));
    }

    @GetMapping("/check-flat")
    public ResponseEntity<Boolean> checkFlat(
            @RequestParam String wingName,
            @RequestParam String flatNumber,
            @RequestParam String residentType) {
        return ResponseEntity.ok(
                registrationService.isFlatOccupied(
                        wingName, flatNumber, residentType));
    }

    @GetMapping("/verify-owner")
    public ResponseEntity<Boolean> verifyOwner(
            @RequestParam String mobileNumber,
            @RequestParam String wingName,
            @RequestParam String flatNumber) {

        String fullFlatNumber = wingName + "-" + flatNumber;

        boolean exists = residentRepository.findAll()
                .stream()
                .filter(r -> r.getMobileNumber() != null
                        && r.getMobileNumber().equals(mobileNumber))
                .filter(r -> r.getStatus() != null
                        && r.getStatus().equals("ACTIVE"))
                .filter(r -> r.getResidentType() != null
                        && r.getResidentType().equals("OWNER"))
                .anyMatch(r -> r.getFlatNumber() != null
                        && r.getFlatNumber().equals(fullFlatNumber));

        return ResponseEntity.ok(exists);
    }

    @GetMapping("/fetch-owner-by-flat")
    public ResponseEntity<?> fetchOwnerByFlat(
            @RequestParam String flatNumber) {

        // Find active owner for this flat
        ResidentProfile owner = residentRepository.findAll()
                .stream()
                .filter(r -> r.getStatus().equals("ACTIVE"))
                .filter(r -> r.getResidentType().equals("OWNER"))
                .filter(r -> r.getFlatNumber() != null
                        && r.getFlatNumber().equals(flatNumber)
                        && r.getFlatNumber().matches("[A-Z]-\\d{1,4}"))
                .findFirst()
                .orElse(null);

        if (owner == null) {
            return ResponseEntity.ok(null);
        }

        // Get ALL valid flats owned by this owner sorted latest first
        List<ResidentProfile> allOwnerFlats = residentRepository.findAll()
                .stream()
                .filter(r -> r.getStatus().equals("ACTIVE"))
                .filter(r -> r.getResidentType().equals("OWNER"))
                .filter(r -> r.getMobileNumber().equals(owner.getMobileNumber()))
                .filter(r -> r.getFlatNumber() != null
                        && r.getFlatNumber().matches("[A-Z]-\\d{1,4}"))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        // Remove the flat tenant wants to rent from candidates
        List<ResidentProfile> candidateFlats = allOwnerFlats.stream()
                .filter(f -> !f.getFlatNumber().equals(flatNumber))
                .collect(Collectors.toList());

        String ownerLivingFlat;

        if (candidateFlats.isEmpty()) {
            // Owner has only 1 flat — renting that same flat
            ownerLivingFlat = flatNumber;
        } else {
            // Find latest candidate flat with no active tenant
            ResidentProfile livingFlat = candidateFlats.stream()
                    .filter(ownerFlat -> {
                        boolean hasTenant = residentRepository.findAll()
                                .stream()
                                .filter(r -> r.getStatus().equals("ACTIVE"))
                                .filter(r -> r.getResidentType().equals("TENANT"))
                                .anyMatch(t -> t.getFlatNumber() != null
                                        && t.getFlatNumber()
                                                .equals(ownerFlat.getFlatNumber()));
                        return !hasTenant;
                    })
                    .findFirst()
                    .orElse(null);

            if (livingFlat != null) {
                // Found a candidate flat with no tenant
                ownerLivingFlat = livingFlat.getFlatNumber();
            } else {
                // All other flats are also rented out
                // Owner is renting his last flat — use entered flat
                ownerLivingFlat = flatNumber;
            }
        }

        // Build response
        Map<String, String> response = new LinkedHashMap<>();
        response.put("landlordName",
                owner.getFirstName() + " " + owner.getLastName());
        response.put("landlordMobile", owner.getMobileNumber());
        response.put("landlordFlat", ownerLivingFlat);

        if (ownerLivingFlat.contains("-")) {
            String[] parts = ownerLivingFlat.split("-", 2);
            response.put("landlordWingName", parts[0]);
            response.put("landlordFlatNumber", parts[1]);
        } else {
            response.put("landlordWingName", "");
            response.put("landlordFlatNumber", ownerLivingFlat);
        }

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/check-pending-tenant")
    public ResponseEntity<Boolean> checkPendingTenant(
            @RequestParam String flatNumber) {
        return ResponseEntity.ok(
                registrationService.hasPendingTenantForFlat(flatNumber));
    }
}