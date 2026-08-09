package com.urbansync.secretary;

public interface SecretaryService {

    SecretaryDTO register(SecretaryRegisterRequest request);
    SecretaryDTO getProfile();
    boolean isSecretaryRegistered();

    // Fix 7 — profile edit
    void sendEmailOtp();
    SecretaryDTO updateProfile(UpdateProfileRequest request);

    // Forgot password
    void sendForgotPasswordOtp(String email);
    void resetPassword(ForgotPasswordRequest request);
}