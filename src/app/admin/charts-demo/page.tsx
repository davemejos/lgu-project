'use client'

import { useState } from 'react'
import { LineChart, BarChart, PieChart, ChartWrapper } from '@/components/charts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Zap } from 'lucide-react'

const ChartsDemoPage = () => {
  const [loading, setLoading] = useState(false)

  // Sample data
  const salesData = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { name: 'Revenue', data: [4200, 5100, 4800, 6200, 5800, 7100], color: '#3b82f6' },
      { name: 'Profit', data: [2100, 2800, 2400, 3100, 2900, 3600], color: '#10b981' }
    ]
  }

  const departmentData = [
    { name: 'Engineering', value: 45 },
    { name: 'Marketing', value: 25 },
    { name: 'Sales', value: 20 },
    { name: 'Support', value: 10 }
  ]

  const performanceData = {
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      { name: 'Target', data: [100, 120, 140, 160], color: '#f59e0b' },
      { name: 'Actual', data: [95, 135, 125, 170], color: '#3b82f6' }
    ]
  }

  // Direct ECharts option for custom chart
  const customChartOption = {
    title: {
      text: 'Custom ECharts Implementation',
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
    xAxis: {
      type: 'category' as const,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value' as const
    },
    series: [
      {
        name: 'Activity',
        type: 'line',
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        lineStyle: {
          color: '#8b5cf6'
        }
      }
    ]
  }

  const toggleLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">ECharts Components Demo</h1>
                <p className="text-indigo-100 mt-2">
                  Reusable chart components with professional styling and TypeScript support
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Interactive Demo</h2>
            <button
              onClick={toggleLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Loading State
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Line Chart Component</h3>
            </div>
            <LineChart
              title="Sales Performance"
              xAxisData={salesData.months}
              series={salesData.series}
              height="350px"
              smooth={true}
              showArea={true}
            />
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Bar Chart Component</h3>
            </div>
            <BarChart
              title="Quarterly Performance"
              xAxisData={performanceData.categories}
              series={performanceData.series}
              height="350px"
              stacked={false}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <PieChartIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pie Chart Component</h3>
            </div>
            <PieChart
              title="Department Distribution"
              data={departmentData}
              height="350px"
              donut={true}
              showLegend={true}
              legendPosition="bottom"
            />
          </div>

          {/* Custom Chart with ChartWrapper */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Custom Chart Wrapper</h3>
            </div>
            <ChartWrapper
              option={customChartOption}
              height="350px"
              loading={loading}
              className="border border-gray-100 rounded-lg"
            />
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">LineChart Component</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <pre className="text-gray-700 overflow-x-auto">
{`<LineChart
  title="Sales Performance"
  xAxisData={['Jan', 'Feb', 'Mar']}
  series={[
    { 
      name: 'Revenue', 
      data: [4200, 5100, 4800],
      color: '#3b82f6' 
    }
  ]}
  smooth={true}
  showArea={true}
/>`}
                </pre>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">PieChart Component</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <pre className="text-gray-700 overflow-x-auto">
{`<PieChart
  title="Department Distribution"
  data={[
    { name: 'Engineering', value: 45 },
    { name: 'Marketing', value: 25 }
  ]}
  donut={true}
  showLegend={true}
/>`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">TypeScript Support</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full type safety</li>
                <li>• IntelliSense support</li>
                <li>• Interface definitions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Responsive Design</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-resize handling</li>
                <li>• Mobile-friendly</li>
                <li>• Flexible layouts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Professional Styling</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tailwind integration</li>
                <li>• Custom color palettes</li>
                <li>• Loading states</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartsDemoPage
