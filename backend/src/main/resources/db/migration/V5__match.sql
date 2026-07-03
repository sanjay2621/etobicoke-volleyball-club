-- V5: matches + set scores

CREATE TABLE match_game (
    id              BIGINT       GENERATED ALWAYS AS IDENTITY,
    tournament_id   BIGINT       NOT NULL,
    stage           VARCHAR(12)  NOT NULL,
    group_label     VARCHAR(4)   NULL,
    round_number    INT          NULL,
    court           INT          NULL,
    scheduled_start TIMESTAMP(6) NULL,
    home_team_id    BIGINT       NULL,
    away_team_id    BIGINT       NULL,
    bracket_slot    VARCHAR(12)  NULL,
    home_source     VARCHAR(24)  NULL,
    away_source     VARCHAR(24)  NULL,
    status          VARCHAR(12)  NOT NULL DEFAULT 'SCHEDULED',
    winner_team_id  BIGINT       NULL,
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP(6) NULL,
    updated_at      TIMESTAMP(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_match_tournament FOREIGN KEY (tournament_id) REFERENCES tournament (id)
);

CREATE INDEX idx_match_tournament ON match_game (tournament_id);
CREATE INDEX idx_match_stage ON match_game (tournament_id, stage);

CREATE TABLE match_set (
    id          BIGINT GENERATED ALWAYS AS IDENTITY,
    match_id    BIGINT NOT NULL,
    set_number  INT    NOT NULL,
    home_points INT    NOT NULL,
    away_points INT    NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_match_set UNIQUE (match_id, set_number),
    CONSTRAINT fk_match_set_match FOREIGN KEY (match_id) REFERENCES match_game (id)
);
