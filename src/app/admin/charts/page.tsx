'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import * as echarts from 'echarts'
import ReactECharts from 'echarts-for-react'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Target,
  Gauge,
  LineChart,
  Zap
} from 'lucide-react'

interface ChartData {
  name: string
  value: number
}

// Type for ECharts option to avoid strict typing issues
type EChartsOptionType = Record<string, unknown>

// Type for ECharts callback parameters
interface EChartsCallbackParams {
  data: number[]
  seriesName?: string
  name?: string
  [key: string]: unknown
}



const ChartsPage = () => {
  const [activeTab, setActiveTab] = useState('overview')

  // Multiple refs for direct ECharts implementations
  const directChartRef = useRef<HTMLDivElement>(null)
  const directBarChartRef = useRef<HTMLDivElement>(null)
  const directScatterChartRef = useRef<HTMLDivElement>(null)
  const directHeatmapChartRef = useRef<HTMLDivElement>(null)
  const directCandlestickChartRef = useRef<HTMLDivElement>(null)

  // Chart instances state variables (for cleanup purposes)
  const [, setChartInstance] = useState<echarts.ECharts | null>(null)
  const [, setBarChartInstance] = useState<echarts.ECharts | null>(null)
  const [, setScatterChartInstance] = useState<echarts.ECharts | null>(null)
  const [, setHeatmapChartInstance] = useState<echarts.ECharts | null>(null)
  const [, setCandlestickChartInstance] = useState<echarts.ECharts | null>(null)

  // Sample data for demonstrations
  const pieData: ChartData[] = [
    { name: 'Desktop', value: 1048 },
    { name: 'Mobile', value: 735 },
    { name: 'Tablet', value: 580 },
    { name: 'Smart TV', value: 484 },
    { name: 'Others', value: 300 }
  ]

  const barData = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { name: 'Revenue', data: [120, 200, 150, 80, 70, 110] },
      { name: 'Profit', data: [80, 130, 90, 50, 40, 70] },
      { name: 'Expenses', data: [40, 70, 60, 30, 30, 40] }
    ]
  }

  const lineData = {
    xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      { name: 'Users', data: [820, 932, 901, 934, 1290, 1330, 1320] },
      { name: 'Sessions', data: [620, 732, 701, 734, 1090, 1130, 1120] }
    ]
  }

  const scatterData = Array.from({ length: 50 }, () => [
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 50 + 10
  ])

  const radarData = {
    indicator: [
      { name: 'Sales', max: 100 },
      { name: 'Administration', max: 100 },
      { name: 'Information Technology', max: 100 },
      { name: 'Customer Support', max: 100 },
      { name: 'Development', max: 100 },
      { name: 'Marketing', max: 100 }
    ],
    series: [
      {
        name: 'Performance',
        value: [80, 90, 95, 85, 88, 92]
      },
      {
        name: 'Target',
        value: [70, 85, 90, 80, 85, 88]
      }
    ]
  }

  // Candlestick data (OHLC format)
  const candlestickData = useMemo(() => [
    [20, 34, 10, 25], [40, 35, 30, 50], [31, 38, 33, 44], [38, 15, 5, 42],
    [20, 34, 10, 25], [40, 35, 30, 50], [31, 38, 33, 44], [38, 15, 5, 42],
    [20, 34, 10, 25], [40, 35, 30, 50], [31, 38, 33, 44], [38, 15, 5, 42]
  ], [])

  // Heatmap data
  const heatmapData = Array.from({ length: 7 * 24 }, (_, i) => [
    i % 24, Math.floor(i / 24), Math.floor(Math.random() * 10)
  ])

  // Funnel data
  const funnelData = [
    { value: 100, name: 'Visitors' },
    { value: 80, name: 'Interested' },
    { value: 60, name: 'Leads' },
    { value: 40, name: 'Qualified' },
    { value: 20, name: 'Customers' }
  ]

  // Tree data
  const treeData = {
    name: 'Root',
    children: [
      {
        name: 'Branch A',
        children: [
          { name: 'Leaf A1', value: 10 },
          { name: 'Leaf A2', value: 20 }
        ]
      },
      {
        name: 'Branch B',
        children: [
          { name: 'Leaf B1', value: 15 },
          { name: 'Leaf B2', value: 25 }
        ]
      }
    ]
  }

  // Direct ECharts implementations
  useEffect(() => {
    if (directChartRef.current) {
      const chart = echarts.init(directChartRef.current)

      const option = {
        title: {
          text: 'Direct ECharts - Advanced Line Chart',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            color: '#374151'
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          textStyle: {
            color: '#374151'
          }
        },
        legend: {
          data: ['Sales', 'Marketing', 'Development'],
          bottom: 10,
          textStyle: {
            color: '#6b7280'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category' as const,
          data: ['Q1', 'Q2', 'Q3', 'Q4'],
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
          type: 'value' as const,
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
        series: [
          {
            name: 'Sales',
            type: 'line',
            data: [120, 132, 101, 134],
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
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: 'Marketing',
            type: 'line',
            data: [220, 182, 191, 234],
            smooth: true,
            lineStyle: {
              color: '#ef4444',
              width: 3
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: 'Development',
            type: 'line',
            data: [150, 232, 201, 154],
            smooth: true,
            lineStyle: {
              color: '#10b981',
              width: 3
            },
            emphasis: {
              focus: 'series'
            }
          }
        ]
      }

      chart.setOption(option as EChartsOptionType)
      setChartInstance(chart)

      // Handle resize
      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
        setChartInstance(null)
      }
    }
  }, [])

  // Direct Bar Chart Implementation
  useEffect(() => {
    if (directBarChartRef.current) {
      const chart = echarts.init(directBarChartRef.current)

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
          data: ['Revenue', 'Profit', 'Expenses'],
          bottom: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
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
          },
          {
            name: 'Expenses',
            type: 'bar',
            data: [40, 70, 60, 30, 30, 40],
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: '#f59e0b'
                }, {
                  offset: 1, color: '#d97706'
                }]
              },
              borderRadius: [4, 4, 0, 0]
            }
          }
        ]
      }

      chart.setOption(option as EChartsOptionType)
      setBarChartInstance(chart)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
        setBarChartInstance(null)
      }
    }
  }, [])

  // Direct Scatter Chart Implementation
  useEffect(() => {
    if (directScatterChartRef.current) {
      const chart = echarts.init(directScatterChartRef.current)

      // Generate more sophisticated scatter data
      const scatterData1 = Array.from({ length: 50 }, () => [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 50 + 10
      ])

      const scatterData2 = Array.from({ length: 50 }, () => [
        Math.random() * 100 + 20,
        Math.random() * 100 + 20,
        Math.random() * 30 + 15
      ])

      const option = {
        title: {
          text: 'Direct ECharts - Multi-Series Scatter Plot',
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
            return `${params.seriesName}<br/>X: ${params.data[0].toFixed(2)}<br/>Y: ${params.data[1].toFixed(2)}<br/>Size: ${params.data[2].toFixed(2)}`
          }
        },
        legend: {
          data: ['Dataset A', 'Dataset B'],
          bottom: 10
        },
        grid: {
          left: '3%',
          right: '7%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          name: 'Performance Score',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value' as const,
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        yAxis: {
          name: 'Efficiency Rating',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value' as const,
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: 'Dataset A',
            type: 'scatter',
            data: scatterData1,
            symbolSize: function(data: number[]) {
              return Math.sqrt(data[2]) * 2
            },
            itemStyle: {
              color: '#3b82f6',
              opacity: 0.7
            },
            emphasis: {
              itemStyle: {
                borderColor: '#1d4ed8',
                borderWidth: 2
              }
            }
          },
          {
            name: 'Dataset B',
            type: 'scatter',
            data: scatterData2,
            symbolSize: function(data: number[]) {
              return Math.sqrt(data[2]) * 2
            },
            itemStyle: {
              color: '#ef4444',
              opacity: 0.7
            },
            emphasis: {
              itemStyle: {
                borderColor: '#dc2626',
                borderWidth: 2
              }
            }
          }
        ]
      }

      chart.setOption(option as EChartsOptionType)
      setScatterChartInstance(chart)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
        setScatterChartInstance(null)
      }
    }
  }, [])

  // Direct Heatmap Implementation
  useEffect(() => {
    if (directHeatmapChartRef.current) {
      const chart = echarts.init(directHeatmapChartRef.current)

      const option = {
        title: {
          text: 'Direct ECharts - Advanced Heatmap',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            color: '#374151'
          }
        },
        tooltip: {
          position: 'top',
          formatter: function(params: EChartsCallbackParams) {
            const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p']
            const days = ['Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday', 'Sunday']
            return `${days[params.data[1]]}<br/>${hours[params.data[0]]}: ${params.data[2]} activities`
          }
        },
        grid: {
          height: '50%',
          top: '15%'
        },
        xAxis: {
          type: 'category' as const,
          data: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'],
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category' as const,
          data: ['Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday', 'Sunday'],
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
          bottom: '5%',
          inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
          }
        },
        series: [{
          name: 'Punch Card',
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
      setHeatmapChartInstance(chart)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
        setHeatmapChartInstance(null)
      }
    }
  }, [heatmapData])

  // Direct Candlestick Implementation
  useEffect(() => {
    if (directCandlestickChartRef.current) {
      const chart = echarts.init(directCandlestickChartRef.current)

      const option = {
        title: {
          text: 'Direct ECharts - Professional Candlestick Chart',
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
            type: 'cross'
          },
          formatter: function(params: EChartsCallbackParams[]) {
            const data = (params[0] as EChartsCallbackParams).data
            return `${(params[0] as EChartsCallbackParams).name}<br/>Open: ${data[0]}<br/>Close: ${data[1]}<br/>Low: ${data[2]}<br/>High: ${data[3]}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category' as const,
          data: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'],
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: {
            show: true
          }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 50,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            start: 50,
            end: 100
          }
        ],
        series: [
          {
            type: 'candlestick',
            data: candlestickData,
            itemStyle: {
              color: '#10b981',
              color0: '#ef4444',
              borderColor: '#10b981',
              borderColor0: '#ef4444'
            },
            emphasis: {
              itemStyle: {
                borderWidth: 2
              }
            }
          }
        ]
      }

      chart.setOption(option as EChartsOptionType)
      setCandlestickChartInstance(chart)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
        setCandlestickChartInstance(null)
      }
    }
  }, [candlestickData])

  // React ECharts Options
  const getPieOption = () => ({
    title: {
      text: 'Device Usage Distribution',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Device Type',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })

  const getBarOption = () => ({
    title: {
      text: 'Monthly Financial Overview',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: barData.series.map(s => s.name),
      bottom: 10
    },
    xAxis: {
      type: 'category',
      data: barData.categories
    },
    yAxis: {
      type: 'value'
    },
    series: barData.series.map((s, index) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      itemStyle: {
        color: ['#3b82f6', '#10b981', '#f59e0b'][index]
      }
    }))
  })

  const getLineOption = () => ({
    title: {
      text: 'Weekly Analytics Trend',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: lineData.series.map(s => s.name),
      bottom: 10
    },
    xAxis: {
      type: 'category',
      data: lineData.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: lineData.series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      lineStyle: {
        color: ['#8b5cf6', '#06b6d4'][index]
      }
    }))
  })

  const getScatterOption = () => ({
    title: {
      text: 'Performance vs Efficiency Scatter Plot',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: 'Performance: {c[0]}<br/>Efficiency: {c[1]}<br/>Score: {c[2]}'
    },
    xAxis: {
      name: 'Performance',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      name: 'Efficiency',
      nameLocation: 'middle',
      nameGap: 30
    },
    series: [
      {
        type: 'scatter',
        data: scatterData,
        symbolSize: (data: number[]) => data[2],
        itemStyle: {
          color: '#f59e0b',
          opacity: 0.7
        }
      }
    ]
  })

  const getRadarOption = () => ({
    title: {
      text: 'Department Performance Radar',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {},
    legend: {
      data: radarData.series.map(s => s.name),
      bottom: 10
    },
    radar: {
      indicator: radarData.indicator
    },
    series: [
      {
        type: 'radar',
        data: radarData.series.map(s => ({
          value: s.value,
          name: s.name
        }))
      }
    ]
  })

  const getGaugeOption = () => ({
    title: {
      text: 'System Performance Gauge',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    series: [
      {
        name: 'Performance',
        type: 'gauge',
        detail: { formatter: '{value}%' },
        data: [{ value: 85, name: 'CPU Usage' }],
        axisLine: {
          lineStyle: {
            color: [
              [0.3, '#67e8f9'],
              [0.7, '#34d399'],
              [1, '#f87171']
            ]
          }
        }
      }
    ]
  })

  const getCandlestickOption = () => ({
    title: {
      text: 'Stock Price Candlestick Chart',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params: EChartsCallbackParams[]) {
        const data = (params[0] as EChartsCallbackParams).data
        return `Open: ${data[0]}<br/>Close: ${data[1]}<br/>Low: ${data[2]}<br/>High: ${data[3]}`
      }
    },
    xAxis: {
      type: 'category',
      data: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'candlestick',
        data: candlestickData,
        itemStyle: {
          color: '#ef4444',
          color0: '#10b981',
          borderColor: '#ef4444',
          borderColor0: '#10b981'
        }
      }
    ]
  })

  const getHeatmapOption = () => ({
    title: {
      text: 'Weekly Activity Heatmap',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {
      position: 'top',
      formatter: function(params: EChartsCallbackParams) {
        return `Hour: ${params.data[0]}:00<br/>Day: ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][params.data[1]]}<br/>Activity: ${params.data[2]}`
      }
    },
    grid: {
      height: '50%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
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
      bottom: '5%',
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
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
  })

  const getFunnelOption = () => ({
    title: {
      text: 'Sales Funnel Analysis',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: 'Funnel',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: funnelData
      }
    ]
  })

  const getTreeOption = () => ({
    title: {
      text: 'Organization Tree',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold' as const
      }
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        data: [treeData],
        top: '1%',
        left: '7%',
        bottom: '1%',
        right: '20%',
        symbolSize: 7,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 12
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ]
  })

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'line', name: 'Line Charts', icon: LineChart },
    { id: 'bar', name: 'Bar Charts', icon: BarChart3 },
    { id: 'pie', name: 'Pie Charts', icon: PieChart },
    { id: 'scatter', name: 'Scatter Plot', icon: Target },
    { id: 'radar', name: 'Radar Chart', icon: Zap },
    { id: 'gauge', name: 'Gauge Chart', icon: Gauge },
    { id: 'heatmap', name: 'Heatmap', icon: Activity },
    { id: 'candlestick', name: 'Candlestick', icon: TrendingUp },
    { id: 'funnel', name: 'Funnel', icon: Target },
    { id: 'tree', name: 'Tree/Graph', icon: Activity },
    { id: 'advanced', name: 'Advanced', icon: Activity }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">ECharts Integration Showcase</h1>
                <p className="text-blue-100 mt-2">
                  Professional charting solutions with both React wrapper and direct ECharts implementation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Direct ECharts Implementation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Direct ECharts</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Native Implementation
                  </div>
                </div>
                <div ref={directChartRef} style={{ width: '100%', height: '400px' }} />
              </div>

              {/* React ECharts Wrapper */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">React ECharts</h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    React Wrapper
                  </div>
                </div>
                <ReactECharts
                  option={getPieOption()}
                  style={{ height: '400px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'pie' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={getPieOption()}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={{
                    ...getPieOption(),
                    title: { text: 'Donut Chart Variation', left: 'center' },
                    series: [{
                      ...getPieOption().series[0],
                      radius: ['40%', '70%']
                    }]
                  }}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'bar' && (
            <div className="grid grid-cols-1 gap-6">
              {/* React ECharts Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">React ECharts Bar</h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    React Wrapper
                  </div>
                </div>
                <ReactECharts
                  option={getBarOption()}
                  style={{ height: '400px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>

              {/* Direct ECharts Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Direct ECharts Bar</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Native Implementation
                  </div>
                </div>
                <div ref={directBarChartRef} style={{ width: '100%', height: '400px' }} />
              </div>

              {/* Horizontal Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={{
                    ...getBarOption(),
                    title: { text: 'Horizontal Bar Chart', left: 'center' },
                    xAxis: { type: 'value' },
                    yAxis: { type: 'category', data: barData.categories },
                    series: barData.series.map((s, index) => ({
                      name: s.name,
                      type: 'bar',
                      data: s.data,
                      itemStyle: {
                        color: ['#3b82f6', '#10b981', '#f59e0b'][index]
                      }
                    }))
                  }}
                  style={{ height: '400px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'line' && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={getLineOption()}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={{
                    ...getLineOption(),
                    title: { text: 'Area Chart Variation', left: 'center' },
                    series: lineData.series.map((s, index) => ({
                      name: s.name,
                      type: 'line',
                      data: s.data,
                      smooth: true,
                      areaStyle: {
                        opacity: 0.3
                      },
                      lineStyle: {
                        color: ['#8b5cf6', '#06b6d4'][index]
                      }
                    }))
                  }}
                  style={{ height: '400px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'scatter' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* React ECharts Scatter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">React ECharts Scatter</h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    React Wrapper
                  </div>
                </div>
                <ReactECharts
                  option={getScatterOption()}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>

              {/* Direct ECharts Scatter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Direct ECharts Scatter</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Native Implementation
                  </div>
                </div>
                <div ref={directScatterChartRef} style={{ width: '100%', height: '500px' }} />
              </div>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ReactECharts
                option={getRadarOption()}
                style={{ height: '600px' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          )}

          {activeTab === 'gauge' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={getGaugeOption()}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={{
                    title: {
                      text: 'Multi-Gauge Dashboard',
                      left: 'center'
                    },
                    series: [
                      {
                        name: 'CPU',
                        type: 'gauge',
                        center: ['25%', '50%'],
                        radius: '60%',
                        detail: { formatter: '{value}%' },
                        data: [{ value: 75, name: 'CPU' }]
                      },
                      {
                        name: 'Memory',
                        type: 'gauge',
                        center: ['75%', '50%'],
                        radius: '60%',
                        detail: { formatter: '{value}%' },
                        data: [{ value: 60, name: 'Memory' }]
                      }
                    ]
                  }}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'heatmap' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* React ECharts Heatmap */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">React ECharts Heatmap</h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    React Wrapper
                  </div>
                </div>
                <ReactECharts
                  option={getHeatmapOption()}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>

              {/* Direct ECharts Heatmap */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Direct ECharts Heatmap</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Native Implementation
                  </div>
                </div>
                <div ref={directHeatmapChartRef} style={{ width: '100%', height: '500px' }} />
              </div>
            </div>
          )}

          {activeTab === 'candlestick' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* React ECharts Candlestick */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">React ECharts Candlestick</h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    React Wrapper
                  </div>
                </div>
                <ReactECharts
                  option={getCandlestickOption()}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>

              {/* Direct ECharts Candlestick */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Direct ECharts Candlestick</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Native Implementation
                  </div>
                </div>
                <div ref={directCandlestickChartRef} style={{ width: '100%', height: '500px' }} />
              </div>
            </div>
          )}

          {activeTab === 'funnel' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ReactECharts
                option={getFunnelOption()}
                style={{ height: '600px' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ReactECharts
                option={getTreeOption()}
                style={{ height: '600px' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Combination Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={{
                    title: {
                      text: 'Advanced Combination Chart',
                      left: 'center'
                    },
                    tooltip: {
                      trigger: 'axis',
                      axisPointer: {
                        type: 'cross'
                      }
                    },
                    legend: {
                      data: ['Revenue', 'Growth Rate'],
                      bottom: 10
                    },
                    xAxis: {
                      type: 'category',
                      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                    },
                    yAxis: [
                      {
                        type: 'value',
                        name: 'Revenue',
                        position: 'left'
                      },
                      {
                        type: 'value',
                        name: 'Growth Rate',
                        position: 'right',
                        axisLabel: {
                          formatter: '{value}%'
                        }
                      }
                    ],
                    series: [
                      {
                        name: 'Revenue',
                        type: 'bar',
                        data: [120, 200, 150, 80, 70, 110],
                        itemStyle: {
                          color: '#3b82f6'
                        }
                      },
                      {
                        name: 'Growth Rate',
                        type: 'line',
                        yAxisIndex: 1,
                        data: [15, 25, 10, -5, -10, 8],
                        smooth: true,
                        lineStyle: {
                          color: '#ef4444'
                        }
                      }
                    ]
                  }}
                  style={{ height: '500px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>

              {/* Heatmap */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ReactECharts
                  option={{
                    title: {
                      text: 'Activity Heatmap',
                      left: 'center'
                    },
                    tooltip: {
                      position: 'top'
                    },
                    grid: {
                      height: '50%',
                      top: '10%'
                    },
                    xAxis: {
                      type: 'category',
                      data: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
                             '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'],
                      splitArea: {
                        show: true
                      }
                    },
                    yAxis: {
                      type: 'category',
                      data: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
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
                      bottom: '15%'
                    },
                    series: [{
                      name: 'Activity',
                      type: 'heatmap',
                      data: Array.from({ length: 7 * 24 }, (_, i) => [
                        i % 24,
                        Math.floor(i / 24),
                        Math.floor(Math.random() * 10)
                      ]),
                      label: {
                        show: true
                      },
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 10,
                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                      }
                    }]
                  }}
                  style={{ height: '600px' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Implementation Guide */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Direct ECharts Implementation</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <pre className="text-gray-700">
{`import * as echarts from 'echarts'

const chart = echarts.init(element)
chart.setOption(option)
chart.resize() // Handle responsive`}
                </pre>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">React ECharts Wrapper</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <pre className="text-gray-700">
{`import ReactECharts from 'echarts-for-react'

<ReactECharts
  option={chartOption}
  style={{ height: '400px' }}
  opts={{ renderer: 'canvas' }}
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartsPage
