package com.urbansync.registration;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationRequestDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String aadhaarLastFour;
    private String residentType;
    private String wingName;
    private String flatNumber;
    private String landlordName;
    private String landlordFlatNumber;
    private String landlordMobileNumber;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;

}