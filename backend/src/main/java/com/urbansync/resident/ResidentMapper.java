package com.urbansync.resident;

public class ResidentMapper {

    private ResidentMapper() {}

    public static ResidentDTO toDTO(ResidentProfile profile) {
        return ResidentDTO.builder()
                .id(profile.getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .mobileNumber(profile.getMobileNumber())
                .aadhaarLast4(profile.getAadhaarLastFour())
                .residentType(profile.getResidentType())
                .flatNumber(profile.getFlatNumber())
                .status(profile.getStatus())
                .createdAt(profile.getCreatedAt())
                .build();
    }

}