'use client'

import PlaceholderPage from '@/components/PlaceholderPage'

export default function MessagesPage() {
  const features = [
    'Internal messaging system',
    'Group messaging and broadcasts',
    'Message threading and replies',
    'File attachments support',
    'Message search and filtering',
    'Read receipts and notifications',
    'Message archiving',
    'Priority message handling',
    'Auto-reply and templates',
    'Message encryption and security'
  ]

  return (
    <PlaceholderPage
      title="Internal Messages"
      description="Manage internal communication and messaging"
      iconName="Mail"
      features={features}
    />
  )
}
