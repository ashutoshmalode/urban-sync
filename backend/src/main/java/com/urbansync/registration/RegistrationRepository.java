package com.urbansync.registration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRepository
        extends JpaRepository<RegistrationRequest, Long> {

    long countByStatus(String status);

}