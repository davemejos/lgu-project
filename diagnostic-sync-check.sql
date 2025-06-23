-- Cloudinary Bidirectional Sync Diagnostic Script
-- Run this in Supabase SQL Editor to diagnose sync issues

-- ========================================
-- 1. CHECK IF TRIGGER EXISTS
-- ========================================
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'media_assets_cleanup_trigger';

-- ========================================
-- 2. CHECK IF CLEANUP QUEUE TABLE EXISTS
-- ========================================
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'cloudinary_cleanup_queue'
) as cleanup_queue_exists;

-- ========================================
-- 3. CHECK CURRENT QUEUE STATUS
-- ========================================
SELECT 
    status,
    COUNT(*) as count,
    MIN(queued_at) as oldest_queued,
    MAX(queued_at) as newest_queued
FROM cloudinary_cleanup_queue 
GROUP BY status
ORDER BY status;

-- ========================================
-- 4. CHECK RECENT DELETIONS
-- ========================================
SELECT 
    cloudinary_public_id,
    deletion_reason,
    trigger_source,
    status,
    queued_at,
    processed_at,
    processing_attempts,
    error_message
FROM cloudinary_cleanup_queue 
ORDER BY queued_at DESC 
LIMIT 10;

-- ========================================
-- 5. TEST TRIGGER FUNCTION MANUALLY
-- ========================================
-- This will test if the trigger function works
-- Replace 'test_public_id' with an actual public_id from your media_assets

-- First, let's see what media assets exist
SELECT 
    cloudinary_public_id,
    original_filename,
    resource_type,
    deleted_at
FROM media_assets 
WHERE deleted_at IS NULL
LIMIT 5;

-- ========================================
-- 6. MANUAL TRIGGER TEST
-- ========================================
-- Uncomment and modify the following to test the trigger function:
-- (Replace 'your_test_public_id' with an actual public_id)

/*
-- Test the queue function directly
SELECT queue_cloudinary_cleanup(
    'your_test_public_id',
    'image',
    'test_filename.jpg',
    1024,
    'test_folder',
    'manual_test',
    'diagnostic',
    NULL
) as test_queue_id;
*/

-- ========================================
-- 7. CHECK FOR FAILED OPERATIONS
-- ========================================
SELECT 
    cloudinary_public_id,
    error_message,
    processing_attempts,
    max_attempts,
    queued_at
FROM cloudinary_cleanup_queue 
WHERE status = 'failed' OR processing_attempts >= max_attempts
ORDER BY queued_at DESC;

-- ========================================
-- 8. SUMMARY STATISTICS
-- ========================================
SELECT 
    'Total Queue Items' as metric,
    COUNT(*) as value
FROM cloudinary_cleanup_queue
UNION ALL
SELECT 
    'Pending Items' as metric,
    COUNT(*) as value
FROM cloudinary_cleanup_queue 
WHERE status = 'pending'
UNION ALL
SELECT 
    'Failed Items' as metric,
    COUNT(*) as value
FROM cloudinary_cleanup_queue 
WHERE status = 'failed'
UNION ALL
SELECT 
    'Completed Items' as metric,
    COUNT(*) as value
FROM cloudinary_cleanup_queue 
WHERE status = 'completed'
UNION ALL
SELECT 
    'Media Assets (Active)' as metric,
    COUNT(*) as value
FROM media_assets 
WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Media Assets (Soft Deleted)' as metric,
    COUNT(*) as value
FROM media_assets 
WHERE deleted_at IS NOT NULL;
