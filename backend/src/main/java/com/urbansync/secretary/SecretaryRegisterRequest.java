package com.urbansync.secretary;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecretaryRegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 15, message = "Password must be 8-15 characters")
    private String password;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Flat number is required")
    private String flatNumber;

    private String bankName;
    private String accountNumber;
    private String ifscCode;

}