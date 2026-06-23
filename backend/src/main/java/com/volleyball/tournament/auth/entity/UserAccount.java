package com.volleyball.tournament.auth.entity;

import com.volleyball.tournament.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "user_account")
@SQLRestriction("deleted = false")
public class UserAccount extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /** Links a PLAYER account to its registration; null for ADMIN accounts. */
    @Column(name = "player_id")
    private Long playerId;

    @Column(nullable = false)
    private boolean enabled = true;
}