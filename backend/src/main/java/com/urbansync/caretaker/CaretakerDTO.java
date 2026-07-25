package com.urbansync.caretaker;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaretakerDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private Integer age;
    private String aadhaarNumber;
    private String permanentAddress;
    private Integer serialNumber;
    private String status;
    private LocalDateTime createdAt;

}