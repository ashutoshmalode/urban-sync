package com.urbansync.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaiseComplaintRequest {

    @NotNull(message = "Resident ID is required")
    private Long raisedById;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    private String photoUrl;

    private String targetType;

    private Long targetResidentId;

}