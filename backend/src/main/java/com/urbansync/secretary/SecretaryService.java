package com.urbansync.secretary;

public interface SecretaryService {

    SecretaryDTO register(SecretaryRegisterRequest request);
    SecretaryDTO getProfile();
    boolean isSecretaryRegistered();

    // Fix 7
    void sendEmailOtp();
    SecretaryDTO updateProfile(UpdateProfileRequest request);
}