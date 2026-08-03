package com.urbansync.caretaker;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbansync.auth.Credential;
import com.urbansync.auth.CredentialRepository;
import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;

@Service
public class CaretakerServiceImpl implements CaretakerService {

    private final CaretakerRepository caretakerRepository;
    private final CredentialRepository credentialRepository;

    public CaretakerServiceImpl(
            CaretakerRepository caretakerRepository,
            CredentialRepository credentialRepository) {
        this.caretakerRepository = caretakerRepository;
        this.credentialRepository = credentialRepository;
    }

    @Override
    @Transactional
    public CaretakerDTO create(CaretakerCreateRequest request) {

        // Check if caretaker exists with this mobile
        CaretakerProfile existing = caretakerRepository
                .findByMobileNumber(request.getMobileNumber())
                .orElse(null);

        if (existing != null) {
            // If ACTIVE — block
            if (existing.getStatus().equals("ACTIVE")) {
                throw new BadRequestException(
                        "An active caretaker already exists "
                        + "with this mobile number.");
            }

            // If INACTIVE — reactivate (rejoin)
            existing.setFirstName(request.getFirstName());
            existing.setLastName(request.getLastName());
            existing.setAge(request.getAge());
            existing.setAadhaarNumber(request.getAadhaarNumber());
            existing.setPermanentAddress(request.getPermanentAddress());
            existing.setStatus("ACTIVE");
            existing.setLeavingReason(null);
            existing.setLeftAt(null);
            existing.setCreatedAt(LocalDateTime.now());
            existing.setPhotoUrl(request.getPhotoUrl());

            return CaretakerMapper.toDTO(
                    caretakerRepository.save(existing));
        }

        // Check aadhaar uniqueness for new caretakers only
        caretakerRepository.findByAadhaarNumber(request.getAadhaarNumber())
                .ifPresent(c -> {
                    if (c.getStatus().equals("ACTIVE")) {
                        throw new BadRequestException(
                                "An active caretaker already exists "
                                + "with this Aadhaar number.");
                    }
                });

        // New caretaker — create fresh
        int serialNumber = caretakerRepository.findMaxSerialNumber() + 1;

        Credential credential = credentialRepository
                .findByLoginIdentifier(request.getMobileNumber())
                .orElseGet(() -> {
                    Credential newCred = Credential.builder()
                            .loginIdentifier(request.getMobileNumber())
                            .passwordHash(null)
                            .role("CARETAKER")
                            .createdAt(LocalDateTime.now())
                            .build();
                    return credentialRepository.save(newCred);
                });

        CaretakerProfile caretaker = CaretakerProfile.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .mobileNumber(request.getMobileNumber())
                .age(request.getAge())
                .aadhaarNumber(request.getAadhaarNumber())
                .permanentAddress(request.getPermanentAddress())
                .serialNumber(serialNumber)
                .status("ACTIVE")
                .credential(credential)
                .createdAt(LocalDateTime.now())
                .photoUrl(request.getPhotoUrl())
                .build();

        return CaretakerMapper.toDTO(
                caretakerRepository.save(caretaker));
    }

    @Override
    public List<CaretakerDTO> getAllCaretakers() {
        return caretakerRepository
                .findAllByOrderBySerialNumberAsc()
                .stream()
                .filter(c -> "ACTIVE".equals(c.getStatus()))
                .map(CaretakerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CaretakerDTO> getAllCaretakersHistory() {
        return caretakerRepository
                .findAllByOrderBySerialNumberAsc()
                .stream()
                .map(CaretakerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CaretakerDTO getById(Long id) {
        return caretakerRepository.findById(id)
                .map(CaretakerMapper::toDTO)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Caretaker not found."));
    }

    @Override
    @Transactional
    public CaretakerDTO deleteCaretaker(
            Long id, DeleteCaretakerRequest request) {

        CaretakerProfile caretaker = caretakerRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Caretaker not found."));

        if ("INACTIVE".equals(caretaker.getStatus())) {
            throw new BadRequestException(
                    "Caretaker is already inactive.");
        }

        caretaker.setStatus("INACTIVE");
        caretaker.setLeavingReason(request.getReason());
        caretaker.setLeftAt(LocalDateTime.now());

        return CaretakerMapper.toDTO(
                caretakerRepository.save(caretaker));
    }

}