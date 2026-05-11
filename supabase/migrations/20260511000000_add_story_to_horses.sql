-- Add story fields to horses table for AI-generated story feature
ALTER TABLE horses ADD COLUMN IF NOT EXISTS story_text TEXT;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS story_image_url TEXT;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS story_title TEXT;
ALTER TABLE horses ADD COLUMN IF NOT EXISTS story_generated_at TIMESTAMPTZ;

COMMENT ON COLUMN horses.story_text IS 'Pre-generated story text for the horse (Phase 3 prototype). Future: replaced by Claude API generation.';
COMMENT ON COLUMN horses.story_image_url IS 'Header image URL for the story page.';
COMMENT ON COLUMN horses.story_title IS 'Story title displayed on the story page.';
COMMENT ON COLUMN horses.story_generated_at IS 'Timestamp when the story was generated.';
