import PlaceholderPage from '@/components/PlaceholderPage'

export default function ActivityPage() {
  const features = [
    'Real-time activity monitoring',
    'User action logging',
    'System event tracking',
    'Activity search and filtering',
    'Audit trail generation',
    'Security event monitoring',
    'Performance metrics tracking',
    'Activity reporting and analytics',
    'Automated alert triggers',
    'Activity data export'
  ]

  return (
    <PlaceholderPage
      title="Activity Log"
      description="Monitor and track all system activities and user actions"
      iconName="Activity"
      features={features}
    />
  )
}
