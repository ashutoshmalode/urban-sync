package com.urbansync.complaint;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateIssueStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

}