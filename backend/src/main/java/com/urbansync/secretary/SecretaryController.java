package com.urbansync.secretary;

import org.springframework.http.ResponseEntity;
import jakarta.validation.constraints.Email;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/secretary")
public class SecretaryController {

    private final SecretaryService secretaryService;

    public SecretaryController(SecretaryService secretaryService) {
        this.secretaryService = secretaryService;
    }

    @PostMapping("/register")
    public ResponseEntity<SecretaryDTO> register(
            @Valid @RequestBody SecretaryRegisterRequest request) {
        return ResponseEntity.ok(secretaryService.register(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<SecretaryDTO> getProfile() {
        return ResponseEntity.ok(secretaryService.getProfile());
    }

    @GetMapping("/is-registered")
    public ResponseEntity<Boolean> isRegistered() {
        return ResponseEntity.ok(secretaryService.isSecretaryRegistered());
    }

    // Fix 7 — new endpoints
    @PostMapping("/send-email-otp")
    public ResponseEntity<String> sendEmailOtp() {
        secretaryService.sendEmailOtp();
        return ResponseEntity.ok("OTP sent to registered email");
    }

    @PutMapping("/profile")
    public ResponseEntity<SecretaryDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(secretaryService.updateProfile(request));
    }
    
    // Forgot Password — PUBLIC (no auth needed)
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<String> sendForgotPasswordOtp(
            @RequestParam @Email String email) {
        secretaryService.sendForgotPasswordOtp(email);
        return ResponseEntity.ok("OTP sent to your registered email");
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        secretaryService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }
}