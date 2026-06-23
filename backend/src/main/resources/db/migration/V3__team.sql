-- V3: teams + team membership

CREATE TABLE team (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    tournament_id     BIGINT       NOT NULL,
    name              VARCHAR(255) NOT NULL,
    captain_player_id BIGINT       NULL,
    referee_player_id BIGINT       NULL,
    group_label       VARCHAR(4)   NULL,
    seed              INT          NOT NULL DEFAULT 0,
    deleted           BIT          NOT NULL DEFAULT 0,
    created_at        DATETIME(6)  NULL,
    updated_at        DATETIME(6)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_team_tournament FOREIGN KEY (tournament_id) REFERENCES tournament (id)
) ENGINE = InnoDB;

CREATE INDEX idx_team_tournament ON team (tournament_id);

CREATE TABLE team_member (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    team_id     BIGINT      NOT NULL,
    player_id   BIGINT      NOT NULL,
    draft_round INT         NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_team_member UNIQUE (team_id, player_id),
    CONSTRAINT fk_team_member_team FOREIGN KEY (team_id) REFERENCES team (id),
    CONSTRAINT fk_team_member_player FOREIGN KEY (player_id) REFERENCES player (id)
) ENGINE = InnoDB;

CREATE INDEX idx_team_member_player ON team_member (player_id);
