'use client'

import ReactECharts from 'echarts-for-react'
import { LineChart, BarChart, PieChart } from '@/components/charts'

const TestEChartsPage = () => {
  // Simple test data
  const pieData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 30 }
  ]

  const lineData = {
    xAxis: ['Mon', 'Tue', 'Wed'],
    series: [{ name: 'Test', data: [10, 20, 15] }]
  }

  const barData = {
    categories: ['Q1', 'Q2', 'Q3'],
    series: [{ name: 'Revenue', data: [100, 200, 150] }]
  }

  // Simple ReactECharts option
  const simpleOption = {
    title: { text: 'Simple Test Chart' },
    xAxis: { type: 'category', data: ['A', 'B', 'C'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [10, 20, 30] }]
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ECharts Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Direct ReactECharts */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Direct ReactECharts</h2>
            <ReactECharts
              option={simpleOption}
              style={{ height: '300px' }}
            />
          </div>

          {/* PieChart Component */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">PieChart Component</h2>
            <PieChart
              data={pieData}
              height="300px"
            />
          </div>

          {/* LineChart Component */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">LineChart Component</h2>
            <LineChart
              xAxisData={lineData.xAxis}
              series={lineData.series}
              height="300px"
            />
          </div>

          {/* BarChart Component */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">BarChart Component</h2>
            <BarChart
              xAxisData={barData.categories}
              series={barData.series}
              height="300px"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestEChartsPage
