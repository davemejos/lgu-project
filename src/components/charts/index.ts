// ECharts Components Export
export { default as ChartWrapper } from './ChartWrapper'
export { default as LineChart } from './LineChart'
export { default as BarChart } from './BarChart'
export { default as PieChart } from './PieChart'

// Re-export echarts and echarts-for-react for convenience
import * as echarts from 'echarts'
export { echarts }
export { default as ReactECharts } from 'echarts-for-react'

// Common chart types and interfaces
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  category?: string
}

export interface ChartTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  gridColor: string
}

// Default theme
export const defaultChartTheme: ChartTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#374151',
  gridColor: '#f3f4f6'
}

// Chart color palettes
export const chartColorPalettes = {
  default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  professional: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db'],
  vibrant: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
  pastel: ['#93c5fd', '#86efac', '#fde68a', '#fca5a5', '#c4b5fd'],
  ocean: ['#0ea5e9', '#06b6d4', '#0891b2', '#0e7490', '#155e75']
}
