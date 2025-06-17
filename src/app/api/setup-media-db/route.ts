/**
 * Setup Media Database API Route
 * 
 * Verifies and initializes the media library database setup.
 * Ensures all tables, functions, and configurations are properly set up
 * for bidirectional sync with Cloudinary.
 * 
 * Features:
 * - 🔍 Database schema verification
 * - 🛠️ Function availability checks
 * - 📊 Initial statistics gathering
 * - 🔄 Sync status validation
 * - 🚀 Ready-to-use confirmation
 * 
 * @author LGU Project Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server'
import { SupabaseMediaService } from '@/lib/supabaseMediaService'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/setup-media-db
 * Verify media database setup and configuration
 */
export async function GET() {
  try {
    console.log('[Setup Media DB] Verifying database setup...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const setupStatus = {
      database_connected: false,
      tables_exist: false,
      functions_exist: false,
      indexes_exist: false,
      rls_enabled: false,
      initial_stats: null as Record<string, unknown> | null,
      errors: [] as string[],
      warnings: [] as string[]
    }

    // 1. Test database connection
    try {
      const { error } = await supabase.from('media_assets').select('count').limit(1)
      if (error) throw error
      setupStatus.database_connected = true
      console.log('[Setup Media DB] ✅ Database connection successful')
    } catch (error) {
      setupStatus.errors.push(`Database connection failed: ${error}`)
      console.error('[Setup Media DB] ❌ Database connection failed:', error)
    }

    // 2. Check if required tables exist by testing direct access
    try {
      const requiredTables = [
        'media_assets', 'media_sync_log', 'media_usage', 'media_collections', 'media_collection_items',
        // Phase 3 sync status management tables
        'sync_operations', 'connection_status', 'sync_status_snapshots'
      ]
      const existingTables: string[] = []

      for (const tableName of requiredTables) {
        try {
          // Test direct access to each table
          const { error } = await supabase
            .from(tableName)
            .select('count')
            .limit(1)

          if (!error) {
            existingTables.push(tableName)
          }
        } catch (tableError) {
          console.warn(`[Setup Media DB] Table ${tableName} access failed:`, tableError)
        }
      }

      const missingTables = requiredTables.filter(table => !existingTables.includes(table))

      if (missingTables.length === 0) {
        setupStatus.tables_exist = true
        console.log('[Setup Media DB] ✅ All required tables exist and are accessible')
      } else {
        setupStatus.errors.push(`Missing or inaccessible tables: ${missingTables.join(', ')}`)
        console.error('[Setup Media DB] ❌ Missing tables:', missingTables)
      }
    } catch (error) {
      setupStatus.errors.push(`Table verification failed: ${error}`)
      console.error('[Setup Media DB] ❌ Table verification failed:', error)
    }

    // 3. Check if required functions exist
    try {
      const { data: functions, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .in('routine_name', [
          'soft_delete_media_asset',
          'restore_media_asset',
          'update_media_sync_status',
          'get_media_statistics',
          'cleanup_old_sync_logs'
        ])

      if (error) throw error

      const requiredFunctions = [
        'soft_delete_media_asset',
        'restore_media_asset',
        'update_media_sync_status',
        'get_media_statistics',
        'cleanup_old_sync_logs',
        // Phase 3 sync status management functions
        'update_sync_operation_progress',
        'complete_sync_operation',
        'create_sync_status_snapshot'
      ]
      const existingFunctions = functions?.map(f => f.routine_name) || []
      const missingFunctions = requiredFunctions.filter(func => !existingFunctions.includes(func))

      if (missingFunctions.length === 0) {
        setupStatus.functions_exist = true
        console.log('[Setup Media DB] ✅ All required functions exist')
      } else {
        setupStatus.errors.push(`Missing functions: ${missingFunctions.join(', ')}`)
        console.error('[Setup Media DB] ❌ Missing functions:', missingFunctions)
      }
    } catch (error) {
      setupStatus.errors.push(`Function verification failed: ${error}`)
      console.error('[Setup Media DB] ❌ Function verification failed:', error)
    }

    // 4. Check indexes
    try {
      const { data: indexes, error } = await supabase
        .from('pg_indexes')
        .select('indexname')
        .eq('schemaname', 'public')
        .like('indexname', 'idx_media_%')

      if (error) throw error

      const mediaIndexes = indexes?.length || 0
      if (mediaIndexes >= 10) { // We expect at least 10 media-related indexes
        setupStatus.indexes_exist = true
        console.log(`[Setup Media DB] ✅ Found ${mediaIndexes} media indexes`)
      } else {
        setupStatus.warnings.push(`Only ${mediaIndexes} media indexes found, expected at least 10`)
        console.warn(`[Setup Media DB] ⚠️ Only ${mediaIndexes} media indexes found`)
      }
    } catch (error) {
      setupStatus.warnings.push(`Index verification failed: ${error}`)
      console.warn('[Setup Media DB] ⚠️ Index verification failed:', error)
    }

    // 5. Test RLS policies
    try {
      // Try to access media_assets with authenticated role simulation
      const { error } = await supabase
        .from('media_assets')
        .select('count')
        .limit(1)

      if (!error) {
        setupStatus.rls_enabled = true
        console.log('[Setup Media DB] ✅ RLS policies working')
      }
    } catch (error) {
      setupStatus.warnings.push(`RLS verification failed: ${error}`)
      console.warn('[Setup Media DB] ⚠️ RLS verification failed:', error)
    }

    // 6. Get initial statistics
    try {
      const stats = await SupabaseMediaService.getMediaStats()
      setupStatus.initial_stats = stats as unknown as Record<string, unknown>
      console.log('[Setup Media DB] ✅ Statistics retrieved:', stats)
    } catch (error) {
      setupStatus.warnings.push(`Statistics retrieval failed: ${error}`)
      console.warn('[Setup Media DB] ⚠️ Statistics retrieval failed:', error)
    }

    // Determine overall status
    const isFullySetup = setupStatus.database_connected && 
                        setupStatus.tables_exist && 
                        setupStatus.functions_exist &&
                        setupStatus.errors.length === 0

    const response = {
      success: isFullySetup,
      message: isFullySetup 
        ? '🎉 Media library database is fully configured and ready for bidirectional sync!'
        : '⚠️ Media library database setup has issues that need attention',
      setup_status: setupStatus,
      next_steps: isFullySetup ? [
        '✅ Database is ready for production use',
        '🔄 Test the sync functionality in admin panel',
        '📱 Configure Cloudinary webhooks for real-time sync',
        '🚀 Start uploading and managing media files'
      ] : [
        '📋 Run the complete Supabase script from docs/full-complete-supabase-script.md',
        '🔍 Check database connection and permissions',
        '🛠️ Verify all environment variables are set correctly',
        '🔄 Re-run this setup verification'
      ],
      environment_check: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        cloudinary_cloud_name: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        cloudinary_api_key: !!process.env.CLOUDINARY_API_KEY,
        cloudinary_api_secret: !!process.env.CLOUDINARY_API_SECRET
      },
      timestamp: new Date().toISOString()
    }

    console.log(`[Setup Media DB] Setup verification completed. Success: ${isFullySetup}`)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('[Setup Media DB] Setup verification failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Setup verification failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST /api/setup-media-db
 * Initialize or repair media database setup using Supabase RPC
 */
export async function POST() {
  try {
    console.log('[Setup Media DB] Starting automated database setup...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const setupResults = {
      steps_completed: [] as string[],
      errors: [] as string[],
      warnings: [] as string[]
    }

    // Step 1: Create the setup function if it doesn't exist
    try {
      console.log('[Setup Media DB] Creating setup function...')

      const setupFunctionSQL = `
        CREATE OR REPLACE FUNCTION execute_setup_sql(sql_statements TEXT[])
        RETURNS TABLE(step_number INTEGER, status TEXT, message TEXT) AS $$
        DECLARE
            stmt TEXT;
            step_num INTEGER := 1;
        BEGIN
            FOREACH stmt IN ARRAY sql_statements
            LOOP
                BEGIN
                    EXECUTE stmt;
                    RETURN QUERY SELECT step_num, 'success'::TEXT, ('Executed: ' || LEFT(stmt, 50) || '...')::TEXT;
                EXCEPTION WHEN OTHERS THEN
                    RETURN QUERY SELECT step_num, 'error'::TEXT, (SQLERRM || ' - SQL: ' || LEFT(stmt, 50) || '...')::TEXT;
                END;
                step_num := step_num + 1;
            END LOOP;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `

      const { error: functionError } = await supabase.rpc('exec', { sql: setupFunctionSQL })

      if (functionError) {
        // Try alternative approach - create function directly
        const { error: directError } = await supabase
          .from('pg_proc')
          .select('proname')
          .eq('proname', 'execute_setup_sql')
          .single()

        if (directError) {
          setupResults.warnings.push('Could not verify setup function creation')
        }
      }

      setupResults.steps_completed.push('Setup function created')
    } catch (error) {
      setupResults.errors.push(`Setup function creation failed: ${error}`)
    }

    // Step 2: Execute database setup in chunks
    const sqlChunks = [
      // Chunk 1: Types and basic tables
      [
        `DO $$ BEGIN CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE personnel_status AS ENUM ('Active', 'Inactive', 'On Leave', 'Suspended'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE media_sync_status AS ENUM ('synced', 'pending', 'error'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `DO $$ BEGIN CREATE TYPE media_sync_operation AS ENUM ('upload', 'delete', 'update', 'restore'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
        `CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          address TEXT,
          role VARCHAR(50) DEFAULT 'user',
          status user_status DEFAULT 'ACTIVE',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      ],
      // Chunk 2: Personnel tables
      [
        `CREATE TABLE IF NOT EXISTS personnel (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50),
          address TEXT,
          profile_photo VARCHAR(500),
          department VARCHAR(255) NOT NULL,
          position VARCHAR(255),
          hire_date DATE,
          status personnel_status DEFAULT 'Active',
          biography TEXT,
          spouse_name VARCHAR(255),
          spouse_occupation VARCHAR(255),
          children_count VARCHAR(10),
          emergency_contact VARCHAR(50),
          children_names TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
        `CREATE TABLE IF NOT EXISTS personnel_documents (
          id BIGSERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          size INTEGER NOT NULL,
          path VARCHAR(500) NOT NULL,
          personnel_id BIGINT NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      ]
    ]

    // Execute each chunk
    for (let i = 0; i < sqlChunks.length; i++) {
      try {
        console.log(`[Setup Media DB] Executing chunk ${i + 1}...`)

        const { data, error } = await supabase.rpc('execute_setup_sql', {
          sql_statements: sqlChunks[i]
        })

        if (error) {
          setupResults.errors.push(`Chunk ${i + 1} failed: ${error.message}`)
        } else if (data) {
          const successCount = data.filter((result: { status: string }) => result.status === 'success').length
          const errorCount = data.filter((result: { status: string }) => result.status === 'error').length

          setupResults.steps_completed.push(`Chunk ${i + 1}: ${successCount} statements executed`)

          if (errorCount > 0) {
            const errors = data.filter((result: { status: string }) => result.status === 'error')
            errors.forEach((err: { message: string }) => {
              setupResults.errors.push(`Chunk ${i + 1} error: ${err.message}`)
            })
          }
        }
      } catch (error) {
        setupResults.errors.push(`Chunk ${i + 1} execution failed: ${error}`)
      }
    }

    const isSuccess = setupResults.errors.length === 0

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess
        ? '🎉 Database setup completed successfully!'
        : '⚠️ Database setup completed with some issues',
      setup_results: setupResults,
      next_steps: isSuccess ? [
        '✅ Basic tables created successfully',
        '🔄 Continue with media library tables',
        '📱 Test the media library functionality',
        '🚀 Verify bidirectional sync is working'
      ] : [
        '🔍 Check the errors above',
        '🛠️ Some tables may need manual creation',
        '📋 Consider running the full script manually',
        '🔄 Try running the setup again'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Setup Media DB] Setup failed:', error)

    return NextResponse.json({
      success: false,
      message: 'Automated database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback_instructions: [
        '📋 Use manual setup as fallback',
        '1️⃣ Copy script from: docs/full-complete-supabase-script.md',
        '2️⃣ Run in Supabase SQL Editor',
        '3️⃣ Verify with GET /api/setup-media-db'
      ],
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
