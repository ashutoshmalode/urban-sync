package com.urbansync.caretaker;

public class CaretakerMapper {

    private CaretakerMapper() {}

    public static CaretakerDTO toDTO(CaretakerProfile profile) {
        return CaretakerDTO.builder()
                .id(profile.getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .mobileNumber(profile.getMobileNumber())
                .age(profile.getAge())
                .aadhaarNumber(profile.getAadhaarNumber())
                .permanentAddress(profile.getPermanentAddress())
                .serialNumber(profile.getSerialNumber())
                .status(profile.getStatus())
                .leavingReason(profile.getLeavingReason())
                .leftAt(profile.getLeftAt())
                .createdAt(profile.getCreatedAt())
                .photoUrl(profile.getPhotoUrl())
                .build();
    }

}