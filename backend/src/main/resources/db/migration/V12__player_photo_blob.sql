-- Render's web service filesystem is ephemeral (no persistent disk on the free plan), so
-- uploaded photo files stored on disk under uploads/ do not survive a deploy or restart.
-- Move photo storage into Postgres (already persistent) as a bytea column instead.
ALTER TABLE player ADD COLUMN photo_data BYTEA;
ALTER TABLE player ADD COLUMN photo_content_type VARCHAR(50);
ALTER TABLE player DROP COLUMN photo_path;
