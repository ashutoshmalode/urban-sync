package com.urbansync.resident;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.urbansync.config.security.CustomUserDetails;



@RestController
@RequestMapping("/api")
public class ResidentController {

    private final ResidentService residentService;

    public ResidentController(ResidentService residentService) {
        this.residentService = residentService;
    }

    @GetMapping("/resident/me")
    public ResponseEntity<ResidentDTO> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                residentService.getByMobile(
                        userDetails.getUsername()));
    }
    
    @GetMapping("/resident/profile")
    public ResponseEntity<ResidentDTO> getMyResidentProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String flatNumber) {
        return ResponseEntity.ok(
                residentService.getByMobileAndFlat(
                        userDetails.getUsername(), flatNumber));
    }

}