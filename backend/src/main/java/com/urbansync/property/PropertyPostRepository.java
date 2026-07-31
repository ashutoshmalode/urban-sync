package com.urbansync.property;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyPostRepository extends JpaRepository<PropertyPost, Long> {

    @Query("""
        SELECT p
        FROM PropertyPost p
        LEFT JOIN FETCH p.flat
        WHERE p.isActive = true
        ORDER BY p.createdAt DESC
    """)
    List<PropertyPost> findByIsActiveTrue();

    @Query("""
        SELECT p
        FROM PropertyPost p
        LEFT JOIN FETCH p.flat
        WHERE p.isActive = false
        ORDER BY p.createdAt DESC
    """)
    List<PropertyPost> findByIsActiveFalse();

    @Query("""
        SELECT p
        FROM PropertyPost p
        LEFT JOIN FETCH p.flat
        ORDER BY p.createdAt DESC
    """)
    List<PropertyPost> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT p
        FROM PropertyPost p
        LEFT JOIN FETCH p.flat
        WHERE p.listingType = :listingType
    """)
    List<PropertyPost> findByListingType(String listingType);

    @Query("""
        SELECT p
        FROM PropertyPost p
        LEFT JOIN FETCH p.flat
        WHERE p.id = :id
    """)
    Optional<PropertyPost> findById(Long id);
}