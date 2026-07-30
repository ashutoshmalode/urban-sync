package com.urbansync.caretaker;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteCaretakerRequest {

    @NotBlank(message = "Reason is required")
    private String reason;

}