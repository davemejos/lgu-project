/**
 * Database Fix API Route
 * 
 * Creates missing functions and indexes for the media library
 */

import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('[Fix Database] Attempting to fix missing functions and indexes...')

    return NextResponse.json({
      success: false,
      message: '🔧 Automatic function creation not available',
      instructions: [
        '📋 **REQUIRED**: Create missing functions manually in Supabase SQL Editor',
        '',
        '**1. Create get_media_statistics function:**',
        '```sql',
        'CREATE OR REPLACE FUNCTION get_media_statistics()',
        'RETURNS TABLE (',
        '  total_assets BIGINT,',
        '  total_images BIGINT,',
        '  total_videos BIGINT,',
        '  total_raw BIGINT,',
        '  total_size BIGINT,',
        '  synced_assets BIGINT,',
        '  pending_assets BIGINT,',
        '  error_assets BIGINT',
        ') AS $$',
        'BEGIN',
        '  RETURN QUERY',
        '  SELECT ',
        '    COUNT(*)::BIGINT as total_assets,',
        '    COUNT(*) FILTER (WHERE resource_type = \'image\')::BIGINT as total_images,',
        '    COUNT(*) FILTER (WHERE resource_type = \'video\')::BIGINT as total_videos,',
        '    COUNT(*) FILTER (WHERE resource_type = \'raw\')::BIGINT as total_raw,',
        '    COALESCE(SUM(file_size), 0)::BIGINT as total_size,',
        '    COUNT(*) FILTER (WHERE sync_status = \'synced\')::BIGINT as synced_assets,',
        '    COUNT(*) FILTER (WHERE sync_status = \'pending\')::BIGINT as pending_assets,',
        '    COUNT(*) FILTER (WHERE sync_status = \'error\')::BIGINT as error_assets',
        '  FROM media_assets ',
        '  WHERE deleted_at IS NULL;',
        'END;',
        '$$ LANGUAGE plpgsql;',
        '```',
        '',
        '**2. Create indexes:**',
        '```sql',
        'CREATE INDEX IF NOT EXISTS idx_media_assets_cloudinary_public_id ON media_assets(cloudinary_public_id);',
        'CREATE INDEX IF NOT EXISTS idx_media_assets_sync_status ON media_assets(sync_status);',
        'CREATE INDEX IF NOT EXISTS idx_media_assets_resource_type ON media_assets(resource_type);',
        'CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON media_assets(created_at DESC);',
        '```'
      ],
      why_manual: [
        '🔒 Database function creation requires admin privileges',
        '🛡️ Prevents accidental corruption of database functions',
        '📊 Ensures proper function signatures and permissions'
      ],
      current_status: 'Tables exist but functions and indexes are missing',
      impact: 'Media library works but sync and statistics may have issues',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Fix Database] Fix request failed:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database fix request failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to fix database functions and indexes',
    endpoint: 'POST /api/fix-database'
  })
}
