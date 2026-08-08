package com.urbansync.secretary;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbansync.auth.Credential;
import com.urbansync.auth.CredentialRepository;
import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;

@Service
public class SecretaryServiceImpl implements SecretaryService {

    private final SecretaryRepository secretaryRepository;
    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecretaryOtpStore otpStore;

    public SecretaryServiceImpl(
            SecretaryRepository secretaryRepository,
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            SecretaryOtpStore otpStore) {

        this.secretaryRepository = secretaryRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.otpStore = otpStore;
    }

    @Override
    public boolean isSecretaryRegistered() {
        return secretaryRepository.count() > 0;
    }

    @Override
    public SecretaryDTO register(SecretaryRegisterRequest request) {

        if (isSecretaryRegistered()) {
            throw new BadRequestException("Secretary is already registered.");
        }
        if (secretaryRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use.");
        }
        if (secretaryRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new BadRequestException("Mobile number already in use.");
        }

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
        return secretaryRepository.findAll()
                .stream()
                .findFirst()
                .map(SecretaryMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Secretary profile not found."));
    }

    // ── Fix 7: Send OTP to secretary's registered Gmail ───────────────────────
    @Override
    public void sendEmailOtp() {

        SecretaryProfile profile = secretaryRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Secretary profile not found."));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Store OTP (expires in 5 min)
        otpStore.save(profile.getEmail(), otp);

        // Send email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("malodeashu.dummydata@gmail.com");
        message.setTo(profile.getEmail());
        message.setSubject("UrbanSync — Profile Update OTP");
        message.setText(
                "Hello " + profile.getFirstName() + ",\n\n" +
                "Your OTP for profile update is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n" +
                "Do not share this OTP with anyone.\n\n" +
                "— UrbanSync System"
        );

        mailSender.send(message);
    }

    // ── Fix 7: Update all profile fields after OTP + password verification ────
    @Override
    @Transactional
    public SecretaryDTO updateProfile(UpdateProfileRequest request) {

        SecretaryProfile profile = secretaryRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Secretary profile not found."));

        Credential credential = profile.getCredential();

        // 1. Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), credential.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        // 2. Verify email OTP
        if (!otpStore.verify(profile.getEmail(), request.getEmailOtp())) {
            throw new BadRequestException("Invalid or expired OTP. Please request a new one.");
        }

        // 3. Check email uniqueness if changed
        String newEmail = request.getEmail().trim().toLowerCase();
        if (!newEmail.equals(profile.getEmail().toLowerCase())) {
            if (secretaryRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("This email is already in use.");
            }
        }

        // 4. Check mobile uniqueness if changed
        if (!request.getMobileNumber().equals(profile.getMobileNumber())) {
            if (secretaryRepository.existsByMobileNumber(request.getMobileNumber())) {
                throw new BadRequestException("This mobile number is already in use.");
            }
        }

        // 5. Update SecretaryProfile fields
        profile.setFirstName(request.getFirstName().trim());
        profile.setLastName(request.getLastName().trim());
        profile.setEmail(newEmail);
        profile.setMobileNumber(request.getMobileNumber());
        profile.setFlatNumber(request.getFlatNumber().trim());
        profile.setBankName(request.getBankName().trim());
        profile.setAccountNumber(request.getAccountNumber().trim());
        profile.setIfscCode(request.getIfscCode().trim().toUpperCase());

        secretaryRepository.save(profile);

        // 6. Update Credential login identifier to match new email
        credential.setLoginIdentifier(newEmail);
        credentialRepository.save(credential);

        return SecretaryMapper.toDTO(profile);
    }
    
 // ── Forgot Password: Send OTP (no auth — pre-login) ──────────────────────
    @Override
    public void sendForgotPasswordOtp(String email) {

        // Verify this email belongs to the secretary
        SecretaryProfile profile = secretaryRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Secretary not found."));

        if (!profile.getEmail().equalsIgnoreCase(email.trim())) {
            throw new BadRequestException("No secretary account found with this email.");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Store with "forgot:" prefix to separate from profile-edit OTPs
        otpStore.save("forgot:" + email.toLowerCase(), otp);

        // Send email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("malodeashu.dummydata@gmail.com");
        message.setTo(profile.getEmail());
        message.setSubject("UrbanSync — Password Reset OTP");
        message.setText(
                "Hello " + profile.getFirstName() + ",\n\n" +
                "Your OTP for password reset is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "— UrbanSync System"
        );

        mailSender.send(message);
    }

    // ── Forgot Password: Reset with OTP ──────────────────────────────────────
    @Override
    @Transactional
    public void resetPassword(ForgotPasswordRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        // Verify OTP
        if (!otpStore.verify("forgot:" + email, request.getOtp())) {
            throw new BadRequestException("Invalid or expired OTP. Please request a new one.");
        }

        // Find secretary by email
        SecretaryProfile profile = secretaryRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Secretary not found."));

        if (!profile.getEmail().equalsIgnoreCase(email)) {
            throw new BadRequestException("Email does not match registered secretary.");
        }

        // Update password in credentials
        Credential credential = profile.getCredential();
        credential.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        credentialRepository.save(credential);
    }
}