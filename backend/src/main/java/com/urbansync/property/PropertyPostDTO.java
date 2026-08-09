package com.urbansync.property;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyPostDTO {
	
	private Long id;
	private Long flatId;
    private String flatNumber;
    private String ownerName;
    private String contactNumber;
    private String listingType;
    private String furnishingStatus;
    private LocalDate availabilityDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
	

}
