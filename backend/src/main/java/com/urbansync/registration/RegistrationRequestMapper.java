package com.urbansync.registration;

public class RegistrationRequestMapper {

    private RegistrationRequestMapper() {}

    public static RegistrationRequestDTO toDTO(
            RegistrationRequest request) {

        return RegistrationRequestDTO.builder()
                .id(request.getId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .mobileNumber(request.getMobileNumber())
                .aadhaarLastFour(request.getAadhaarLastFour())
                .residentType(request.getResidentType())
                .wingName(request.getWingName())
                .flatNumber(request.getFlatNumber())
                .landlordName(request.getLandlordName())
                .landlordFlatNumber(request.getLandlordFlatNumber())
                .landlordMobileNumber(request.getLandlordMobileNumber())
                .status(request.getStatus())
                .rejectionReason(request.getRejectionReason())
                .createdAt(request.getCreatedAt())
                .build();
    }

}