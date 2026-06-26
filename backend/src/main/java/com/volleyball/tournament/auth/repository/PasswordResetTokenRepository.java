package com.volleyball.tournament.auth.repository;

import com.volleyball.tournament.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(String email);

    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE LOWER(t.email) = LOWER(?1)")
    void markAllUsedForEmail(String email);
}