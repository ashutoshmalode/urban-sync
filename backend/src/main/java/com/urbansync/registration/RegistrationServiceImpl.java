package com.urbansync.registration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public RegistrationRequestDTO submit(
            RegistrationSubmitRequest request) {

    	// Frontend already sends combined format e.g. A-204
    	// Just use flatNumber directly
    	String fullFlatNumber = request.getFlatNumber();

     // 1. Check duplicate mobile + flat in active residents
        boolean mobileExistsForFlat = residentRepository.findAll()
                .stream()
                .filter(r -> r.getStatus().equals("ACTIVE"))
                .filter(r -> r.getMobileNumber().equals(request.getMobileNumber()))
                .anyMatch(r -> r.getFlatNumber() != null && (
                        r.getFlatNumber().equals(fullFlatNumber) ||
                        r.getFlatNumber().equals(request.getFlatNumber()) ||
                        r.getFlatNumber().endsWith("-" + request.getFlatNumber())
                ));

        if (mobileExistsForFlat) {
            throw new BadRequestException(
                    "You are already registered for flat "
                    + fullFlatNumber + " with this mobile number.");
        }

     // 2. Check duplicate mobile + flat in pending requests
        boolean mobilePending = registrationRepository
                .findByStatus("PENDING")
                .stream()
                .filter(r -> r.getMobileNumber().equals(request.getMobileNumber()))
                .anyMatch(r -> r.getFlatNumber() != null
                        && r.getFlatNumber().equals(fullFlatNumber));

        if (mobilePending) {
            throw new BadRequestException(
                    "A pending registration request already exists "
                    + "for this mobile number and flat " + fullFlatNumber + ".");
        }

     // 3. Check duplicate aadhaar + flat in active residents
        boolean aadhaarExistsInResidents = residentRepository.findAll()
                .stream()
                .filter(r -> r.getStatus().equals("ACTIVE"))
                .filter(r -> r.getAadhaarLastFour() != null
                        && r.getAadhaarLastFour().equals(request.getAadhaarLastFour()))
                .anyMatch(r -> r.getFlatNumber() != null && (
                        r.getFlatNumber().equals(fullFlatNumber) ||
                        r.getFlatNumber().equals(request.getFlatNumber()) ||
                        r.getFlatNumber().endsWith("-" + request.getFlatNumber())
                ));

        if (aadhaarExistsInResidents) {
            throw new BadRequestException(
                    "You are already registered for flat "
                    + fullFlatNumber + " with this Aadhaar number.");
        }

     // 4. Check duplicate aadhaar + flat in pending requests
        boolean aadhaarPending = registrationRepository
                .findByStatus("PENDING")
                .stream()
                .filter(r -> r.getAadhaarLastFour() != null
                        && r.getAadhaarLastFour().equals(request.getAadhaarLastFour()))
                .anyMatch(r -> r.getFlatNumber() != null
                        && r.getFlatNumber().equals(fullFlatNumber));

        if (aadhaarPending) {
            throw new BadRequestException(
                    "A pending registration already exists for flat "
                    + fullFlatNumber + " with this Aadhaar number.");
        }

     // 5. Check flat occupied — for OWNER strictly no duplicates
        if (request.getResidentType().equals("OWNER")) {
            boolean flatOccupied = residentRepository.findAll()
                    .stream()
                    .filter(r -> r.getStatus().equals("ACTIVE"))
                    .filter(r -> r.getResidentType().equals("OWNER"))
                    .anyMatch(r -> r.getFlatNumber() != null
                            && r.getFlatNumber().equals(fullFlatNumber));

            if (flatOccupied) {
                throw new BadRequestException(
                        "Flat " + fullFlatNumber
                        + " already has an active owner.");
            }

            boolean flatPendingOwner = registrationRepository
                    .findByStatus("PENDING")
                    .stream()
                    .filter(r -> r.getResidentType().equals("OWNER"))
                    .anyMatch(r -> r.getFlatNumber() != null
                            && r.getFlatNumber().equals(fullFlatNumber));

            if (flatPendingOwner) {
                throw new BadRequestException(
                        "A pending owner registration already exists "
                        + "for flat " + fullFlatNumber + ".");
            }
        }

        // 6. Check flat occupied for TENANT
        if (request.getResidentType().equals("TENANT")) {
            boolean tenantOccupied = residentRepository.findAll()
                    .stream()
                    .filter(r -> r.getStatus().equals("ACTIVE"))
                    .filter(r -> r.getResidentType().equals("TENANT"))
                    .anyMatch(r -> r.getFlatNumber() != null
                            && r.getFlatNumber().equals(fullFlatNumber));

            if (tenantOccupied) {
                throw new BadRequestException(
                        "Flat " + fullFlatNumber
                        + " already has an active tenant.");
            }

            boolean flatPendingTenant = registrationRepository
                    .findByStatus("PENDING")
                    .stream()
                    .filter(r -> r.getResidentType().equals("TENANT"))
                    .anyMatch(r -> r.getFlatNumber() != null
                            && r.getFlatNumber().equals(fullFlatNumber));

            if (flatPendingTenant) {
                throw new BadRequestException(
                        "A pending tenant registration already exists "
                        + "for flat " + fullFlatNumber + ".");
            }
        }
        // All checks passed — save request
        RegistrationRequest reg = RegistrationRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .mobileNumber(request.getMobileNumber())
                .aadhaarLastFour(request.getAadhaarLastFour())
                .residentType(request.getResidentType())
                .wingName(request.getWingName())
                .flatNumber(fullFlatNumber)
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
    @Transactional
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

        // Reuse existing credential for same mobile, create new if not exists
        Credential credential = credentialRepository
                .findByLoginIdentifier(reg.getMobileNumber())
                .orElseGet(() -> {
                    Credential newCred = Credential.builder()
                            .loginIdentifier(reg.getMobileNumber())
                            .passwordHash(null)
                            .role("RESIDENT")
                            .createdAt(LocalDateTime.now())
                            .build();
                    return credentialRepository.save(newCred);
                });

        // Build flat number — only add wing prefix if not already prefixed
        String flatNumber = reg.getFlatNumber();
        if (reg.getWingName() != null
                && !flatNumber.contains("-")) {
            flatNumber = reg.getWingName() + "-" + flatNumber;
        }

        ResidentProfile resident = ResidentProfile.builder()
                .firstName(reg.getFirstName())
                .lastName(reg.getLastName())
                .mobileNumber(reg.getMobileNumber())
                .aadhaarLastFour(reg.getAadhaarLastFour())
                .residentType(reg.getResidentType())
                .flatNumber(flatNumber)
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
    
    @Override
    public boolean isFlatOccupied(String wingName, String flatNumber, String residentType) {
        // Only check exact combined format — no partial matching
        String fullFlatNumber = wingName + "-" + flatNumber;

        return residentRepository.findAll()
                .stream()
                .filter(r -> r.getStatus() != null
                        && r.getStatus().equals("ACTIVE"))
                .filter(r -> r.getResidentType() != null
                        && r.getResidentType().equals(residentType))
                .anyMatch(r -> r.getFlatNumber() != null
                        && r.getFlatNumber().equals(fullFlatNumber));
    }
            @Override
            public List<RegistrationRequestDTO> getPendingRequests() {
                return registrationRepository
                        .findByStatus("PENDING")
                        .stream()
                        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                        .map(RegistrationRequestMapper::toDTO)
                        .collect(Collectors.toList());
            }

            @Override
            public List<RegistrationRequestDTO> getHistory() {
                return registrationRepository
                        .findByStatusNot("PENDING")
                        .stream()
                        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                        .map(RegistrationRequestMapper::toDTO)
                        .collect(Collectors.toList());
            }
            
            @Override
            public boolean hasPendingTenantForFlat(String flatNumber) {
                return registrationRepository
                        .findByStatus("PENDING")
                        .stream()
                        .anyMatch(r ->
                                r.getResidentType().equals("TENANT")
                                && r.getFlatNumber() != null
                                && r.getFlatNumber().equals(flatNumber));
            }
}