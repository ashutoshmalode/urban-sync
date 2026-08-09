package com.urbansync.caretaker;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CaretakerRepository
        extends JpaRepository<CaretakerProfile, Long> {
	
	long countByStatus(String status);

    Optional<CaretakerProfile> findByMobileNumber(String mobileNumber);

    Optional<CaretakerProfile> findBySerialNumber(Integer serialNumber);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByAadhaarNumber(String aadhaarNumber);

    List<CaretakerProfile> findAllByOrderBySerialNumberAsc();

    @Query("SELECT COALESCE(MAX(c.serialNumber), 0) FROM CaretakerProfile c")
    int findMaxSerialNumber();
    
    Optional<CaretakerProfile> findByAadhaarNumber(String aadhaarNumber);

}