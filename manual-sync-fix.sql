-- Manual Cloudinary Sync Fix Script
-- Use this to manually queue cleanup for deleted media assets

-- ========================================
-- 1. ENSURE TRIGGER IS PROPERLY INSTALLED
-- ========================================

-- Drop and recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS media_assets_cleanup_trigger ON media_assets;

-- Recreate the trigger
CREATE TRIGGER media_assets_cleanup_trigger
    AFTER DELETE OR UPDATE ON media_assets
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cloudinary_cleanup();

-- ========================================
-- 2. QUEUE CLEANUP FOR EXISTING SOFT-DELETED ASSETS
-- ========================================

-- Find soft-deleted assets that haven't been queued for cleanup
INSERT INTO cloudinary_cleanup_queue (
    cloudinary_public_id,
    resource_type,
    original_filename,
    file_size,
    folder,
    deletion_reason,
    trigger_source,
    triggered_by,
    status
)
SELECT DISTINCT
    ma.cloudinary_public_id,
    ma.resource_type,
    ma.original_filename,
    ma.file_size,
    ma.folder,
    'retroactive_soft_delete',
    'manual_fix',
    ma.deleted_by,
    'pending'
FROM media_assets ma
WHERE ma.deleted_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM cloudinary_cleanup_queue ccq 
    WHERE ccq.cloudinary_public_id = ma.cloudinary_public_id
  );

-- ========================================
-- 3. SHOW RESULTS
-- ========================================

-- Show what was queued
SELECT 
    'Newly Queued Items' as description,
    COUNT(*) as count
FROM cloudinary_cleanup_queue 
WHERE trigger_source = 'manual_fix'
  AND status = 'pending';

-- Show current queue status
SELECT 
    status,
    COUNT(*) as count
FROM cloudinary_cleanup_queue 
GROUP BY status
ORDER BY status;

-- ========================================
-- 4. VERIFICATION QUERIES
-- ========================================

-- Check if trigger exists now
SELECT 
    'Trigger Status' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'media_assets_cleanup_trigger'
        ) THEN 'INSTALLED'
        ELSE 'MISSING'
    END as status;

-- Show pending cleanup items
SELECT 
    cloudinary_public_id,
    deletion_reason,
    trigger_source,
    queued_at
FROM cloudinary_cleanup_queue 
WHERE status = 'pending'
ORDER BY queued_at DESC
LIMIT 10;
