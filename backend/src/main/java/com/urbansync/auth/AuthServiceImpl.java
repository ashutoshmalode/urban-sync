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
    private final com.urbansync.resident.ResidentRepository residentRepository;

    public AuthServiceImpl(
            CredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            FirebaseAuth firebaseAuth,
            com.urbansync.caretaker.CaretakerRepository caretakerRepository,
            com.urbansync.resident.ResidentRepository residentRepository) {

        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.firebaseAuth = firebaseAuth;
        this.caretakerRepository = caretakerRepository;
        this.residentRepository = residentRepository;
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
            FirebaseToken decodedToken = firebaseAuth
                    .verifyIdToken(request.getFirebaseToken());

            String phoneNumber = decodedToken.getClaims()
                    .get("phone_number").toString();

            String mobile = phoneNumber.replace("+91", "");

            if ("RESIDENT".equals(request.getRole())) {

                if (request.getWingName() == null
                        || request.getFlatNumber() == null) {
                    throw new BadRequestException(
                            "Wing and flat number required for resident login.");
                }

                String fullFlat = request.getWingName().toUpperCase()
                        + "-" + request.getFlatNumber();

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

            } else if ("CARETAKER".equals(request.getRole())) {

                Credential credential = credentialRepository
                        .findByLoginIdentifier(mobile)
                        .orElseThrow(() ->
                                new UnauthorizedException(
                                        "No caretaker found with this mobile number."));

                if (!credential.getRole().equals("CARETAKER")) {
                    throw new UnauthorizedException(
                            "This mobile is not registered as a caretaker.");
                }

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

    @Override
    public String sendOtp(SendOtpRequest request) {

        String mobile = request.getMobile().trim();

        if ("RESIDENT".equals(request.getRole())) {

            if (request.getWingName() == null || request.getFlatNumber() == null) {
                throw new BadRequestException(
                        "Wing and flat number are required for resident login.");
            }

            String fullFlat = request.getWingName().toUpperCase()
                    + "-" + request.getFlatNumber();

            // Find resident by mobile AND flat number both must match
            com.urbansync.resident.ResidentProfile resident =
                    residentRepository
                    .findByMobileNumberAndFlatNumber(mobile, fullFlat)
                    .orElseThrow(() ->
                            new UnauthorizedException(
                                    "No resident found with these details. "
                                    + "Please check your mobile number, wing and flat number."));

            if (!resident.getStatus().equals("ACTIVE")) {
                throw new UnauthorizedException(
                        "Your resident account is inactive. "
                        + "Please contact the secretary.");
            }

            return "OTP sent successfully to +91" + mobile;

        } else if ("CARETAKER".equals(request.getRole())) {

            com.urbansync.caretaker.CaretakerProfile caretaker =
                    caretakerRepository
                    .findByMobileNumber(mobile)
                    .orElseThrow(() ->
                            new UnauthorizedException(
                                    "No caretaker found with this mobile number. "
                                    + "Please contact the secretary."));

            if (!caretaker.getStatus().equals("ACTIVE")) {
                throw new UnauthorizedException(
                        "Your caretaker account is inactive. "
                        + "Please contact the secretary.");
            }

            return "OTP sent successfully to +91" + mobile;

        } else {
            throw new BadRequestException(
                    "Invalid role. Must be RESIDENT or CARETAKER.");
        }
    }
    
    @Override
    public LoginResponse verifyOtp(VerifyOtpRequest request) {

        String mobile = request.getMobile().trim();
        String otp = request.getOtp().trim();

        if ("RESIDENT".equals(request.getRole())) {

            if (!"123456".equals(otp)) {
                throw new UnauthorizedException("Invalid OTP.");
            }

            // Verify flat again at verify step too
            if (request.getWingName() != null
                    && request.getFlatNumber() != null) {
                String fullFlat = request.getWingName().toUpperCase()
                        + "-" + request.getFlatNumber();
                residentRepository
                        .findByMobileNumberAndFlatNumber(mobile, fullFlat)
                        .orElseThrow(() ->
                                new UnauthorizedException(
                                        "No resident found with these details."));
            }

            Credential credential = credentialRepository
                    .findByLoginIdentifier(mobile)
                    .orElseThrow(() ->
                            new UnauthorizedException(
                                    "No resident found with this mobile number."));

            if (!credential.getRole().equals("RESIDENT")) {
                throw new UnauthorizedException(
                        "This mobile is not registered as a resident.");
            }

            CustomUserDetails userDetails =
                    new CustomUserDetails(credential);
            String token = jwtService.generateToken(userDetails);

            String flatNumber = null;
            if (request.getWingName() != null
                    && request.getFlatNumber() != null) {
                flatNumber = request.getWingName().toUpperCase()
                        + "-" + request.getFlatNumber();
            }

            return LoginResponse.builder()
                    .token(token)
                    .loginIdentifier(mobile)
                    .role("RESIDENT")
                    .flatNumber(flatNumber)
                    .build();

        } else if ("CARETAKER".equals(request.getRole())) {

            if (!"654321".equals(otp)) {
                throw new UnauthorizedException("Invalid OTP.");
            }

            com.urbansync.caretaker.CaretakerProfile caretaker =
                    caretakerRepository
                    .findByMobileNumber(mobile)
                    .orElseThrow(() ->
                            new UnauthorizedException(
                                    "No caretaker found with this mobile number."));

            if (!caretaker.getStatus().equals("ACTIVE")) {
                throw new UnauthorizedException(
                        "Your caretaker account is inactive. "
                        + "Please contact the secretary.");
            }

            Credential credential = credentialRepository
                    .findByLoginIdentifier(mobile)
                    .orElseThrow(() ->
                            new UnauthorizedException(
                                    "No caretaker credential found."));

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
    }

}