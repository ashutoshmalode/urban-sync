package com.urbansync.complaint;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CaretakerIssueMediaRepository
        extends JpaRepository<CaretakerIssueMedia, Long> {

    @Query("""
        SELECT m FROM CaretakerIssueMedia m
        LEFT JOIN FETCH m.issue
        WHERE m.issue.id = :issueId
        ORDER BY m.createdAt ASC
    """)
    List<CaretakerIssueMedia> findByIssueId(Long issueId);

}