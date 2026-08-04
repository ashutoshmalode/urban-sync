package com.urbansync.complaint;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

	long countByStatus(String status);
    @Query("""
        SELECT c FROM Complaint c
        LEFT JOIN FETCH c.raisedBy
        LEFT JOIN FETCH c.targetResident
        ORDER BY c.createdAt DESC
    """)
    List<Complaint> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT c FROM Complaint c
        LEFT JOIN FETCH c.raisedBy
        LEFT JOIN FETCH c.targetResident
        WHERE c.raisedBy.id = :residentId
        ORDER BY c.createdAt DESC
    """)
    List<Complaint> findByRaisedById(Long residentId);

    @Query("""
        SELECT c FROM Complaint c
        LEFT JOIN FETCH c.raisedBy
        LEFT JOIN FETCH c.targetResident
        WHERE c.id = :id
    """)
    Optional<Complaint> findById(Long id);

}