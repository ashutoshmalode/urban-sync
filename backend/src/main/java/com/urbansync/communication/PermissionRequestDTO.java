package com.urbansync.communication;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionRequestDTO {

    private Long id;
    private Long raisedById;
    private String raisedByName;
    private String raisedByFlat;
    private String subject;
    private String description;
    private LocalDate requestDate;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;

}