package com.urbansync.complaint;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintMediaRepository
        extends JpaRepository<ComplaintMedia, Long> {

    @Query("""
        SELECT m FROM ComplaintMedia m
        LEFT JOIN FETCH m.complaint
        WHERE m.complaint.id = :complaintId
        ORDER BY m.createdAt ASC
    """)
    List<ComplaintMedia> findByComplaintId(Long complaintId);

}