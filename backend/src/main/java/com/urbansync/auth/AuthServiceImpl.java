package com.urbansync.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.urbansync.config.security.CustomUserDetails;
import com.urbansync.config.security.JwtService;
import com.urbansync.exception.ResourceNotFoundException;
import com.urbansync.exception.UnauthorizedException;

@Service
public class AuthServiceImpl implements AuthService {

    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public CredentialDTO getCredentialByLoginIdentifier(String loginIdentifier) {

        Credential credential = credentialRepository
                .findByLoginIdentifier(loginIdentifier)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Credential not found."));

        return CredentialMapper.toDTO(credential);
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        Credential credential = credentialRepository
                .findByLoginIdentifier(request.getLoginIdentifier())
                .orElseThrow(() ->
                        new UnauthorizedException("Invalid Login Identifier"));

        // Verify BCrypt password
        if (!passwordEncoder.matches(
                request.getPassword(),
                credential.getPasswordHash())) {

            throw new UnauthorizedException("Invalid Password");
        }

        // Generate real JWT
        CustomUserDetails userDetails = new CustomUserDetails(credential);
        String token = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .loginIdentifier(credential.getLoginIdentifier())
                .role(credential.getRole())
                .build();
    }

    @Override
    public void changePassword(String loginIdentifier, ChangePasswordRequest request) {

        Credential credential = credentialRepository
                .findByLoginIdentifier(loginIdentifier)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Credential not found."));

        if (!passwordEncoder.matches(
                request.getOldPassword(),
                credential.getPasswordHash())) {

            throw new UnauthorizedException("Old password is incorrect");
        }

        credential.setPasswordHash(
                passwordEncoder.encode(request.getNewPassword()));

        credentialRepository.save(credential);
    }
}