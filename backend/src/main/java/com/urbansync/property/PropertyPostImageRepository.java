package com.urbansync.property;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyPostImageRepository
        extends JpaRepository<PropertyPostImage, Long> {

    @Query("""
        SELECT i FROM PropertyPostImage i
        LEFT JOIN FETCH i.post
        WHERE i.post.id = :postId
        ORDER BY i.createdAt ASC
    """)
    List<PropertyPostImage> findByPostId(Long postId);

    int countByPostId(Long postId);
    
    

}

