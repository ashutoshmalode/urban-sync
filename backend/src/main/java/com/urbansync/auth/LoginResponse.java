package com.urbansync.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;

    private String loginIdentifier;

    private String role;
    
    private String flatNumber;

}
