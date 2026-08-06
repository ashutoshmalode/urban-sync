package com.urbansync.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyOtpRequest {

    @NotBlank(message = "Mobile number is required")
    private String mobile;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Role is required")
    private String role;

    // For resident only
    private String wingName;
    private String flatNumber;

}