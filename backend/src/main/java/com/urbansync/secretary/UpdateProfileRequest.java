package com.urbansync.secretary;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Valid email required")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(regexp = "\\d{10}", message = "Mobile must be 10 digits")
    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Flat number is required")
    private String flatNumber;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "IFSC code is required")
    private String ifscCode;

    // Verification
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "Email OTP is required")
    private String emailOtp;
}