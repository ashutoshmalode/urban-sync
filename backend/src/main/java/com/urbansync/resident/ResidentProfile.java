package com.urbansync.resident;

import java.time.LocalDateTime;

import com.urbansync.auth.Credential;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resident_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResidentProfile {

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

    @Column(name = "flat_number", length = 20)
    private String flatNumber;

    @Column(name = "landlord_id")
    private Long landlordId;

    @Column(name = "status", length = 20)
    private String status;

    @OneToOne
    @JoinColumn(name = "credential_id")
    private Credential credential;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}