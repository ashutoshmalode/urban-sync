package com.urbansync.property;

import java.util.List;

public interface PropertyService {

    FlatDTO createFlat(CreateFlatRequest request);

    List<FlatDTO> getAllFlats();

    FlatDTO getFlatById(Long id);

    FlatDTO assignOwner(Long flatId, AssignOwnerRequest request);

    FlatDTO assignTenant(Long flatId, AssignTenantRequest request);

    FlatDTO removeTenant(Long flatId);

    List<FlatDTO> getVacantFlats();

    PropertyPostDTO createPost(CreatePropertyPostRequest request);

    List<PropertyPostDTO> getAllActivePosts();

    PropertyPostDTO markRented(Long postId);

    List<PropertyPostDTO> getPostHistory();

}