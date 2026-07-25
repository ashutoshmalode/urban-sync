package com.urbansync.secretary;

import java.time.LocalDateTime;

import com.urbansync.auth.Credential;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "secretary_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecretaryProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "mobile_number", nullable = false, unique = true, length = 15)
    private String mobileNumber;

    @Column(name = "flat_number", nullable = false, length = 20)
    private String flatNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "account_number", length = 20)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @OneToOne
    @JoinColumn(name = "credential_id", nullable = false)
    private Credential credential;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}