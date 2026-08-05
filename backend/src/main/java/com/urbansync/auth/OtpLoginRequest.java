package com.urbansync.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpLoginRequest {

    @NotBlank(message = "Firebase token is required")
    private String firebaseToken;

    // For resident login
    private String wingName;
    private String flatNumber;

    // Role hint — RESIDENT or CARETAKER
    @NotBlank(message = "Role is required")
    private String role;

}