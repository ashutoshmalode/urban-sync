package com.urbansync.secretary;

public class SecretaryMapper {

    private SecretaryMapper() {}

    public static SecretaryDTO toDTO(SecretaryProfile profile) {
        return SecretaryDTO.builder()
                .id(profile.getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .email(profile.getEmail())
                .mobileNumber(profile.getMobileNumber())
                .flatNumber(profile.getFlatNumber())
                .bankName(profile.getBankName())
                .accountNumber(profile.getAccountNumber())
                .ifscCode(profile.getIfscCode())
                .createdAt(profile.getCreatedAt())
                .build();
    }

}