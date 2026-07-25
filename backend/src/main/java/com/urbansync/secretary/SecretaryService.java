package com.urbansync.secretary;

public interface SecretaryService {

    SecretaryDTO register(SecretaryRegisterRequest request);

    SecretaryDTO getProfile();

    boolean isSecretaryRegistered();

}