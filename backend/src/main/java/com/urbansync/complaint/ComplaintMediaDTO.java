package com.urbansync.complaint;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintMediaDTO {

    private Long id;
    private Long complaintId;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime createdAt;

}