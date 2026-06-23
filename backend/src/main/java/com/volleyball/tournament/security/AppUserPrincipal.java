package com.volleyball.tournament.security;

import com.volleyball.tournament.auth.entity.UserAccount;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/** Spring Security principal backed by a {@link UserAccount}. */
@Getter
public class AppUserPrincipal implements UserDetails {

    private final Long userId;
    private final Long playerId;
    private final String email;
    private final String passwordHash;
    private final String role;
    private final boolean enabled;

    public AppUserPrincipal(UserAccount account) {
        this.userId = account.getId();
        this.playerId = account.getPlayerId();
        this.email = account.getEmail();
        this.passwordHash = account.getPasswordHash();
        this.role = account.getRole().name();
        this.enabled = account.isEnabled();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
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
        return enabled;
    }
}
