package com.urbansync.config;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {

        InputStream serviceAccount = null;

        // 1. Check environment variable first (used on Render in production)
        String firebaseJson = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");
        if (firebaseJson != null && !firebaseJson.isBlank()) {
            serviceAccount = new ByteArrayInputStream(
                    firebaseJson.getBytes(StandardCharsets.UTF_8));
        }

        // 2. Try classpath (local development with file present)
        if (serviceAccount == null) {
            serviceAccount = getClass()
                    .getResourceAsStream("/firebase-service-account.json");
        }

        // 3. Try file system fallback (local development)
        if (serviceAccount == null) {
            serviceAccount = new FileInputStream(
                    "src/main/resources/firebase-service-account.json");
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }

        return FirebaseAuth.getInstance();
    }
}