package com.urbansync.auth;

public interface AuthService {

    CredentialDTO getCredentialByLoginIdentifier(String loginIdentifier);

    LoginResponse login(LoginRequest request);

    void changePassword(String loginIdentifier, ChangePasswordRequest request);

}