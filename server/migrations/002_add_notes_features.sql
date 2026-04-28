-- Add new columns for enhanced features
-- Favorites, last opened, and view count

ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Index for favorites
CREATE INDEX IF NOT EXISTS idx_notes_favorites ON notes(user_id, is_favorite) WHERE is_favorite = TRUE AND deleted_at IS NULL;

-- Index for recently opened
CREATE INDEX IF NOT EXISTS idx_notes_last_opened ON notes(user_id, last_opened_at DESC) WHERE deleted_at IS NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'CodeVault enhanced features columns added successfully';
END $$;
