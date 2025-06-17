/**
 * ClientOnly Component
 * 
 * This component ensures that its children are only rendered on the client side,
 * preventing hydration mismatches caused by server/client differences.
 * 
 * Use this wrapper for components that:
 * - Use browser-only APIs
 * - Have dynamic content that differs between server and client
 * - Are affected by browser extensions (like form auto-fill)
 * - Use Date.now(), Math.random(), or other non-deterministic functions
 */

'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
