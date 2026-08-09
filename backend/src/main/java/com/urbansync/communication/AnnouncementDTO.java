package com.urbansync.communication;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementDTO {

    private Long id;
    private Long createdById;
    private String createdByName;
    private String type;
    private String title;
    private String message;
    private LocalDateTime createdAt;

}