CREATE TABLE password_reset_token (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NULL,
    updated_at TIMESTAMP    NULL,
    email      VARCHAR(255) NOT NULL,
    code       VARCHAR(6)   NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE INDEX idx_prt_email ON password_reset_token (email);