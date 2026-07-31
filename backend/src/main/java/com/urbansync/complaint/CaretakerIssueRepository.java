package com.urbansync.complaint;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CaretakerIssueRepository
        extends JpaRepository<CaretakerIssue, Long> {

    @Query("""
        SELECT i FROM CaretakerIssue i
        LEFT JOIN FETCH i.assignedTo
        LEFT JOIN FETCH i.assignedBy
        WHERE i.assignedTo.id = :caretakerId
        ORDER BY i.createdAt DESC
    """)
    List<CaretakerIssue> findByAssignedToId(Long caretakerId);

    @Query("""
        SELECT i FROM CaretakerIssue i
        LEFT JOIN FETCH i.assignedTo
        LEFT JOIN FETCH i.assignedBy
        ORDER BY i.createdAt DESC
    """)
    List<CaretakerIssue> findAllByOrderByCreatedAtDesc();

}