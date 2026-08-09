package com.urbansync.secretary;

import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SecretaryOtpStore {

    private record OtpEntry(String otp, Instant expiresAt) {}

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    public void save(String email, String otp) {
        // OTP valid for 5 minutes
        store.put(email, new OtpEntry(otp, Instant.now().plusSeconds(300)));
    }

    public boolean verify(String email, String otp) {
        OtpEntry entry = store.get(email);
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiresAt())) {
            store.remove(email);
            return false;
        }
        if (!entry.otp().equals(otp)) return false;
        store.remove(email); // one-time use
        return true;
    }
}