package com.volleyball.tournament.auth.repository;

import com.volleyball.tournament.auth.entity.Role;
import com.volleyball.tournament.auth.entity.UserAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRole(Role role);

    boolean existsByPlayerId(Long playerId);

    Optional<UserAccount> findByPlayerId(Long playerId);
}