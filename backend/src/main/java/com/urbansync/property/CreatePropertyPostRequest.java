package com.urbansync.property;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePropertyPostRequest {

    @NotNull(message = "Flat ID is required")
    private Long flatId;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    @NotBlank(message = "Listing type is required")
    private String listingType;

    @NotBlank(message = "Furnishing status is required")
    private String furnishingStatus;

    private LocalDate availabilityDate;

}