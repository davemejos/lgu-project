'use client'

import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'

interface PieChartData {
  name: string
  value: number
  color?: string
}

interface PieChartProps {
  title?: string
  data: PieChartData[]
  height?: string | number
  donut?: boolean
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  height = '400px',
  donut = false,
  showLegend = true,
  legendPosition = 'bottom',
  className = ''
}) => {
  const defaultColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ]

  const processedData = data.map((item, index) => ({
    ...item,
    itemStyle: {
      color: item.color || defaultColors[index % defaultColors.length]
    }
  }))

  const option: EChartsOption = {
    title: title ? {
      text: title,
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151'
      }
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      }
    },
    legend: showLegend ? {
      orient: legendPosition === 'left' || legendPosition === 'right' ? 'vertical' : 'horizontal',
      [legendPosition]: legendPosition === 'top' ? '10%' : legendPosition === 'bottom' ? '5%' : '5%',
      data: data.map(item => item.name),
      textStyle: {
        color: '#6b7280'
      }
    } : undefined,
    series: [
      {
        name: 'Data',
        type: 'pie',
        radius: donut ? ['40%', '70%'] : '70%',
        center: ['50%', '50%'],
        data: processedData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          color: '#374151'
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: '#9ca3af'
          }
        }
      }
    ]
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

export default PieChart
