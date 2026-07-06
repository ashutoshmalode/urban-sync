package com.urbansync.config.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.urbansync.auth.Credential;

public class CustomUserDetails implements UserDetails {

    private final Credential credential;

    public CustomUserDetails(Credential credential) {
        this.credential = credential;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return List.of(
                new SimpleGrantedAuthority(
                        "ROLE_" + credential.getRole()
                )
        );
    }

    @Override
    public String getPassword() {
        return credential.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return credential.getLoginIdentifier();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Credential getCredential() {
        return credential;
    }

}
