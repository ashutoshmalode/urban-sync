package com.urbansync.property;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;
import com.urbansync.resident.ResidentProfile;
import com.urbansync.resident.ResidentRepository;
import com.urbansync.wing.Wing;
import com.urbansync.wing.WingRepository;

@Service
public class PropertyServiceImpl implements PropertyService {

    private final FlatRepository flatRepository;
    private final PropertyPostRepository postRepository;
    private final ResidentRepository residentRepository;
    private final WingRepository wingRepository;

    public PropertyServiceImpl(
            FlatRepository flatRepository,
            PropertyPostRepository postRepository,
            ResidentRepository residentRepository,
            WingRepository wingRepository) {

        this.flatRepository = flatRepository;
        this.postRepository = postRepository;
        this.residentRepository = residentRepository;
        this.wingRepository = wingRepository;
    }

    @Override
    @Transactional
    public FlatDTO createFlat(CreateFlatRequest request) {

        if (flatRepository.existsByFlatNumber(request.getFlatNumber())) {
            throw new BadRequestException(
                    "Flat " + request.getFlatNumber() + " already exists.");
        }

        Wing wing = wingRepository.findById(request.getWingId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wing not found."));

        Flat flat = Flat.builder()
                .flatNumber(request.getFlatNumber())
                .wing(wing)
                .createdAt(LocalDateTime.now())
                .build();

        return PropertyMapper.toFlatDTO(flatRepository.save(flat));
    }

    @Override
    public List<FlatDTO> getAllFlats() {
        return flatRepository.findAllByOrderByFlatNumberAsc()
                .stream()
                .map(PropertyMapper::toFlatDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FlatDTO getFlatById(Long id) {
        return flatRepository.findById(id)
                .map(PropertyMapper::toFlatDTO)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Flat not found."));
    }

    @Override
    @Transactional
    public FlatDTO assignOwner(Long flatId, AssignOwnerRequest request) {

        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Flat not found."));

        if (flat.getOwner() != null) {
            throw new BadRequestException(
                    "Flat already has an owner assigned.");
        }

        ResidentProfile owner = residentRepository
                .findById(request.getResidentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resident not found."));

        if (!owner.getResidentType().equals("OWNER")) {
            throw new BadRequestException(
                    "Resident is not registered as an owner.");
        }

        flat.setOwner(owner);
        return PropertyMapper.toFlatDTO(flatRepository.save(flat));
    }

    @Override
    @Transactional
    public FlatDTO assignTenant(Long flatId, AssignTenantRequest request) {

        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Flat not found."));

        if (flat.getCurrentTenant() != null) {
            throw new BadRequestException(
                    "Flat already has a tenant.");
        }

        ResidentProfile tenant = residentRepository
                .findById(request.getResidentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resident not found."));

        if (!tenant.getResidentType().equals("TENANT")) {
            throw new BadRequestException(
                    "Resident is not registered as a tenant.");
        }

        flat.setCurrentTenant(tenant);
        return PropertyMapper.toFlatDTO(flatRepository.save(flat));
    }

    @Override
    @Transactional
    public FlatDTO removeTenant(Long flatId) {

        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Flat not found."));

        if (flat.getCurrentTenant() == null) {
            throw new BadRequestException(
                    "Flat has no tenant to remove.");
        }

        flat.setCurrentTenant(null);
        return PropertyMapper.toFlatDTO(flatRepository.save(flat));
    }

    @Override
    public List<FlatDTO> getVacantFlats() {
        return flatRepository.findByOwnerIsNull()
                .stream()
                .map(PropertyMapper::toFlatDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PropertyPostDTO createPost(CreatePropertyPostRequest request) {

        Flat flat = flatRepository.findById(request.getFlatId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Flat not found."));

        PropertyPost post = PropertyPost.builder()
                .flat(flat)
                .ownerName(request.getOwnerName())
                .contactNumber(request.getContactNumber())
                .listingType(request.getListingType())
                .furnishingStatus(request.getFurnishingStatus())
                .availabilityDate(request.getAvailabilityDate())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        return PropertyMapper.toPostDTO(postRepository.save(post));
    }

    @Override
    public List<PropertyPostDTO> getAllActivePosts() {
        return postRepository.findByIsActiveTrue()
                .stream()
                .map(PropertyMapper::toPostDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PropertyPostDTO markRented(Long postId) {

        PropertyPost post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Property post not found."));

        if (!post.getIsActive()) {
            throw new BadRequestException(
                    "Property post is already marked as rented/sold.");
        }

        post.setIsActive(false);
        return PropertyMapper.toPostDTO(postRepository.save(post));
    }

    @Override
    public List<PropertyPostDTO> getPostHistory() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PropertyMapper::toPostDTO)
                .collect(Collectors.toList());
    }

}