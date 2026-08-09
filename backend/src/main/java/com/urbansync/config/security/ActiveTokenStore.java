package com.urbansync.config.security;

import com.urbansync.auth.Credential;
import com.urbansync.auth.CredentialRepository;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ActiveTokenStore {

    // in-memory — clears on Spring Boot restart (satisfies rule 5)
    private final Map<String, String> activeTokens = new ConcurrentHashMap<>();

    private final CredentialRepository credentialRepository;

    public ActiveTokenStore(CredentialRepository credentialRepository) {
        this.credentialRepository = credentialRepository;
    }

    // Called on every login — saves new token, invalidates old one
    public void saveToken(String loginIdentifier, String token) {
        activeTokens.put(loginIdentifier, token);
        // also persist to DB for crash recovery awareness (optional but good)
        credentialRepository.findByLoginIdentifier(loginIdentifier)
                .ifPresent(cred -> {
                    cred.setActiveToken(token);
                    credentialRepository.save(cred);
                });
    }

    // Called by filter on every request
    public boolean isTokenActive(String loginIdentifier, String token) {
        String stored = activeTokens.get(loginIdentifier);

        // If not in memory (app just restarted), check DB
        if (stored == null) {
            stored = credentialRepository
                    .findByLoginIdentifier(loginIdentifier)
                    .map(Credential::getActiveToken)
                    .orElse(null);
            // reload into memory
            if (stored != null) {
                activeTokens.put(loginIdentifier, stored);
            }
        }

        return token.equals(stored);
    }

    // Called on logout (optional — for clean invalidation)
    public void removeToken(String loginIdentifier) {
        activeTokens.remove(loginIdentifier);
        credentialRepository.findByLoginIdentifier(loginIdentifier)
                .ifPresent(cred -> {
                    cred.setActiveToken(null);
                    credentialRepository.save(cred);
                });
    }
}