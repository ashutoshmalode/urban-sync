package com.urbansync.communication;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository
        extends JpaRepository<Announcement, Long> {
	long countByType(String type);

    @Query("""
        SELECT a FROM Announcement a
        LEFT JOIN FETCH a.createdBy
        ORDER BY a.createdAt DESC
    """)
    List<Announcement> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT a FROM Announcement a
        LEFT JOIN FETCH a.createdBy
        WHERE a.type = :type
        ORDER BY a.createdAt DESC
    """)
    List<Announcement> findByType(String type);

    @Query("""
        SELECT a FROM Announcement a
        LEFT JOIN FETCH a.createdBy
        WHERE a.id = :id
    """)
    Optional<Announcement> findById(Long id);

}