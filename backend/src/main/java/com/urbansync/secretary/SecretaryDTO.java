package com.urbansync.secretary;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecretaryDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String flatNumber;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private LocalDateTime createdAt;

}