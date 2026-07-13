-- New rows default to APPROVED first so every already-registered player (including anyone on a
-- live tournament right now) stays team-eligible; the default then flips to PENDING so only
-- registrations submitted after this migration require admin review.
ALTER TABLE player ADD COLUMN approval_status VARCHAR(10) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE player ALTER COLUMN approval_status SET DEFAULT 'PENDING';
ALTER TABLE player ADD COLUMN rejection_reason VARCHAR(500);
