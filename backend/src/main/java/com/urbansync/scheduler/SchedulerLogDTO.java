package com.urbansync.scheduler;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchedulerLogDTO {

    private Long id;
    private String jobName;
    private String status;
    private String message;
    private Integer recordsProcessed;
    private LocalDateTime ranAt;

}