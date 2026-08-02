package com.urbansync.communication;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionRequestRepository
        extends JpaRepository<PermissionRequest, Long> {

    @Query("""
        SELECT p FROM PermissionRequest p
        LEFT JOIN FETCH p.raisedBy
        ORDER BY p.createdAt DESC
    """)
    List<PermissionRequest> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT p FROM PermissionRequest p
        LEFT JOIN FETCH p.raisedBy
        WHERE p.status = 'PENDING'
        ORDER BY p.createdAt DESC
    """)
    List<PermissionRequest> findAllPending();

    @Query("""
        SELECT p FROM PermissionRequest p
        LEFT JOIN FETCH p.raisedBy
        WHERE p.raisedBy.id = :residentId
        ORDER BY p.createdAt DESC
    """)
    List<PermissionRequest> findByRaisedById(Long residentId);

    @Query("""
        SELECT p FROM PermissionRequest p
        LEFT JOIN FETCH p.raisedBy
        WHERE p.id = :id
    """)
    Optional<PermissionRequest> findById(Long id);

}