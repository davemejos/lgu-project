import PlaceholderPage from '@/components/PlaceholderPage'
import { MessageSquare } from 'lucide-react'

export default function CommunicationsPage() {
  const features = [
    'Multi-channel communication hub',
    'Email campaign management',
    'SMS notification system',
    'Public announcement tools',
    'Communication templates',
    'Scheduled messaging',
    'Communication analytics',
    'Contact list management',
    'Emergency communication protocols',
    'Integration with external platforms'
  ]

  return (
    <PlaceholderPage
      title="Communications Center"
      description="Manage all external and internal communications"
      icon={MessageSquare}
      features={features}
    />
  )
}
