package com.urbansync.registration;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectionRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;

}