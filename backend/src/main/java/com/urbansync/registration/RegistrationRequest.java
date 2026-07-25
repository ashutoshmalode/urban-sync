package com.urbansync.registration;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "registration_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "mobile_number", nullable = false, length = 15)
    private String mobileNumber;

    @Column(name = "aadhaar_last_four", nullable = false, length = 4)
    private String aadhaarLastFour;

    @Column(name = "resident_type", nullable = false, length = 10)
    private String residentType;

    @Column(name = "wing_name", length = 10)
    private String wingName;

    @Column(name = "flat_number", nullable = false, length = 20)
    private String flatNumber;

    @Column(name = "landlord_name", length = 100)
    private String landlordName;

    @Column(name = "landlord_flat_number", length = 20)
    private String landlordFlatNumber;

    @Column(name = "landlord_mobile_number", length = 15)
    private String landlordMobileNumber;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}