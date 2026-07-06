package com.urbansync.auth;

public class CredentialMapper {

    private CredentialMapper() {
    }

    public static CredentialDTO toDTO(Credential credential) {

        return CredentialDTO.builder()
                .id(credential.getId())
                .loginIdentifier(credential.getLoginIdentifier())
                .role(credential.getRole())
                .build();
    }

}
