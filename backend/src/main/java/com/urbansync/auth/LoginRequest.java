package com.urbansync.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Login Identifier is required")
    private String loginIdentifier;

    @NotBlank(message = "Password is required")
    private String password;

}
