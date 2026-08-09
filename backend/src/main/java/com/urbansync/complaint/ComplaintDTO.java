package com.urbansync.complaint;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintDTO {

    private Long id;
    private Long raisedById;
    private String raisedByName;
    private String subject;
    private String description;
    private String photoUrl;
    private String targetType;
    private Long targetResidentId;
    private String targetResidentName;
    private String status;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

}