package com.urbansync.scheduler;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scheduler_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchedulerLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_name", nullable = false, length = 100)
    private String jobName;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "message")
    private String message;

    @Column(name = "records_processed")
    private Integer recordsProcessed;

    @Column(name = "ran_at", nullable = false)
    private LocalDateTime ranAt;

}