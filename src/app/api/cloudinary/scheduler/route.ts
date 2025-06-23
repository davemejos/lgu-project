/**
 * Cloudinary Cleanup Scheduler Management API
 *
 * Provides endpoints to manage the automatic Cloudinary cleanup scheduler.
 * Allows starting, stopping, configuring, and monitoring the background
 * cleanup process for complete bidirectional sync.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCleanupScheduler } from '@/lib/cloudinaryCleanupScheduler'

/**
 * GET /api/cloudinary/scheduler
 * Get scheduler status and statistics
 */
export async function GET() {
  try {
    console.log('[Cloudinary Scheduler API] Getting scheduler status...')

    const scheduler = getCleanupScheduler()
    const stats = scheduler.getStats()
    const config = scheduler.getConfig()

    // Also get current queue status
    const queueResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cloudinary/cleanup`, {
      method: 'GET'
    }).catch(() => null)

    let queueStats = null
    if (queueResponse?.ok) {
      const queueData = await queueResponse.json()
      queueStats = queueData.stats
    }

    return NextResponse.json({
      success: true,
      scheduler: {
        ...stats,
        config,
        queue_stats: queueStats
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Scheduler API] Status check failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get scheduler status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cloudinary/scheduler
 * Control scheduler operations (start, stop, configure, force cleanup)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    console.log(`[Cloudinary Scheduler API] Received action: ${action}`)

    const scheduler = getCleanupScheduler()

    switch (action) {
      case 'start':
        const startResult = scheduler.start()
        return NextResponse.json({
          success: startResult,
          message: startResult ? 'Scheduler started successfully' : 'Failed to start scheduler',
          stats: scheduler.getStats()
        })

      case 'stop':
        const stopResult = scheduler.stop()
        return NextResponse.json({
          success: stopResult,
          message: stopResult ? 'Scheduler stopped successfully' : 'Failed to stop scheduler',
          stats: scheduler.getStats()
        })

      case 'restart':
        const stopForRestart = scheduler.stop()
        if (stopForRestart) {
          // Wait a moment before restarting
          await new Promise(resolve => setTimeout(resolve, 1000))
          const startForRestart = scheduler.start()
          return NextResponse.json({
            success: startForRestart,
            message: startForRestart ? 'Scheduler restarted successfully' : 'Failed to restart scheduler',
            stats: scheduler.getStats()
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Failed to stop scheduler for restart'
          })
        }

      case 'configure':
        if (!config) {
          return NextResponse.json({
            success: false,
            error: 'Configuration object required for configure action'
          }, { status: 400 })
        }

        const configResult = scheduler.updateConfig(config)
        return NextResponse.json({
          success: configResult,
          message: configResult ? 'Configuration updated successfully' : 'Failed to update configuration',
          config: scheduler.getConfig(),
          stats: scheduler.getStats()
        })

      case 'force_cleanup':
        const forceResult = await scheduler.forceCleanup()
        return NextResponse.json({
          success: forceResult,
          message: forceResult ? 'Force cleanup completed' : 'Force cleanup failed',
          stats: scheduler.getStats()
        })

      case 'status':
        return NextResponse.json({
          success: true,
          stats: scheduler.getStats(),
          config: scheduler.getConfig()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: start, stop, restart, configure, force_cleanup, status'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('[Cloudinary Scheduler API] Operation failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Scheduler operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cloudinary/scheduler
 * Update scheduler configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const config = await request.json()
    
    console.log('[Cloudinary Scheduler API] Updating configuration:', config)

    const scheduler = getCleanupScheduler()
    const result = scheduler.updateConfig(config)

    return NextResponse.json({
      success: result,
      message: result ? 'Configuration updated successfully' : 'Failed to update configuration',
      config: scheduler.getConfig(),
      stats: scheduler.getStats(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Scheduler API] Configuration update failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cloudinary/scheduler
 * Emergency stop scheduler
 */
export async function DELETE() {
  try {
    console.log('[Cloudinary Scheduler API] Emergency stop requested...')

    const scheduler = getCleanupScheduler()
    const result = scheduler.stop()

    return NextResponse.json({
      success: result,
      message: result ? 'Scheduler emergency stopped' : 'Failed to stop scheduler',
      stats: scheduler.getStats(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cloudinary Scheduler API] Emergency stop failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Emergency stop failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
