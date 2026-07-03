-- V4: draft state (one per tournament)

CREATE TABLE draft (
    id                 BIGINT       GENERATED ALWAYS AS IDENTITY,
    tournament_id      BIGINT       NOT NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'NOT_STARTED',
    current_round      INT          NOT NULL DEFAULT 1,
    current_pick_index INT          NOT NULL DEFAULT 0,
    total_rounds       INT          NOT NULL DEFAULT 0,
    deleted            BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP(6) NULL,
    updated_at         TIMESTAMP(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_draft_tournament UNIQUE (tournament_id),
    CONSTRAINT fk_draft_tournament FOREIGN KEY (tournament_id) REFERENCES tournament (id)
);
