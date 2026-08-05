package com.urbansync.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.urbansync.config.security.CustomUserDetails;
import com.urbansync.config.security.JwtService;
import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;
import com.urbansync.exception.UnauthorizedException;


@Service
public class AuthServiceImpl implements AuthService {

    private final CredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FirebaseAuth firebaseAuth;
    private final com.urbansync.caretaker.CaretakerRepository caretakerRepository;

    public AuthServiceImpl(
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            FirebaseAuth firebaseAuth,
            com.urbansync.caretaker.CaretakerRepository caretakerRepository) {

        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.firebaseAuth = firebaseAuth;
        this.caretakerRepository = caretakerRepository;
    }
    
    @Override
    public CredentialDTO getCredentialByLoginIdentifier(
            String loginIdentifier) {
        Credential credential = credentialRepository
                .findByLoginIdentifier(loginIdentifier)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Credential not found."));
        return CredentialMapper.toDTO(credential);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Credential credential = credentialRepository
                .findByLoginIdentifier(request.getLoginIdentifier())
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Invalid Login Identifier"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                credential.getPasswordHash())) {
            throw new UnauthorizedException("Invalid Password");
        }

        CustomUserDetails userDetails =
                new CustomUserDetails(credential);
        String token = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .loginIdentifier(credential.getLoginIdentifier())
                .role(credential.getRole())
                .build();
    }

    @Override
    public LoginResponse verifyOtpAndLogin(OtpLoginRequest request) {

        try {
            // Step 1 — Verify Firebase token
            FirebaseToken decodedToken = firebaseAuth
                    .verifyIdToken(request.getFirebaseToken());

            // Step 2 — Extract mobile number from Firebase token
            String phoneNumber = decodedToken.getClaims()
                    .get("phone_number").toString();

            // Remove +91 prefix → get 10 digit mobile
            String mobile = phoneNumber.replace("+91", "");

            // Step 3 — Find credential by role
            if ("RESIDENT".equals(request.getRole())) {

                // Resident login — need wing + flat to identify
                if (request.getWingName() == null
                        || request.getFlatNumber() == null) {
                    throw new BadRequestException(
                            "Wing and flat number required for resident login.");
                }

                String fullFlat = request.getWingName().toUpperCase()
                        + "-" + request.getFlatNumber();

                // Find credential by mobile
                Credential credential = credentialRepository
                        .findByLoginIdentifier(mobile)
                        .orElseThrow(() ->
                                new UnauthorizedException(
                                        "No resident found with this mobile number. "
                                        + "Please contact secretary to register."));

                if (!credential.getRole().equals("RESIDENT")) {
                    throw new UnauthorizedException(
                            "This mobile is not registered as a resident.");
                }

                CustomUserDetails userDetails =
                        new CustomUserDetails(credential);
                String token = jwtService.generateToken(userDetails);

                return LoginResponse.builder()
                        .token(token)
                        .loginIdentifier(mobile)
                        .role("RESIDENT")
                        .flatNumber(fullFlat)
                        .build();

            }  else if ("CARETAKER".equals(request.getRole())) {

                Credential credential = credentialRepository
                        .findByLoginIdentifier(mobile)
                        .orElseThrow(() ->
                                new UnauthorizedException(
                                        "No caretaker found with this mobile number."));

                if (!credential.getRole().equals("CARETAKER")) {
                    throw new UnauthorizedException(
                            "This mobile is not registered as a caretaker.");
                }

                // Check caretaker is ACTIVE
                com.urbansync.caretaker.CaretakerProfile caretaker =
                        caretakerRepository
                        .findByMobileNumber(mobile)
                        .orElseThrow(() ->
                                new UnauthorizedException(
                                        "Caretaker profile not found."));

                if (!caretaker.getStatus().equals("ACTIVE")) {
                    throw new UnauthorizedException(
                            "Your caretaker account is inactive. "
                            + "Please contact the secretary.");
                }

                CustomUserDetails userDetails =
                        new CustomUserDetails(credential);
                String token = jwtService.generateToken(userDetails);

                return LoginResponse.builder()
                        .token(token)
                        .loginIdentifier(mobile)
                        .role("CARETAKER")
                        .build();

            } else {
                throw new BadRequestException(
                        "Invalid role. Must be RESIDENT or CARETAKER.");
            }

        } catch (UnauthorizedException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new UnauthorizedException(
                    "OTP verification failed: " + e.getMessage());
        }
    }

    @Override
    public void changePassword(String loginIdentifier,
            ChangePasswordRequest request) {

        Credential credential = credentialRepository
                .findByLoginIdentifier(loginIdentifier)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Credential not found."));

        if (!passwordEncoder.matches(
                request.getOldPassword(),
                credential.getPasswordHash())) {
            throw new UnauthorizedException(
                    "Old password is incorrect");
        }

        credential.setPasswordHash(
                passwordEncoder.encode(request.getNewPassword()));
        credentialRepository.save(credential);
    }

}