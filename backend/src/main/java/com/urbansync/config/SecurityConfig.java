package com.urbansync.config;

import com.urbansync.config.security.JwtAuthenticationEntryPoint;
import com.urbansync.config.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http

            .csrf(csrf -> csrf.disable())

            .exceptionHandling(exception ->
                    exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))

            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                    .requestMatchers(
                            "/api/auth/**",
                            "/api/test/**",
                            "/api/secretary/register",
                            "/api/secretary/is-registered",
                            "/api/registration/resident"
                    ).permitAll()

                    .requestMatchers(
                            "/api/secretary/**",
                            "/api/registration/**",
                            "/api/caretaker/**"
                    ).hasRole("SECRETARY")

                    .anyRequest()
                    .authenticated())

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class)

            .httpBasic(httphttpBasic -> httphttpBasic.disable())

            .formLogin(form -> form.disable());
 
        return http.build();
    }

}