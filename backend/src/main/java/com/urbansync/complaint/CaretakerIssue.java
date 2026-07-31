package com.urbansync.complaint;

import java.time.LocalDateTime;

import com.urbansync.caretaker.CaretakerProfile;
import com.urbansync.secretary.SecretaryProfile;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "caretaker_issues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaretakerIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id", nullable = false)
    private CaretakerProfile assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    private SecretaryProfile assignedBy;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}