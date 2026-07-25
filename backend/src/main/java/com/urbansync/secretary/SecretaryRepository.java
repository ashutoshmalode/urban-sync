package com.urbansync.secretary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecretaryRepository
        extends JpaRepository<SecretaryProfile, Long> {

    Optional<SecretaryProfile> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByMobileNumber(String mobileNumber);

}