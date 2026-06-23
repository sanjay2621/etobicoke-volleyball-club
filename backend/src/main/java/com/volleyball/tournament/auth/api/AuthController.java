package com.volleyball.tournament.auth.api;

import com.volleyball.tournament.auth.model.AuthResponse;
import com.volleyball.tournament.auth.model.LoginRequest;
import com.volleyball.tournament.auth.model.RefreshRequest;
import com.volleyball.tournament.auth.model.RegisterAccountRequest;
import com.volleyball.tournament.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/register-account")
    public ResponseEntity<AuthResponse> registerAccount(@Valid @RequestBody RegisterAccountRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerAccount(req));
    }

    @PostMapping("/reset-password")
    public AuthResponse resetPassword(@Valid @RequestBody RegisterAccountRequest req) {
        return authService.resetPassword(req);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest req) {
        return authService.refresh(req);
    }
}
