package com.urbansync.property;

import java.time.LocalDateTime;

import com.urbansync.resident.ResidentProfile;
import com.urbansync.wing.Wing;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flat_number", nullable = false, unique = true, length = 20)
    private String flatNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wing_id", nullable = false)
    private Wing wing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private ResidentProfile owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_tenant_id")
    private ResidentProfile currentTenant;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}