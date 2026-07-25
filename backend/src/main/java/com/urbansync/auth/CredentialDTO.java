package com.urbansync.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CredentialDTO {

    private Long id;

    private String loginIdentifier;

    private String role;

}
