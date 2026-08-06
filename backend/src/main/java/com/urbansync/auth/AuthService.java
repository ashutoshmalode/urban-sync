package com.urbansync.auth;

public interface AuthService {

    CredentialDTO getCredentialByLoginIdentifier(String loginIdentifier);

    LoginResponse login(LoginRequest request);

    void changePassword(String loginIdentifier, ChangePasswordRequest request);
    
    LoginResponse verifyOtpAndLogin(OtpLoginRequest request);
    
    String sendOtp(SendOtpRequest request);
    LoginResponse verifyOtp(VerifyOtpRequest request);

}