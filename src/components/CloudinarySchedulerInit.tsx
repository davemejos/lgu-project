'use client'

import { useEffect } from 'react'

/**
 * Component to initialize Cloudinary cleanup scheduler in development
 * Add this to your main layout to ensure scheduler starts
 */
export default function CloudinarySchedulerInit() {
  useEffect(() => {
    // Only run on client side and in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const initScheduler = async () => {
        try {
          console.log('[CloudinarySchedulerInit] Starting cleanup scheduler...')
          
          // Start the scheduler
          const startResponse = await fetch('/api/cloudinary/scheduler', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'start' })
          })

          if (startResponse.ok) {
            const startResult = await startResponse.json()
            console.log('[CloudinarySchedulerInit] Scheduler started:', startResult)
            
            // Queue any orphaned assets
            const fixResponse = await fetch('/api/cloudinary/sync-fix', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ action: 'queue_orphaned_assets' })
            })

            if (fixResponse.ok) {
              const fixResult = await fixResponse.json()
              console.log('[CloudinarySchedulerInit] Orphaned assets queued:', fixResult)
            }
          }
        } catch (error) {
          console.error('[CloudinarySchedulerInit] Failed to initialize scheduler:', error)
        }
      }

      // Start after a short delay to allow app to initialize
      const timer = setTimeout(initScheduler, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  return null // This component doesn't render anything
}
