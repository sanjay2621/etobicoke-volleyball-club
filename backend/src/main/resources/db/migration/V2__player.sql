-- V2: player registrations + preferred positions

CREATE TABLE player (
    id                       BIGINT        GENERATED ALWAYS AS IDENTITY,
    tournament_id            BIGINT        NOT NULL,
    first_name               VARCHAR(255)  NOT NULL,
    middle_name              VARCHAR(255)  NULL,
    last_name                VARCHAR(255)  NOT NULL,
    phone                    VARCHAR(40)   NOT NULL,
    email                    VARCHAR(255)  NOT NULL,
    photo_path               VARCHAR(512)  NULL,
    address_line1            VARCHAR(255)  NULL,
    address_line2            VARCHAR(255)  NULL,
    address_city             VARCHAR(120)  NULL,
    address_province         VARCHAR(120)  NULL,
    address_postal_code      VARCHAR(20)   NULL,
    address_country          VARCHAR(80)   NULL,
    tshirt_size              VARCHAR(8)    NOT NULL,
    emergency_contact_name   VARCHAR(255)  NULL,
    emergency_contact_phone  VARCHAR(40)   NULL,
    skill_level              VARCHAR(20)   NULL,
    years_experience         INT           NULL,
    jersey_number_preference INT           NULL,
    waiver_accepted          BOOLEAN       NOT NULL DEFAULT FALSE,
    photo_consent            BOOLEAN       NOT NULL DEFAULT FALSE,
    dietary_notes            VARCHAR(512)  NULL,
    gender                   VARCHAR(40)   NULL,
    date_of_birth            DATE          NULL,
    payment_status           VARCHAR(12)   NOT NULL DEFAULT 'UNPAID',
    notes                    VARCHAR(1000) NULL,
    manual_entry             BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted                  BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMP(6)  NULL,
    updated_at               TIMESTAMP(6)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_player_tournament FOREIGN KEY (tournament_id) REFERENCES tournament (id)
);

CREATE INDEX idx_player_tournament ON player (tournament_id);
CREATE INDEX idx_player_email ON player (email);
CREATE INDEX idx_player_phone ON player (phone);

CREATE TABLE player_position (
    player_id BIGINT      NOT NULL,
    position  VARCHAR(20) NOT NULL,
    PRIMARY KEY (player_id, position),
    CONSTRAINT fk_player_position_player FOREIGN KEY (player_id) REFERENCES player (id)
);
