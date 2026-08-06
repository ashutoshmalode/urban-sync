package com.urbansync.config;

import com.urbansync.config.security.JwtAuthenticationEntryPoint;
import com.urbansync.config.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

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
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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
            	            "/api/registration/resident",
            	            "/api/registration/check-flat",
            	            "/api/registration/verify-owner",
            	            "/api/registration/fetch-owner-by-flat",
            	            "/api/registration/check-pending-tenant",
            	            "/api/auth/otp-login",
            	            "/api/auth/send-otp",
            	            "/api/auth/verify-otp"
            	    ).permitAll()

            	    // RESIDENT accessible endpoints
            	    .requestMatchers(
            	            "/api/resident/**",
            	            "/api/maintenance/bills/resident/**",
            	            "/api/complaint/resident/**",
            	            "/api/permission/resident/**",
            	            "/api/announcement/all",
            	            "/api/payment/create-order",
            	            "/api/payment/verify",
            	            "/api/property/post/all",
            	            "/api/property/post/*/images"
            	    ).hasAnyRole("RESIDENT", "SECRETARY")

            	    // CARETAKER accessible endpoints
            	    .requestMatchers(
            	            "/api/caretaker/me",
            	            "/api/caretaker-issue/caretaker/**"
            	    ).hasAnyRole("CARETAKER", "SECRETARY")

            	    // SECRETARY only endpoints
            	    .requestMatchers(
            	            "/api/secretary/**",
            	            "/api/registration/**",
            	            "/api/caretaker/**",
            	            "/api/payment/**",
            	            "/api/flat/**",
            	            "/api/property/**",
            	            "/api/complaint/**",
            	            "/api/caretaker-issue/**",
            	            "/api/maintenance/**",
            	            "/api/permission/**",
            	            "/api/announcement/**",
            	            "/api/dashboard/**",
            	            "/api/scheduler/**"
            	    ).hasRole("SECRETARY")

            	    .anyRequest().authenticated())
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class)
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(form -> form.disable());

        return http.build();
    }

}