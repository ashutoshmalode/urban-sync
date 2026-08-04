package com.urbansync.registration;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRequestRepository
        extends JpaRepository<RegistrationRequest, Long> {
	

    List<RegistrationRequest> findByStatus(String status);

    List<RegistrationRequest> findByStatusNot(String status);

    Optional<RegistrationRequest> findByMobileNumber(String mobileNumber);

    boolean existsByMobileNumberAndStatus(
            String mobileNumber, String status);

}