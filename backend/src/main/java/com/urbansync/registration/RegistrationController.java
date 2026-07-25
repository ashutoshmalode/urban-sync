package com.urbansync.registration;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/registration")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(
            RegistrationService registrationService) {

        this.registrationService = registrationService;
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

}