package com.volleyball.tournament.player;

import com.volleyball.tournament.auth.PlayerDirectory;
import com.volleyball.tournament.player.entity.Player;
import com.volleyball.tournament.player.repository.PlayerRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Lets the auth module link a login account to a player registration by email. */
@Component
@RequiredArgsConstructor
public class PlayerDirectoryImpl implements PlayerDirectory {

    private final PlayerRepository playerRepository;

    @Override
    public Optional<Long> findActivePlayerIdByEmail(String email) {
        return playerRepository.findFirstByEmailIgnoreCaseOrderByCreatedAtDesc(email)
                .map(Player::getId);
    }
}
