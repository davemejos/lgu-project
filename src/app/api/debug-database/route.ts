/**
 * Database Debug API Route
 * 
 * Comprehensive database diagnostics to identify exactly what's wrong
 * with the media library setup.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('[Database Debug] Starting comprehensive database diagnostics...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const diagnostics = {
      connection: { status: 'unknown' as string, error: null as string | null },
      tables: { exists: [] as string[], missing: [] as string[], errors: [] as Array<{table: string, error: string}> },
      functions: { exists: [] as string[], missing: [] as string[], errors: [] as Array<{function: string, error: string}> },
      indexes: { exists: [] as string[], missing: [] as string[], errors: [] as string[] },
      permissions: { status: 'unknown' as string, errors: [] as string[] },
      rls_policies: { exists: [] as Array<{policyname: string, tablename: string}>, missing: [] as string[], errors: [] as string[] },
      sample_queries: { results: [] as Array<{query: string, status: string, error?: string, result: unknown}>, errors: [] as Array<{query: string, error: string}> }
    }

    // 1. Test basic connection
    try {
      const { error } = await supabase.from('users').select('count').limit(1)
      if (error) {
        diagnostics.connection.status = 'error'
        diagnostics.connection.error = error.message
      } else {
        diagnostics.connection.status = 'success'
      }
    } catch (error) {
      diagnostics.connection.status = 'failed'
      diagnostics.connection.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // 2. Check all tables
    const expectedTables = [
      'users', 'personnel', 'personnel_documents', 
      'media_assets', 'media_sync_log', 'media_usage', 
      'media_collections', 'media_collection_items'
    ]

    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .single()

        if (data && !error) {
          diagnostics.tables.exists.push(tableName)
        } else {
          diagnostics.tables.missing.push(tableName)
        }
      } catch (error) {
        diagnostics.tables.errors.push({
          table: tableName,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 3. Check functions
    const expectedFunctions = [
      'soft_delete_media_asset', 'restore_media_asset', 
      'update_media_sync_status', 'get_media_statistics', 
      'cleanup_old_sync_logs', 'update_updated_at_column'
    ]

    for (const functionName of expectedFunctions) {
      try {
        const { data, error } = await supabase
          .from('information_schema.routines')
          .select('routine_name')
          .eq('routine_schema', 'public')
          .eq('routine_name', functionName)
          .single()

        if (data && !error) {
          diagnostics.functions.exists.push(functionName)
        } else {
          diagnostics.functions.missing.push(functionName)
        }
      } catch (error) {
        diagnostics.functions.errors.push({
          function: functionName,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 4. Check indexes
    try {
      const { data, error } = await supabase
        .from('pg_indexes')
        .select('indexname')
        .eq('schemaname', 'public')
        .like('indexname', 'idx_media_%')

      if (data) {
        diagnostics.indexes.exists = data.map(row => row.indexname)
      }
      if (error) {
        diagnostics.indexes.errors.push(error.message)
      }
    } catch (error) {
      diagnostics.indexes.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    // 5. Test direct table access
    if (diagnostics.tables.exists.includes('media_assets')) {
      try {
        const { data, error } = await supabase
          .from('media_assets')
          .select('count')
          .limit(1)

        diagnostics.sample_queries.results.push({
          query: 'SELECT count FROM media_assets LIMIT 1',
          status: error ? 'error' : 'success',
          error: error?.message,
          result: data
        })
      } catch (error) {
        diagnostics.sample_queries.errors.push({
          query: 'media_assets access test',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 6. Test function calls
    if (diagnostics.functions.exists.includes('get_media_statistics')) {
      try {
        const { data, error } = await supabase.rpc('get_media_statistics')

        diagnostics.sample_queries.results.push({
          query: 'SELECT * FROM get_media_statistics()',
          status: error ? 'error' : 'success',
          error: error?.message,
          result: data
        })
      } catch (error) {
        diagnostics.sample_queries.errors.push({
          query: 'get_media_statistics function test',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 7. Check RLS policies
    try {
      const { data, error } = await supabase
        .from('pg_policies')
        .select('policyname, tablename')
        .in('tablename', ['media_assets', 'media_sync_log', 'media_usage', 'media_collections'])

      if (data) {
        diagnostics.rls_policies.exists = data
      }
      if (error) {
        diagnostics.rls_policies.errors.push(error.message)
      }
    } catch (error) {
      diagnostics.rls_policies.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    // Generate summary
    const summary = {
      overall_status: 'unknown' as string,
      critical_issues: [] as string[],
      warnings: [] as string[],
      recommendations: [] as string[]
    }

    // Check critical issues
    if (diagnostics.tables.missing.includes('media_assets')) {
      summary.critical_issues.push('media_assets table is missing - this is the core table for media library')
    }
    if (diagnostics.functions.missing.includes('get_media_statistics')) {
      summary.critical_issues.push('get_media_statistics function is missing - required for API operations')
    }
    if (diagnostics.connection.status !== 'success') {
      summary.critical_issues.push('Database connection issues detected')
    }

    // Determine overall status
    if (summary.critical_issues.length === 0) {
      summary.overall_status = 'healthy'
      summary.recommendations.push('Database appears to be properly configured')
    } else {
      summary.overall_status = 'critical'
      summary.recommendations.push('Run the complete SQL script again in Supabase SQL Editor')
      summary.recommendations.push('Check for any error messages during script execution')
    }

    return NextResponse.json({
      success: summary.overall_status === 'healthy',
      summary,
      detailed_diagnostics: diagnostics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Database Debug] Diagnostics failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database diagnostics failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
