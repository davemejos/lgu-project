/**
 * Phase 3 Setup API Route
 * 
 * Simple and direct approach to create Phase 3 sync status management tables
 * using individual SQL statements to resolve the "sync_operations does not exist" error.
 * 
 * @author LGU Project Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/setup-phase3
 * Create Phase 3 sync status management tables
 */
export async function POST() {
  try {
    console.log('[Phase 3 Setup] Starting Phase 3 table creation...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results = {
      steps_completed: [] as string[],
      errors: [] as string[],
      warnings: [] as string[]
    }

    // Step 1: Create sync_operations table
    try {
      const createSyncOperationsSQL = `
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
      `
      
      const { error } = await supabase.rpc('exec', { sql: createSyncOperationsSQL })
      if (error) {
        results.warnings.push(`sync_operations table creation warning: ${error.message}`)
      } else {
        results.steps_completed.push('sync_operations table created')
      }
    } catch (error) {
      results.errors.push(`sync_operations table creation failed: ${error}`)
    }

    // Step 2: Create connection_status table
    try {
      const createConnectionStatusSQL = `
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
      `
      
      const { error } = await supabase.rpc('exec', { sql: createConnectionStatusSQL })
      if (error) {
        results.warnings.push(`connection_status table creation warning: ${error.message}`)
      } else {
        results.steps_completed.push('connection_status table created')
      }
    } catch (error) {
      results.errors.push(`connection_status table creation failed: ${error}`)
    }

    // Step 3: Create sync_status_snapshots table
    try {
      const createSnapshotsSQL = `
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
      `
      
      const { error } = await supabase.rpc('exec', { sql: createSnapshotsSQL })
      if (error) {
        results.warnings.push(`sync_status_snapshots table creation warning: ${error.message}`)
      } else {
        results.steps_completed.push('sync_status_snapshots table created')
      }
    } catch (error) {
      results.errors.push(`sync_status_snapshots table creation failed: ${error}`)
    }

    // Step 4: Create indexes
    try {
      const createIndexesSQL = `
        CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
        CREATE INDEX IF NOT EXISTS idx_sync_operations_type ON sync_operations(operation_type);
        CREATE INDEX IF NOT EXISTS idx_sync_operations_created_at ON sync_operations(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_connection_status_client ON connection_status(client_id);
        CREATE INDEX IF NOT EXISTS idx_connection_status_updated ON connection_status(updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_sync_snapshots_created ON sync_status_snapshots(created_at DESC);
      `
      
      const { error } = await supabase.rpc('exec', { sql: createIndexesSQL })
      if (error) {
        results.warnings.push(`Index creation warning: ${error.message}`)
      } else {
        results.steps_completed.push('Phase 3 indexes created')
      }
    } catch (error) {
      results.errors.push(`Index creation failed: ${error}`)
    }

    // Step 5: Test table access
    try {
      const { error } = await supabase
        .from('sync_operations')
        .select('count')
        .limit(1)

      if (!error) {
        results.steps_completed.push('sync_operations table access verified')
      } else {
        results.warnings.push(`Table access verification failed: ${error.message}`)
      }
    } catch (error) {
      results.warnings.push(`Table access test failed: ${error}`)
    }

    const isSuccess = results.errors.length === 0

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess
        ? '🎉 Phase 3 setup completed successfully!'
        : '⚠️ Phase 3 setup completed with some issues',
      setup_results: results,
      next_steps: isSuccess ? [
        '✅ Phase 3 sync status management tables created',
        '🔄 SyncStatusManager should now work correctly',
        '📊 Real-time monitoring is available',
        '🚀 Test the sync status functionality'
      ] : [
        '🔍 Check the errors and warnings above',
        '📋 Consider running the full supabase-schema.sql manually',
        '🛠️ Verify database permissions in Supabase dashboard',
        '🔄 Try running the setup again'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Phase 3 Setup] Setup failed:', error)

    return NextResponse.json({
      success: false,
      message: 'Phase 3 setup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      manual_instructions: [
        '📋 Manual setup required',
        '1️⃣ Open Supabase SQL Editor',
        '2️⃣ Copy and run the Phase 3 schema from supabase-schema.sql (lines 131-303)',
        '3️⃣ Verify tables exist: sync_operations, connection_status, sync_status_snapshots'
      ],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * GET /api/setup-phase3
 * Check if Phase 3 tables exist
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
      } catch (error) {
        console.warn(`[Phase 3 Setup] Table ${tableName} check failed:`, error)
      }
    }

    const missingTables = phase3Tables.filter(table => !existingTables.includes(table))
    const isComplete = missingTables.length === 0

    return NextResponse.json({
      success: isComplete,
      message: isComplete 
        ? '✅ Phase 3 is fully set up'
        : '⚠️ Phase 3 setup incomplete',
      existing_tables: existingTables,
      missing_tables: missingTables,
      next_steps: isComplete ? [
        '🚀 Phase 3 sync status management is ready',
        '📊 Real-time monitoring available',
        '✅ SyncStatusManager should work correctly'
      ] : [
        '🔄 Run POST /api/setup-phase3 to create missing tables',
        '📋 Or manually run the Phase 3 schema',
        '🔍 Check database permissions'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
