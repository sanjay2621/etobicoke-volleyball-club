-- V16: admin-flagged "priority" players, drafted before the remaining pool
ALTER TABLE player ADD COLUMN draft_priority BOOLEAN NOT NULL DEFAULT FALSE;
