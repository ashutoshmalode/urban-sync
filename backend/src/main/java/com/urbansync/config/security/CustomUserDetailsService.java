package com.urbansync.config.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.urbansync.auth.Credential;
import com.urbansync.auth.CredentialRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final CredentialRepository credentialRepository;

    public CustomUserDetailsService(CredentialRepository credentialRepository) {
        this.credentialRepository = credentialRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Credential credential = credentialRepository
                .findByLoginIdentifier(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found : " + username));

        return new CustomUserDetails(credential);
    }

}
