package com.urbansync.resident;

import org.springframework.stereotype.Service;
import com.urbansync.exception.ResourceNotFoundException;

@Service
public class ResidentServiceImpl implements ResidentService {

    private final ResidentRepository residentRepository;

    public ResidentServiceImpl(ResidentRepository residentRepository) {
        this.residentRepository = residentRepository;
    }

    @Override
    public ResidentDTO getByMobile(String mobile) {
        ResidentProfile resident = residentRepository
                .findByMobileNumber(mobile)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resident profile not found."));
        return ResidentMapper.toDTO(resident);
    }

    @Override
    public ResidentDTO getByMobileAndFlat(String mobile, String flatNumber) {
        ResidentProfile resident = residentRepository
                .findByMobileNumberAndFlatNumber(mobile, flatNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resident profile not found."));
        return ResidentMapper.toDTO(resident);
    }
}