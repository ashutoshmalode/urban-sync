package com.urbansync.caretaker;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaretakerRepository
        extends JpaRepository<CaretakerProfile, Long> {

    Optional<CaretakerProfile> findByMobileNumber(String mobileNumber);

    Optional<CaretakerProfile> findBySerialNumber(Integer serialNumber);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByAadhaarNumber(String aadhaarNumber);

}