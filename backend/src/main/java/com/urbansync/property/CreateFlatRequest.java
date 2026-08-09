package com.urbansync.property;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateFlatRequest {

	@NotBlank(message = "Flat number is required")
	private String flatNumber;
	@NotNull(message = "WingID is Required")
	private long wingId;
	
	
	
}
