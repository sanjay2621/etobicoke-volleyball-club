-- V1: authentication accounts + tournaments

CREATE TABLE user_account (
    id            BIGINT       GENERATED ALWAYS AS IDENTITY,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    player_id     BIGINT       NULL,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    deleted       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP(6) NULL,
    updated_at    TIMESTAMP(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_user_account_email UNIQUE (email)
);

CREATE TABLE tournament (
    id                          BIGINT       GENERATED ALWAYS AS IDENTITY,
    name                        VARCHAR(255) NOT NULL,
    tournament_date             DATE         NOT NULL,
    start_time                  TIME         NOT NULL,
    venue                       VARCHAR(255) NULL,
    number_of_courts            INT          NOT NULL DEFAULT 4,
    break_minutes               INT          NOT NULL DEFAULT 10,
    pool_match_duration_minutes INT          NOT NULL DEFAULT 20,
    pool_sets_to_win            INT          NOT NULL DEFAULT 1,
    pool_points_per_set         INT          NOT NULL DEFAULT 25,
    final_sets_to_win           INT          NOT NULL DEFAULT 2,
    final_points_per_set        INT          NOT NULL DEFAULT 15,
    target_roster_size          INT          NOT NULL DEFAULT 6,
    captain_counts_in_roster    BOOLEAN      NOT NULL DEFAULT TRUE,
    registration_open           BOOLEAN      NOT NULL DEFAULT TRUE,
    status                      VARCHAR(20)  NOT NULL DEFAULT 'SETUP',
    deleted                     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMP(6) NULL,
    updated_at                  TIMESTAMP(6) NULL,
    PRIMARY KEY (id)
);

CREATE INDEX idx_user_account_player ON user_account (player_id);
