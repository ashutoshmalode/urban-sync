package com.urbansync.property;

public class PropertyMapper {

    private PropertyMapper() {}

    public static FlatDTO toFlatDTO(Flat flat) {
        String status;
        if (flat.getOwner() == null) {
            status = "UNREGISTERED";
        } else if (flat.getCurrentTenant() != null) {
            status = "ACTIVE_WITH_TENANT";
        } else {
            status = "ACTIVE_WITH_OWNER";
        }

        return FlatDTO.builder()
                .id(flat.getId())
                .flatNumber(flat.getFlatNumber())
                .wingName(flat.getWing() != null
                        ? flat.getWing().getWingName() : null)
                .ownerId(flat.getOwner() != null
                        ? flat.getOwner().getId() : null)
                .ownerName(flat.getOwner() != null
                        ? flat.getOwner().getFirstName() + " "
                          + flat.getOwner().getLastName() : null)
                .currentTenantId(flat.getCurrentTenant() != null
                        ? flat.getCurrentTenant().getId() : null)
                .currentTenantName(flat.getCurrentTenant() != null
                        ? flat.getCurrentTenant().getFirstName() + " "
                          + flat.getCurrentTenant().getLastName() : null)
                .status(status)
                .createdAt(flat.getCreatedAt())
                .build();
                    }

    public static PropertyPostDTO toPostDTO(PropertyPost post) {
        return PropertyPostDTO.builder()
                .id(post.getId())
                .flatId(post.getFlat() != null
                        ? post.getFlat().getId() : null)
                .flatNumber(post.getFlat() != null
                        ? post.getFlat().getFlatNumber() : null)
                .ownerName(post.getOwnerName())
                .contactNumber(post.getContactNumber())
                .listingType(post.getListingType())
                .furnishingStatus(post.getFurnishingStatus())
                .availabilityDate(post.getAvailabilityDate())
                .isActive(post.getIsActive())
                .createdAt(post.getCreatedAt())
                .build();
    }
    
    public static PropertyPostImageDTO toImageDTO(
            PropertyPostImage image) {
        return PropertyPostImageDTO.builder()
                .id(image.getId())
                .postId(image.getPost() != null
                        ? image.getPost().getId() : null)
                .imageUrl(image.getImageUrl())
                .createdAt(image.getCreatedAt())
                .build();
    }

}