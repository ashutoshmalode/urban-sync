package com.urbansync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UrbansyncBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(UrbansyncBackendApplication.class, args);
    }
}