-- V5: matches + set scores

CREATE TABLE match_game (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    tournament_id   BIGINT       NOT NULL,
    stage           VARCHAR(12)  NOT NULL,
    group_label     VARCHAR(4)   NULL,
    round_number    INT          NULL,
    court           INT          NULL,
    scheduled_start DATETIME(6)  NULL,
    home_team_id    BIGINT       NULL,
    away_team_id    BIGINT       NULL,
    bracket_slot    VARCHAR(12)  NULL,
    home_source     VARCHAR(24)  NULL,
    away_source     VARCHAR(24)  NULL,
    status          VARCHAR(12)  NOT NULL DEFAULT 'SCHEDULED',
    winner_team_id  BIGINT       NULL,
    deleted         BIT          NOT NULL DEFAULT 0,
    created_at      DATETIME(6)  NULL,
    updated_at      DATETIME(6)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_match_tournament FOREIGN KEY (tournament_id) REFERENCES tournament (id)
) ENGINE = InnoDB;

CREATE INDEX idx_match_tournament ON match_game (tournament_id);
CREATE INDEX idx_match_stage ON match_game (tournament_id, stage);

CREATE TABLE match_set (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    match_id    BIGINT NOT NULL,
    set_number  INT    NOT NULL,
    home_points INT    NOT NULL,
    away_points INT    NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_match_set UNIQUE (match_id, set_number),
    CONSTRAINT fk_match_set_match FOREIGN KEY (match_id) REFERENCES match_game (id)
) ENGINE = InnoDB;
