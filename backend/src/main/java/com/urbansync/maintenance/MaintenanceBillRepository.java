package com.urbansync.maintenance;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceBillRepository
        extends JpaRepository<MaintenanceBill, Long> {

    @Query("""
        SELECT b FROM MaintenanceBill b
        LEFT JOIN FETCH b.flat
        LEFT JOIN FETCH b.resident
        WHERE b.status = 'PENDING'
        ORDER BY b.createdAt DESC
    """)
    List<MaintenanceBill> findAllPending();

    @Query("""
        SELECT b FROM MaintenanceBill b
        LEFT JOIN FETCH b.flat
        LEFT JOIN FETCH b.resident
        WHERE b.status = 'PAID'
        ORDER BY b.paidAt DESC
    """)
    List<MaintenanceBill> findAllPaid();

    @Query("""
        SELECT b FROM MaintenanceBill b
        LEFT JOIN FETCH b.flat
        LEFT JOIN FETCH b.resident
        ORDER BY b.createdAt DESC
    """)
    List<MaintenanceBill> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT b FROM MaintenanceBill b
        LEFT JOIN FETCH b.flat
        LEFT JOIN FETCH b.resident
        WHERE b.resident.id = :residentId
        ORDER BY b.createdAt DESC
    """)
    List<MaintenanceBill> findByResidentId(Long residentId);

    @Query("""
        SELECT b FROM MaintenanceBill b
        LEFT JOIN FETCH b.flat
        LEFT JOIN FETCH b.resident
        WHERE b.flat.id = :flatId
        ORDER BY b.createdAt DESC
    """)
    List<MaintenanceBill> findByFlatId(Long flatId);

    @Query("""
        SELECT b FROM MaintenanceBill b
        LEFT JOIN FETCH b.flat
        LEFT JOIN FETCH b.resident
        WHERE b.id = :id
    """)
    Optional<MaintenanceBill> findById(Long id);

    boolean existsByFlatIdAndBillMonthAndBillYear(
            Long flatId, Integer billMonth, Integer billYear);

}