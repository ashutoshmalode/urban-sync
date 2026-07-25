package com.urbansync.registration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationSubmitRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Aadhaar last 4 digits required")
    @Size(min = 4, max = 4, message = "Must be exactly 4 digits")
    private String aadhaarLastFour;

    @NotBlank(message = "Resident type is required")
    private String residentType;

    private String wingName;

    @NotBlank(message = "Flat number is required")
    private String flatNumber;

    private String landlordName;
    private String landlordFlatNumber;
    private String landlordMobileNumber;

}