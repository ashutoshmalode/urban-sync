package com.urbansync.registration;

import java.util.List;

public interface RegistrationService {

    RegistrationRequestDTO submit(RegistrationSubmitRequest request);

    List<RegistrationRequestDTO> getPendingRequests();

    List<RegistrationRequestDTO> getHistory();

    RegistrationRequestDTO approve(Long id);

    RegistrationRequestDTO reject(Long id, RejectionRequest request);
    
    boolean isFlatOccupied(String wingName, String flatNumber, String residentType);
    
    boolean hasPendingTenantForFlat(String flatNumber);

}