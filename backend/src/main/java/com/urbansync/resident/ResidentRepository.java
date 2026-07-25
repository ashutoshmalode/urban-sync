package com.urbansync.resident;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResidentRepository
        extends JpaRepository<ResidentProfile, Long> {

    Optional<ResidentProfile> findByMobileNumber(String mobileNumber);

    Optional<ResidentProfile> findByFlatNumber(String flatNumber);

    List<ResidentProfile> findByStatus(String status);

    boolean existsByFlatNumber(String flatNumber);

    boolean existsByMobileNumber(String mobileNumber);

}