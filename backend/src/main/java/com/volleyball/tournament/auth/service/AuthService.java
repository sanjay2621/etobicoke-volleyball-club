package com.volleyball.tournament.auth.service;

import com.volleyball.tournament.auth.PlayerDirectory;
import com.volleyball.tournament.auth.entity.Role;
import com.volleyball.tournament.auth.entity.UserAccount;
import com.volleyball.tournament.auth.model.AuthResponse;
import com.volleyball.tournament.auth.model.LoginRequest;
import com.volleyball.tournament.auth.model.RefreshRequest;
import com.volleyball.tournament.auth.model.RegisterAccountRequest;
import com.volleyball.tournament.auth.repository.UserAccountRepository;
import com.volleyball.tournament.common.exception.ApiException;
import com.volleyball.tournament.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ObjectProvider<PlayerDirectory> playerDirectory;

    @Transactional
    public AuthResponse registerAccount(RegisterAccountRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account already exists for this email");
        }
        PlayerDirectory directory = playerDirectory.getIfAvailable();
        Long playerId = (directory == null ? java.util.Optional.<Long>empty()
                : directory.findActivePlayerIdByEmail(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "No player registration found for this email. Register for a tournament first."));

        UserAccount account = new UserAccount();
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(req.password()));
        account.setRole(Role.PLAYER);
        account.setPlayerId(playerId);
        account.setEnabled(true);
        userAccountRepository.save(account);

        return issueTokens(account);
    }

    /**
     * Resets the password for a player who has registered for a tournament. Creates the login if it
     * does not exist yet, or overwrites the existing password. Matches the existing email-only trust
     * model (no email verification), used by the "Forgot password?" flow.
     */
    @Transactional
    public AuthResponse resetPassword(RegisterAccountRequest req) {
        String email = req.email().trim().toLowerCase();
        PlayerDirectory directory = playerDirectory.getIfAvailable();
        Long playerId = (directory == null ? java.util.Optional.<Long>empty()
                : directory.findActivePlayerIdByEmail(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "No player registration found for this email. Register for a tournament first."));

        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    UserAccount created = new UserAccount();
                    created.setEmail(email);
                    created.setRole(Role.PLAYER);
                    created.setPlayerId(playerId);
                    created.setEnabled(true);
                    return created;
                });
        account.setPasswordHash(passwordEncoder.encode(req.password()));
        userAccountRepository.save(account);

        return issueTokens(account);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.password()));
        } catch (BadCredentialsException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return issueTokens(account);
    }

    public AuthResponse refresh(RefreshRequest req) {
        final Claims claims;
        try {
            claims = jwtService.parse(req.refreshToken());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        if (!jwtService.isRefreshToken(claims)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Not a refresh token");
        }
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(claims.getSubject())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account no longer exists"));
        return issueTokens(account);
    }

    private AuthResponse issueTokens(UserAccount account) {
        String access = jwtService.generateAccessToken(
                account.getEmail(), account.getRole().name(), account.getId(), account.getPlayerId());
        String refresh = jwtService.generateRefreshToken(account.getEmail());
        return new AuthResponse(access, refresh, account.getEmail(), account.getRole().name(), account.getPlayerId());
    }
}
