package com.urbansync.secretary;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.urbansync.auth.Credential;
import com.urbansync.auth.CredentialRepository;
import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;

@Service
public class SecretaryServiceImpl implements SecretaryService {

    private final SecretaryRepository secretaryRepository;
    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecretaryOtpStore otpStore;
    private final RestTemplate restTemplate;

    @Value("${BREVO_API_KEY}")
    private String brevoApiKey;

    public SecretaryServiceImpl(
            SecretaryRepository secretaryRepository,
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder,
            SecretaryOtpStore otpStore) {

        this.secretaryRepository = secretaryRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpStore = otpStore;
        this.restTemplate = new RestTemplate();
    }

    private void sendBrevoEmail(String toEmail, String toName, String subject, String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        Map<String, Object> payload = new HashMap<>();
        payload.put("sender", Map.of("name", "UrbanSync", "email", "malodeashu.dummydata@gmail.com"));
        payload.put("to", List.of(Map.of("email", toEmail, "name", toName)));
        payload.put("subject", subject);
        payload.put("textContent", body);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", request, String.class);
    }

    @Override
    public boolean isSecretaryRegistered() {
        return secretaryRepository.count() > 0;
    }

    @Override
    public SecretaryDTO register(SecretaryRegisterRequest request) {
        if (isSecretaryRegistered())
            throw new BadRequestException("Secretary is already registered.");
        if (secretaryRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already in use.");
        if (secretaryRepository.existsByMobileNumber(request.getMobileNumber()))
            throw new BadRequestException("Mobile number already in use.");

        Credential credential = Credential.builder()
                .loginIdentifier(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("SECRETARY")
                .createdAt(LocalDateTime.now())
                .build();
        credential = credentialRepository.save(credential);

        SecretaryProfile profile = SecretaryProfile.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .flatNumber(request.getFlatNumber())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .ifscCode(request.getIfscCode())
                .credential(credential)
                .createdAt(LocalDateTime.now())
                .build();

        profile = secretaryRepository.save(profile);
        return SecretaryMapper.toDTO(profile);
    }

    @Override
    public SecretaryDTO getProfile() {
        return secretaryRepository.findAll().stream().findFirst()
                .map(SecretaryMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Secretary profile not found."));
    }

    @Override
    public void sendEmailOtp() {
        SecretaryProfile profile = secretaryRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Secretary profile not found."));

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.save(profile.getEmail(), otp);

        sendBrevoEmail(
                profile.getEmail(),
                profile.getFirstName(),
                "UrbanSync — Profile Update OTP",
                "Hello " + profile.getFirstName() + ",\n\n" +
                        "Your OTP for profile update is: " + otp + "\n\n" +
                        "This OTP is valid for 5 minutes.\n" +
                        "Do not share this OTP with anyone.\n\n" +
                        "— UrbanSync System");
    }

    @Override
    @Transactional
    public SecretaryDTO updateProfile(UpdateProfileRequest request) {
        SecretaryProfile profile = secretaryRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Secretary profile not found."));

        Credential credential = profile.getCredential();

        if (!passwordEncoder.matches(request.getCurrentPassword(), credential.getPasswordHash()))
            throw new BadRequestException("Current password is incorrect.");

        if (!otpStore.verify(profile.getEmail(), request.getEmailOtp()))
            throw new BadRequestException("Invalid or expired OTP. Please request a new one.");

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!newEmail.equals(profile.getEmail().toLowerCase()))
            if (secretaryRepository.existsByEmail(newEmail))
                throw new BadRequestException("This email is already in use.");

        if (!request.getMobileNumber().equals(profile.getMobileNumber()))
            if (secretaryRepository.existsByMobileNumber(request.getMobileNumber()))
                throw new BadRequestException("This mobile number is already in use.");

        profile.setFirstName(request.getFirstName().trim());
        profile.setLastName(request.getLastName().trim());
        profile.setEmail(newEmail);
        profile.setMobileNumber(request.getMobileNumber());
        profile.setFlatNumber(request.getFlatNumber().trim());
        profile.setBankName(request.getBankName().trim());
        profile.setAccountNumber(request.getAccountNumber().trim());
        profile.setIfscCode(request.getIfscCode().trim().toUpperCase());
        secretaryRepository.save(profile);

        credential.setLoginIdentifier(newEmail);
        credentialRepository.save(credential);

        return SecretaryMapper.toDTO(profile);
    }

    @Override
    public void sendForgotPasswordOtp(String email) {
        SecretaryProfile profile = secretaryRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Secretary not found."));

        if (!profile.getEmail().equalsIgnoreCase(email.trim()))
            throw new BadRequestException("No secretary account found with this email.");

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.save("forgot:" + email.toLowerCase(), otp);

        sendBrevoEmail(
                profile.getEmail(),
                profile.getFirstName(),
                "UrbanSync — Password Reset OTP",
                "Hello " + profile.getFirstName() + ",\n\n" +
                        "Your OTP for password reset is: " + otp + "\n\n" +
                        "This OTP is valid for 5 minutes.\n" +
                        "If you did not request this, please ignore this email.\n\n" +
                        "— UrbanSync System");
    }

    @Override
    @Transactional
    public void resetPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!otpStore.verify("forgot:" + email, request.getOtp()))
            throw new BadRequestException("Invalid or expired OTP. Please request a new one.");

        SecretaryProfile profile = secretaryRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Secretary not found."));

        if (!profile.getEmail().equalsIgnoreCase(email))
            throw new BadRequestException("Email does not match registered secretary.");

        Credential credential = profile.getCredential();
        credential.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        credentialRepository.save(credential);
    }
}