package com.urbansync.communication;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.urbansync.resident.ResidentProfile;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permission_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by_id")
    private ResidentProfile raisedBy;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "request_date")
    private LocalDate requestDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}