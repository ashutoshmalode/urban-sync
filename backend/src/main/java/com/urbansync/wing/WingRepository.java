package com.urbansync.wing;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WingRepository extends JpaRepository<Wing, Long> {

    Optional<Wing> findByWingName(String wingName);

    boolean existsByWingName(String wingName);

}
