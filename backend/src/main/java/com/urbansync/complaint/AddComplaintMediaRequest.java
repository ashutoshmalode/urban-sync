package com.urbansync.complaint;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddComplaintMediaRequest {

    @NotNull(message = "Complaint ID is required")
    private Long complaintId;

    @NotNull(message = "Media URLs are required")
    private List<String> mediaUrls;

    @NotNull(message = "Media type is required")
    private String mediaType;

}