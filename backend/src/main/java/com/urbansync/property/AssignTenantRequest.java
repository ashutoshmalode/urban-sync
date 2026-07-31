package com.urbansync.property;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignTenantRequest {

    @NotNull(message = "Resident ID is required")
    private Long residentId;

}