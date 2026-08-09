package com.urbansync.property;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddPropertyImagesRequest {

    @NotNull(message = "Post ID is required")
    private Long postId;

    @NotNull(message = "Image URLs are required")
    @Size(min = 5, max = 10, message = "Minimum 5 and maximum 10 images required")
    private List<String> imageUrls;

}