'use client'

import DashboardLayout from '@/components/Layout/DashboardLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthGuard>
  )
}
