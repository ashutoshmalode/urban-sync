package com.urbansync.caretaker;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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
    public CaretakerDTO create(CaretakerCreateRequest request) {

        if (caretakerRepository.existsByMobileNumber(
                request.getMobileNumber())) {
            throw new BadRequestException(
                    "Mobile number already registered.");
        }

        if (caretakerRepository.existsByAadhaarNumber(
                request.getAadhaarNumber())) {
            throw new BadRequestException(
                    "Aadhaar number already registered.");
        }

        // Auto serial number
        int serialNumber = (int) caretakerRepository.count() + 1;

        // Auto-create credential
        Credential credential = Credential.builder()
                .loginIdentifier(request.getMobileNumber())
                .passwordHash(null)
                .role("CARETAKER")
                .createdAt(LocalDateTime.now())
                .build();

        credential = credentialRepository.save(credential);

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
                .build();

        return CaretakerMapper.toDTO(
                caretakerRepository.save(caretaker));
    }

    @Override
    public List<CaretakerDTO> getAllCaretakers() {

        return caretakerRepository.findAll()
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

}