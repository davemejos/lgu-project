'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { Loader2 } from 'lucide-react'

interface ChartWrapperProps {
  option: Record<string, unknown> // Using Record<string, unknown> to avoid type conflicts between different echarts versions
  height?: string | number
  width?: string | number
  loading?: boolean
  className?: string
  onChartReady?: (chart: echarts.ECharts) => void
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  option,
  height = '400px',
  width = '100%',
  loading = false,
  className = '',
  onChartReady
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<echarts.ECharts | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    const chartInstance = echarts.init(chartRef.current)
    setChart(chartInstance)

    // Set initial option
    chartInstance.setOption(option)
    setIsLoading(false)

    // Call onChartReady callback
    if (onChartReady) {
      onChartReady(chartInstance)
    }

    // Handle resize
    const handleResize = () => {
      chartInstance.resize()
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.dispose()
    }
  }, [option, onChartReady])

  // Update chart when option changes
  useEffect(() => {
    if (chart && !loading) {
      chart.setOption(option, true)
    }
  }, [chart, option, loading])

  // Handle loading state
  useEffect(() => {
    if (chart) {
      if (loading) {
        chart.showLoading('default', {
          text: 'Loading...',
          color: '#3b82f6',
          textColor: '#374151',
          maskColor: 'rgba(255, 255, 255, 0.8)',
          zlevel: 0
        })
      } else {
        chart.hideLoading()
      }
    }
  }, [chart, loading])

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading chart...</span>
          </div>
        </div>
      )}
      <div
        ref={chartRef}
        style={{ width, height }}
        className="min-h-[200px]"
      />
    </div>
  )
}

export default ChartWrapper
