-- Add translation fields to horse_chats table for bilingual messaging
ALTER TABLE horse_chats ADD COLUMN IF NOT EXISTS message_translated TEXT;
ALTER TABLE horse_chats ADD COLUMN IF NOT EXISTS original_language TEXT CHECK (original_language IN ('ja', 'fr'));

COMMENT ON COLUMN horse_chats.message_translated IS 'Auto-translated message (target language: opposite of original_language). Null for legacy messages.';
COMMENT ON COLUMN horse_chats.original_language IS 'Detected language of the original message. ja=Japanese, fr=French.';
