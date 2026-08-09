package com.urbansync.property;


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
public class FlatDTO {
	
	private Long id;
    private String flatNumber;
    private String wingName;
    private Long ownerId;
    private String ownerName;
    private Long currentTenantId;
    private String currentTenantName;
    private String status;
    private LocalDateTime createdAt;

}
