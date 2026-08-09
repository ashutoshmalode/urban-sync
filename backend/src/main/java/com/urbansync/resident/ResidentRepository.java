package com.urbansync.resident;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ResidentRepository
        extends JpaRepository<ResidentProfile, Long> {
	
	long countByStatus(String status);
	
	long countByResidentTypeAndStatus(String residentType, String status);

    Optional<ResidentProfile> findByMobileNumber(String mobileNumber);
    
    @Query("""
    	    SELECT r FROM ResidentProfile r
    	    WHERE r.mobileNumber = :mobile
    	    AND r.flatNumber = :flatNumber
    	    AND r.status = 'ACTIVE'
    	""")
    	Optional<ResidentProfile> findByMobileNumberAndFlatNumber(
    	        @Param("mobile") String mobile,
    	        @Param("flatNumber") String flatNumber);

    Optional<ResidentProfile> findByFlatNumber(String flatNumber);

    List<ResidentProfile> findByStatus(String status);

    boolean existsByFlatNumber(String flatNumber);

    boolean existsByMobileNumber(String mobileNumber);
    
    List<ResidentProfile> findByAadhaarLastFour(String aadhaarLastFour);
    
    
    

}