import PlaceholderPage from '@/components/PlaceholderPage'

export default function SearchPage() {
  const features = [
    'Advanced search capabilities',
    'Full-text search across all data',
    'Search filters and facets',
    'Saved search queries',
    'Search result ranking',
    'Auto-complete and suggestions',
    'Search analytics and insights',
    'Custom search indexes',
    'Search API integration',
    'Search performance optimization'
  ]

  return (
    <PlaceholderPage
      title="Search Tools"
      description="Advanced search and data discovery tools"
      iconName="Search"
      features={features}
    />
  )
}
