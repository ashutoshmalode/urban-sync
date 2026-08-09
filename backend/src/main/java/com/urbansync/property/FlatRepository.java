package com.urbansync.property;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FlatRepository extends JpaRepository<Flat, Long> {
	long countByOwnerIsNotNull();
	long countByOwnerIsNull();

	@Query("""
		    SELECT f FROM Flat f
		    LEFT JOIN FETCH f.wing
		    LEFT JOIN FETCH f.owner
		    LEFT JOIN FETCH f.currentTenant
		    WHERE f.flatNumber = :flatNumber
		""")
		Optional<Flat> findByFlatNumber(String flatNumber);

    boolean existsByFlatNumber(String flatNumber);

    @Query("""
        SELECT f
        FROM Flat f
        LEFT JOIN FETCH f.wing
        LEFT JOIN FETCH f.owner
        LEFT JOIN FETCH f.currentTenant
        WHERE f.owner IS NULL
        ORDER BY f.flatNumber
    """)
    List<Flat> findByOwnerIsNull();

    List<Flat> findByOwnerIsNotNull();

    List<Flat> findByCurrentTenantIsNull();

    @Query("""
        SELECT f
        FROM Flat f
        LEFT JOIN FETCH f.wing
        LEFT JOIN FETCH f.owner
        LEFT JOIN FETCH f.currentTenant
        ORDER BY f.flatNumber
    """)
    List<Flat> findAllByOrderByFlatNumberAsc();

    @Query("""
        SELECT f
        FROM Flat f
        LEFT JOIN FETCH f.wing
        LEFT JOIN FETCH f.owner
        LEFT JOIN FETCH f.currentTenant
        WHERE f.id = :id
    """)
    Optional<Flat> findById(Long id);
}