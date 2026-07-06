package com.urbansync.wing;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "wings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "wing_name", nullable = false, unique = true, length = 10)
    private String wingName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
