-- Add preview_ready status to analysis_status enum
ALTER TYPE analysis_status ADD VALUE IF NOT EXISTS 'preview_ready';

-- Update analysis_type enum to add 'premium' as valid value
-- Note: We can't modify existing enum values, so we'll use premium_whitespace for premium tier