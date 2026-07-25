package com.urbansync.resident;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResidentDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String aadhaarLast4;
    private String residentType;
    private String flatNumber;
    private String status;
    private LocalDateTime createdAt;

}