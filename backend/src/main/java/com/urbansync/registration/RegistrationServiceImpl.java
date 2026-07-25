package com.urbansync.registration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.urbansync.auth.Credential;
import com.urbansync.auth.CredentialRepository;
import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;
import com.urbansync.resident.ResidentProfile;
import com.urbansync.resident.ResidentRepository;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRequestRepository registrationRepository;
    private final CredentialRepository credentialRepository;
    private final ResidentRepository residentRepository;

    public RegistrationServiceImpl(
            RegistrationRequestRepository registrationRepository,
            CredentialRepository credentialRepository,
            ResidentRepository residentRepository) {

        this.registrationRepository = registrationRepository;
        this.credentialRepository = credentialRepository;
        this.residentRepository = residentRepository;
    }

    @Override
    public RegistrationRequestDTO submit(
            RegistrationSubmitRequest request) {

        // Check duplicate pending request
        if (registrationRepository
                .existsByMobileNumberAndStatus(
                        request.getMobileNumber(), "PENDING")) {
            throw new BadRequestException(
                    "A pending request already exists " +
                    "for this mobile number.");
        }

        RegistrationRequest reg = RegistrationRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .mobileNumber(request.getMobileNumber())
                .aadhaarLastFour(request.getAadhaarLastFour())
                .residentType(request.getResidentType())
                .wingName(request.getWingName())
                .flatNumber(request.getFlatNumber())
                .landlordName(request.getLandlordName())
                .landlordFlatNumber(request.getLandlordFlatNumber())
                .landlordMobileNumber(request.getLandlordMobileNumber())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return RegistrationRequestMapper.toDTO(
                registrationRepository.save(reg));
    }

    @Override
    public List<RegistrationRequestDTO> getPendingRequests() {
        return registrationRepository
                .findByStatus("PENDING")
                .stream()
                .map(RegistrationRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegistrationRequestDTO> getHistory() {
        return registrationRepository.findAll()
                .stream()
                .filter(r -> !r.getStatus().equals("PENDING"))
                .map(RegistrationRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RegistrationRequestDTO approve(Long id) {

        RegistrationRequest reg = registrationRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Registration request not found."));

        if (!reg.getStatus().equals("PENDING")) {
            throw new BadRequestException(
                    "Request is already " + reg.getStatus());
        }

        // Auto-create credential
        Credential credential = Credential.builder()
                .loginIdentifier(reg.getMobileNumber())
                .passwordHash(null)
                .role("RESIDENT")
                .createdAt(LocalDateTime.now())
                .build();

        credential = credentialRepository.save(credential);

        // Create resident profile
        ResidentProfile resident = ResidentProfile.builder()
                .firstName(reg.getFirstName())
                .lastName(reg.getLastName())
                .mobileNumber(reg.getMobileNumber())
                .aadhaarLastFour(reg.getAadhaarLastFour())
                .residentType(reg.getResidentType())
                .flatNumber(reg.getFlatNumber())
                .status("ACTIVE")
                .credential(credential)
                .createdAt(LocalDateTime.now())
                .build();

        residentRepository.save(resident);

        reg.setStatus("APPROVED");
        return RegistrationRequestMapper.toDTO(
                registrationRepository.save(reg));
    }

    @Override
    public RegistrationRequestDTO reject(
            Long id, RejectionRequest request) {

        RegistrationRequest reg = registrationRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Registration request not found."));

        if (!reg.getStatus().equals("PENDING")) {
            throw new BadRequestException(
                    "Request is already " + reg.getStatus());
        }

        reg.setStatus("REJECTED");
        reg.setRejectionReason(request.getReason());

        return RegistrationRequestMapper.toDTO(
                registrationRepository.save(reg));
    }

}