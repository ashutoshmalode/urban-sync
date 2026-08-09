package com.urbansync.complaint;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddIssueMediaRequest {

    @NotNull(message = "Issue ID is required")
    private Long issueId;

    @NotNull(message = "Media URLs are required")
    private List<String> mediaUrls;

    @NotNull(message = "Media type is required")
    private String mediaType;

    @NotNull(message = "Uploaded by is required")
    private String uploadedBy;

}