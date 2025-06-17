'use client'

import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'

interface BarChartData {
  name: string
  data: number[]
  color?: string
}

interface BarChartProps {
  title?: string
  xAxisData: string[]
  series: BarChartData[]
  height?: string | number
  horizontal?: boolean
  stacked?: boolean
  showGrid?: boolean
  showLegend?: boolean
  className?: string
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  xAxisData,
  series,
  height = '400px',
  horizontal = false,
  stacked = false,
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
      axisPointer: {
        type: 'shadow'
      },
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
      type: horizontal ? 'value' : 'category',
      data: horizontal ? undefined : xAxisData,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280'
      },
      splitLine: horizontal ? {
        lineStyle: {
          color: '#f3f4f6'
        }
      } : undefined
    },
    yAxis: {
      type: horizontal ? 'category' : 'value',
      data: horizontal ? xAxisData : undefined,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      axisLabel: {
        color: '#6b7280'
      },
      splitLine: !horizontal ? {
        lineStyle: {
          color: '#f3f4f6'
        }
      } : undefined
    },
    series: series.map((s, index) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      stack: stacked ? 'total' : undefined,
      itemStyle: {
        color: s.color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
        borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
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

export default BarChart
