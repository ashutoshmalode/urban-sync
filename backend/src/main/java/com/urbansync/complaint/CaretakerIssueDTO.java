package com.urbansync.complaint;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaretakerIssueDTO {

    private Long id;
    private Long assignedToId;
    private String assignedToName;
    private Long assignedById;
    private String assignedByName;
    private String title;
    private String description;
    private String status;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

}