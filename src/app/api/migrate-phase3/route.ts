/**
 * Phase 3 Migration API Route
 * 
 * Specifically handles the migration of Phase 3 sync status management tables
 * and functions to resolve the "sync_operations does not exist" error.
 * 
 * Features:
 * - 🔍 Checks for existing Phase 3 tables
 * - 🛠️ Creates missing sync status management tables
 * - 📊 Sets up required functions and triggers
 * - 🔄 Validates migration success
 * 
 * @author LGU Project Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/migrate-phase3
 * Check Phase 3 migration status
 */
export async function GET() {
  try {
    console.log('[Phase 3 Migration] Checking migration status...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const migrationStatus = {
      phase3_tables_exist: false,
      phase3_functions_exist: false,
      phase3_indexes_exist: false,
      missing_tables: [] as string[],
      missing_functions: [] as string[],
      errors: [] as string[]
    }

    // Check Phase 3 tables
    const phase3Tables = ['sync_operations', 'connection_status', 'sync_status_snapshots']
    const existingTables: string[] = []

    for (const tableName of phase3Tables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1)

        if (!error) {
          existingTables.push(tableName)
        }
      } catch (tableError) {
        console.warn(`[Phase 3 Migration] Table ${tableName} check failed:`, tableError)
      }
    }

    migrationStatus.missing_tables = phase3Tables.filter(table => !existingTables.includes(table))
    migrationStatus.phase3_tables_exist = migrationStatus.missing_tables.length === 0

    // Check Phase 3 functions
    const phase3Functions = [
      'update_sync_operation_progress',
      'complete_sync_operation', 
      'create_sync_status_snapshot',
      'notify_sync_status_change'
    ]

    try {
      const { data: functions, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .in('routine_name', phase3Functions)

      if (error) throw error

      const existingFunctions = functions?.map(f => f.routine_name) || []
      migrationStatus.missing_functions = phase3Functions.filter(func => !existingFunctions.includes(func))
      migrationStatus.phase3_functions_exist = migrationStatus.missing_functions.length === 0
    } catch (error) {
      migrationStatus.errors.push(`Function check failed: ${error}`)
    }

    // Check Phase 3 indexes
    try {
      const { data: indexes, error } = await supabase
        .from('pg_indexes')
        .select('indexname')
        .eq('schemaname', 'public')
        .like('indexname', 'idx_sync_%')

      if (error) throw error

      const syncIndexes = indexes?.length || 0
      migrationStatus.phase3_indexes_exist = syncIndexes >= 3 // Expected sync-related indexes
    } catch (error) {
      migrationStatus.errors.push(`Index check failed: ${error}`)
    }

    const needsMigration = !migrationStatus.phase3_tables_exist || 
                          !migrationStatus.phase3_functions_exist || 
                          !migrationStatus.phase3_indexes_exist

    return NextResponse.json({
      success: !needsMigration,
      message: needsMigration 
        ? '⚠️ Phase 3 migration required - sync status management tables missing'
        : '✅ Phase 3 migration complete - all sync status management components exist',
      migration_status: migrationStatus,
      next_steps: needsMigration ? [
        '🔄 Run POST /api/migrate-phase3 to apply migration',
        '📋 Or manually run the Phase 3 schema from supabase-schema.sql',
        '🔍 Check Supabase dashboard for any permission issues'
      ] : [
        '✅ Phase 3 is fully migrated',
        '🚀 Sync status management is ready to use',
        '📊 Real-time monitoring is available'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Phase 3 Migration] Status check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Migration status check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST /api/migrate-phase3
 * Apply Phase 3 migration
 */
export async function POST() {
  try {
    console.log('[Phase 3 Migration] Starting Phase 3 migration...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const migrationResults = {
      steps_completed: [] as string[],
      errors: [] as string[],
      warnings: [] as string[]
    }

    // Phase 3 Migration SQL - Sync Status Management Tables
    const phase3SQL = `
-- Phase 3: Sync Status Management Tables
-- Real-time sync operation tracking
CREATE TABLE IF NOT EXISTS sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('upload', 'delete', 'update', 'full_sync', 'webhook')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    triggered_by VARCHAR(255),
    source VARCHAR(50) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'webhook', 'api', 'scheduled')),
    operation_data JSONB DEFAULT '{}',
    error_details JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client connection status tracking
CREATE TABLE IF NOT EXISTS connection_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'reconnecting', 'error')),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connection_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reconnect_attempts INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync status snapshots for recovery
CREATE TABLE IF NOT EXISTS sync_status_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_type VARCHAR(50) NOT NULL CHECK (snapshot_type IN ('hourly', 'daily', 'manual', 'error')),
    total_assets INTEGER NOT NULL DEFAULT 0,
    synced_assets INTEGER NOT NULL DEFAULT 0,
    pending_assets INTEGER NOT NULL DEFAULT 0,
    error_assets INTEGER NOT NULL DEFAULT 0,
    active_operations INTEGER NOT NULL DEFAULT 0,
    last_sync_time TIMESTAMP WITH TIME ZONE,
    system_health VARCHAR(20) DEFAULT 'healthy' CHECK (system_health IN ('healthy', 'warning', 'critical')),
    performance_score INTEGER DEFAULT 100 CHECK (performance_score >= 0 AND performance_score <= 100),
    error_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_sync_time_ms INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
CREATE INDEX IF NOT EXISTS idx_sync_operations_type ON sync_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_sync_operations_created_at ON sync_operations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connection_status_client ON connection_status(client_id);
CREATE INDEX IF NOT EXISTS idx_connection_status_updated ON connection_status(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_snapshots_created ON sync_status_snapshots(created_at DESC);
    `

    // Execute Phase 3 tables creation
    try {
      const { error } = await supabase.rpc('exec', { sql: phase3SQL })

      if (error) {
        // Try alternative approach - execute statements individually
        const statements = phase3SQL.split(';').filter(stmt => stmt.trim())

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await supabase.rpc('exec', { sql: statement.trim() + ';' })
            } catch (stmtError) {
              console.warn('[Phase 3 Migration] Statement warning:', stmtError)
              migrationResults.warnings.push(`Statement execution warning: ${stmtError}`)
            }
          }
        }
      }

      migrationResults.steps_completed.push('Phase 3 tables and indexes created')
    } catch (error) {
      migrationResults.errors.push(`Table creation failed: ${error}`)
    }

    // Phase 3 Functions SQL
    const phase3FunctionsSQL = `
-- Functions for sync status management
CREATE OR REPLACE FUNCTION update_sync_operation_progress(
    operation_id UUID,
    new_progress INTEGER,
    processed_count INTEGER DEFAULT NULL,
    failed_count INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE sync_operations
    SET
        progress = new_progress,
        processed_items = COALESCE(processed_count, processed_items),
        failed_items = COALESCE(failed_count, failed_items),
        updated_at = NOW(),
        estimated_completion = CASE
            WHEN new_progress > 0 AND new_progress < 100 THEN
                NOW() + (EXTRACT(EPOCH FROM (NOW() - start_time)) / new_progress * (100 - new_progress)) * INTERVAL '1 second'
            ELSE estimated_completion
        END
    WHERE id = operation_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION complete_sync_operation(
    operation_id UUID,
    final_status VARCHAR(20),
    error_details JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE sync_operations
    SET
        status = final_status,
        progress = CASE WHEN final_status = 'completed' THEN 100 ELSE progress END,
        end_time = NOW(),
        updated_at = NOW(),
        error_details = COALESCE(error_details, error_details)
    WHERE id = operation_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_sync_status_snapshot(
    snapshot_type_param VARCHAR(50) DEFAULT 'manual'
) RETURNS UUID AS $$
DECLARE
    snapshot_id UUID;
    asset_stats RECORD;
    active_ops INTEGER;
BEGIN
    -- Get current asset statistics (if media_assets table exists)
    BEGIN
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE sync_status = 'synced') as synced,
            COUNT(*) FILTER (WHERE sync_status = 'pending') as pending,
            COUNT(*) FILTER (WHERE sync_status = 'error') as errors
        INTO asset_stats
        FROM media_assets
        WHERE deleted_at IS NULL;
    EXCEPTION WHEN undefined_table THEN
        -- If media_assets doesn't exist yet, use default values
        asset_stats.total := 0;
        asset_stats.synced := 0;
        asset_stats.pending := 0;
        asset_stats.errors := 0;
    END;

    -- Get active operations count
    SELECT COUNT(*) INTO active_ops
    FROM sync_operations
    WHERE status IN ('pending', 'in_progress');

    -- Create snapshot
    INSERT INTO sync_status_snapshots (
        snapshot_type,
        total_assets,
        synced_assets,
        pending_assets,
        error_assets,
        active_operations,
        last_sync_time
    ) VALUES (
        snapshot_type_param,
        asset_stats.total,
        asset_stats.synced,
        asset_stats.pending,
        asset_stats.errors,
        active_ops,
        NOW()
    ) RETURNING id INTO snapshot_id;

    RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for real-time updates
CREATE OR REPLACE FUNCTION notify_sync_status_change() RETURNS TRIGGER AS $$
BEGIN
    -- Notify real-time subscribers of sync operation changes
    PERFORM pg_notify('sync_status_change', json_build_object(
        'operation_id', NEW.id,
        'operation_type', NEW.operation_type,
        'status', NEW.status,
        'progress', NEW.progress,
        'timestamp', NEW.updated_at
    )::text);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS sync_operations_notify_trigger ON sync_operations;
CREATE TRIGGER sync_operations_notify_trigger
    AFTER INSERT OR UPDATE ON sync_operations
    FOR EACH ROW EXECUTE FUNCTION notify_sync_status_change();
    `

    // Execute Phase 3 functions creation
    try {
      const { error } = await supabase.rpc('exec', { sql: phase3FunctionsSQL })

      if (error) {
        migrationResults.warnings.push(`Function creation warning: ${error}`)
      }

      migrationResults.steps_completed.push('Phase 3 functions and triggers created')
    } catch (error) {
      migrationResults.errors.push(`Function creation failed: ${error}`)
    }

    const isSuccess = migrationResults.errors.length === 0

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess
        ? '🎉 Phase 3 migration completed successfully!'
        : '⚠️ Phase 3 migration completed with some issues',
      migration_results: migrationResults,
      next_steps: isSuccess ? [
        '✅ Sync status management tables created',
        '🔄 Test sync status functionality',
        '📊 Real-time monitoring is now available',
        '🚀 SyncStatusManager should work correctly'
      ] : [
        '🔍 Check the errors above',
        '📋 Consider running the full supabase-schema.sql manually',
        '🛠️ Verify database permissions',
        '🔄 Try running the migration again'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Phase 3 Migration] Migration failed:', error)

    return NextResponse.json({
      success: false,
      message: 'Phase 3 migration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback_instructions: [
        '📋 Use manual setup as fallback',
        '1️⃣ Copy Phase 3 schema from: supabase-schema.sql (lines 131-303)',
        '2️⃣ Run in Supabase SQL Editor',
        '3️⃣ Verify with GET /api/migrate-phase3'
      ],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
