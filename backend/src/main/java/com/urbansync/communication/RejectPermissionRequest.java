package com.urbansync.communication;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectPermissionRequest {

    @NotBlank(message = "Reason is required")
    private String reason;

}