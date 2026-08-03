package com.urbansync.caretaker;

import java.time.LocalDateTime;

import com.urbansync.auth.Credential;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "caretaker_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaretakerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "mobile_number", nullable = false, unique = true, length = 15)
    private String mobileNumber;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "aadhaar_number", nullable = false, unique = true, length = 12)
    private String aadhaarNumber;

    @Column(name = "permanent_address", nullable = false)
    private String permanentAddress;

    @Column(name = "serial_number", nullable = false, unique = true)
    private Integer serialNumber;

    @Column(name = "status", length = 20)
    private String status;

    @OneToOne
    @JoinColumn(name = "credential_id")
    private Credential credential;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "leaving_reason")
    private String leavingReason;

    @Column(name = "left_at")
    private LocalDateTime leftAt;
    
    @Column(name = "photo_url", length = 500)
    private String photoUrl;

}