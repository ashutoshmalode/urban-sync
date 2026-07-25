package com.urbansync.common;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.urbansync.config.security.CustomUserDetails;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urbansync.auth.Credential;
import com.urbansync.auth.CredentialRepository;
import com.urbansync.wing.Wing;
import com.urbansync.wing.WingRepository;


// This controller is for testing purposes only and should be removed in production.
//It provides endpoints to test the health of the application, 
//retrieve wings and credentials, encode passwords, and check the logged-in user and their role.

@RestController
@RequestMapping("/api/test")
public class HealthController {

    private final WingRepository wingRepository;
    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;

    public HealthController(
            WingRepository wingRepository,
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder) {

        this.wingRepository = wingRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Health Check
    @GetMapping("/health")
    public String health() {
        return "UrbanSync Backend Running Successfully";
    }

    // Wing Test
    @GetMapping("/wings")
    public List<Wing> getWings() {
        return wingRepository.findAll();
    }

    // Credential Entity Test
    @GetMapping("/credential-test")
    public String credentialTest() {

        Credential credential = new Credential();

        credential.setLoginIdentifier("admin");
        credential.setPasswordHash("123456");
        credential.setRole("SECRETARY");

        return credential.getLoginIdentifier();
    }

    // Credential Repository Test
    @GetMapping("/credentials")
    public List<Credential> getCredentials() {
        return credentialRepository.findAll();
    }

    // BCrypt Password Encoder Test
    @GetMapping("/encode/{password}")
    public String encodePassword(@PathVariable String password) {
        return passwordEncoder.encode(password);
    }
    
    // who am i temporary testing endpoint to check the logged in user and their role
    @GetMapping("/whoami")
    public String whoAmI(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return "Not authenticated";
        }
        return "Logged in as: " + userDetails.getUsername() + " | Role: " + userDetails.getCredential().getRole();
    }
    
    // testing of role-based access control for SECRETARY role
    @GetMapping("/secretary-only")
    public String secretaryOnly() {
        return "Welcome Secretary — this is a protected SECRETARY-only resource";
    }
}
