'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

// Type for ECharts option to avoid strict typing issues
type EChartsOptionType = Record<string, unknown>

// Type for ECharts callback parameters
interface EChartsCallbackParams {
  data: number[]
  seriesName?: string
  name?: string
  [key: string]: unknown
}

const DirectEChartsTestPage = () => {
  const lineChartRef = useRef<HTMLDivElement>(null)
  const barChartRef = useRef<HTMLDivElement>(null)
  const scatterChartRef = useRef<HTMLDivElement>(null)
  const heatmapChartRef = useRef<HTMLDivElement>(null)

  // Direct Line Chart
  useEffect(() => {
    if (lineChartRef.current) {
      const chart = echarts.init(lineChartRef.current)
      
      const option = {
        title: {
          text: 'Direct ECharts - Line Chart',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            color: '#374151'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Sales', 'Marketing'],
          bottom: 10
        },
        xAxis: {
          type: 'category' as const,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        yAxis: {
          type: 'value' as const
        },
        series: [
          {
            name: 'Sales',
            type: 'line',
            data: [120, 132, 101, 134, 90, 230],
            smooth: true,
            lineStyle: {
              color: '#3b82f6',
              width: 3
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(59, 130, 246, 0.3)'
                }, {
                  offset: 1, color: 'rgba(59, 130, 246, 0.1)'
                }]
              }
            }
          },
          {
            name: 'Marketing',
            type: 'line',
            data: [220, 182, 191, 234, 290, 330],
            smooth: true,
            lineStyle: {
              color: '#ef4444',
              width: 3
            }
          }
        ]
      }

      chart.setOption(option as EChartsOptionType)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
      }
    }
  }, [])

  // Direct Bar Chart
  useEffect(() => {
    if (barChartRef.current) {
      const chart = echarts.init(barChartRef.current)
      
      const option = {
        title: {
          text: 'Direct ECharts - 3D Bar Chart',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            color: '#374151'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Revenue', 'Profit'],
          bottom: 10
        },
        xAxis: {
          type: 'category' as const,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        yAxis: {
          type: 'value' as const
        },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            data: [120, 200, 150, 80, 70, 110],
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: '#3b82f6'
                }, {
                  offset: 1, color: '#1d4ed8'
                }]
              },
              borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          },
          {
            name: 'Profit',
            type: 'bar',
            data: [80, 130, 90, 50, 40, 70],
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: '#10b981'
                }, {
                  offset: 1, color: '#047857'
                }]
              },
              borderRadius: [4, 4, 0, 0]
            }
          }
        ]
      }

      chart.setOption(option as EChartsOptionType)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
      }
    }
  }, [])

  // Direct Scatter Chart
  useEffect(() => {
    if (scatterChartRef.current) {
      const chart = echarts.init(scatterChartRef.current)
      
      const scatterData = Array.from({ length: 50 }, () => [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 50 + 10
      ])
      
      const option = {
        title: {
          text: 'Direct ECharts - Scatter Plot',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            color: '#374151'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params: EChartsCallbackParams) {
            return `X: ${params.data[0].toFixed(2)}<br/>Y: ${params.data[1].toFixed(2)}<br/>Size: ${params.data[2].toFixed(2)}`
          }
        },
        xAxis: {
          name: 'Performance',
          type: 'value' as const
        },
        yAxis: {
          name: 'Efficiency',
          type: 'value' as const
        },
        series: [{
          name: 'Data Points',
          type: 'scatter',
          data: scatterData,
          symbolSize: function(data: number[]) {
            return Math.sqrt(data[2]) * 2
          },
          itemStyle: {
            color: '#8b5cf6',
            opacity: 0.7
          },
          emphasis: {
            itemStyle: {
              borderColor: '#7c3aed',
              borderWidth: 2
            }
          }
        }]
      }

      chart.setOption(option as EChartsOptionType)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
      }
    }
  }, [])

  // Direct Heatmap
  useEffect(() => {
    if (heatmapChartRef.current) {
      const chart = echarts.init(heatmapChartRef.current)
      
      const heatmapData = Array.from({ length: 7 * 12 }, (_, i) => [
        i % 12, Math.floor(i / 12), Math.floor(Math.random() * 10)
      ])
      
      const option = {
        title: {
          text: 'Direct ECharts - Heatmap',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            color: '#374151'
          }
        },
        tooltip: {
          position: 'top'
        },
        grid: {
          height: '50%',
          top: '15%'
        },
        xAxis: {
          type: 'category' as const,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category' as const,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          splitArea: {
            show: true
          }
        },
        visualMap: {
          min: 0,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '5%'
        },
        series: [{
          name: 'Activity',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

      chart.setOption(option as EChartsOptionType)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Direct ECharts Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Direct Line Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Line Chart</h3>
            <div ref={lineChartRef} style={{ width: '100%', height: '400px' }} />
          </div>

          {/* Direct Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Bar Chart</h3>
            <div ref={barChartRef} style={{ width: '100%', height: '400px' }} />
          </div>

          {/* Direct Scatter Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Scatter Chart</h3>
            <div ref={scatterChartRef} style={{ width: '100%', height: '400px' }} />
          </div>

          {/* Direct Heatmap */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Heatmap</h3>
            <div ref={heatmapChartRef} style={{ width: '100%', height: '400px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DirectEChartsTestPage
