package com.urbansync.secretary;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.urbansync.auth.Credential;
import com.urbansync.auth.CredentialRepository;
import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;

@Service
public class SecretaryServiceImpl implements SecretaryService {

    private final SecretaryRepository secretaryRepository;
    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;

    public SecretaryServiceImpl(
            SecretaryRepository secretaryRepository,
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder) {

        this.secretaryRepository = secretaryRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public boolean isSecretaryRegistered() {
        return secretaryRepository.count() > 0;
    }

    @Override
    public SecretaryDTO register(SecretaryRegisterRequest request) {

        // Only one secretary allowed
        if (isSecretaryRegistered()) {
            throw new BadRequestException(
                    "Secretary is already registered.");
        }

        if (secretaryRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "Email already in use.");
        }

        if (secretaryRepository.existsByMobileNumber(
                request.getMobileNumber())) {
            throw new BadRequestException(
                    "Mobile number already in use.");
        }

        // Create credential
        Credential credential = Credential.builder()
                .loginIdentifier(request.getEmail())
                .passwordHash(
                        passwordEncoder.encode(request.getPassword()))
                .role("SECRETARY")
                .createdAt(LocalDateTime.now())
                .build();

        credential = credentialRepository.save(credential);

        // Create secretary profile
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
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Secretary profile not found."));
    }

}