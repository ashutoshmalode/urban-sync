package com.urbansync.complaint;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaretakerIssueMediaDTO {

    private Long id;
    private Long issueId;
    private String mediaUrl;
    private String mediaType;
    private String uploadedBy;
    private LocalDateTime createdAt;

}