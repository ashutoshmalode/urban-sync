package com.urbansync.payment;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocietyFundRepository
        extends JpaRepository<SocietyFund, Long> {

    Optional<SocietyFund> findFirstByOrderByIdAsc();

}