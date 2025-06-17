'use client'

import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'

interface LineChartData {
  name: string
  data: number[]
  color?: string
}

interface LineChartProps {
  title?: string
  xAxisData: string[]
  series: LineChartData[]
  height?: string | number
  smooth?: boolean
  showArea?: boolean
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  xAxisData,
  series,
  height = '400px',
  smooth = true,
  showArea = false,
  showGrid = true,
  showLegend = true,
  className = ''
}) => {
  const option: EChartsOption = {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      }
    },
    legend: showLegend ? {
      data: series.map(s => s.name),
      bottom: 10,
      textStyle: {
        color: '#6b7280'
      }
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: showLegend ? '15%' : '3%',
      top: title ? '15%' : '3%',
      containLabel: true,
      show: showGrid,
      borderColor: '#f3f4f6'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6'
        }
      }
    },
    series: series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth,
      lineStyle: {
        color: s.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
        width: 2
      },
      itemStyle: {
        color: s.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
      },
      areaStyle: showArea ? {
        opacity: 0.3,
        color: s.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
      } : undefined,
      emphasis: {
        focus: 'series'
      }
    }))
  }

  return (
    <div className={className}>
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}

export default LineChart
