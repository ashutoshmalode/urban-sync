package com.urbansync.property;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyPostImageDTO {

    private Long id;
    private Long postId;
    private String imageUrl;
    private LocalDateTime createdAt;

}