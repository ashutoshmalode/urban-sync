package com.urbansync.maintenance;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceBillRepository
        extends JpaRepository<MaintenanceBill, Long> {

    List<MaintenanceBill> findByStatus(String status);

    List<MaintenanceBill> findByResidentId(Long residentId);

    List<MaintenanceBill> findByResidentIdAndStatus(
            Long residentId, String status);

}