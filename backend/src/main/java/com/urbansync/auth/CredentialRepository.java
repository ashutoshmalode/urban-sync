package com.urbansync.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CredentialRepository
        extends JpaRepository<Credential, Long> {

    Optional<Credential> findByLoginIdentifier(String loginIdentifier);

}
