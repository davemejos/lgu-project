'use client'

import DashboardLayout from '@/components/Layout/DashboardLayout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
