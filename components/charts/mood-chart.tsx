'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { 
  LineChart, 
  BarChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart,
  Brush,
  ReferenceLine,
  Legend
} from 'recharts'
import { useTheme } from '@/hooks/use-theme'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChartSpinner } from '@/components/ui/loading-spinner'

interface MoodChartProps {
  type: 'line' | 'bar' | 'area'
  data: Array<{ date: string; mood: number }>
  isLoading?: boolean
  height?: number
}

export function MoodChart({ type, data, isLoading = false, height = 64 }: MoodChartProps) {
  const [chartKey, setChartKey] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [brushRange, setBrushRange] = useState<[number, number] | null>(null)
  const { isDarkMode } = useTheme()
  
  // Dark mode colors
  const darkModeColors = {
    grid: '#374151',
    axis: '#9CA3AF',
    text: '#E5E7EB'
  }

  const lightModeColors = {
    grid: '#E2E8F0',
    axis: '#64748B',
    text: '#1F2937'
  }

  const colors = isDarkMode ? darkModeColors : lightModeColors

  // Enhanced mood color coding (Bearable style)
  const getMoodColor = useCallback((score: number): string => {
    if (score >= 9) return '#059669' // Dark green for excellent
    if (score >= 8) return '#10B981' // Green for high scores
    if (score >= 7) return '#34D399' // Light green for good
    if (score >= 6) return '#60A5FA' // Blue for okay
    if (score >= 5) return '#FBBF24' // Yellow for neutral
    if (score >= 4) return '#F59E0B' // Orange for below average
    if (score >= 3) return '#F97316' // Dark orange for low
    if (score >= 2) return '#EF4444' // Red for very low
    return '#DC2626' // Dark red for terrible
  }, [])

  // Gradient colors for area charts
  const getMoodGradientStart = useCallback((score: number): string => {
    if (score >= 8) return '#10B981'
    if (score >= 6) return '#60A5FA'
    if (score >= 4) return '#FBBF24'
    return '#F97316'
  }, [])

  const getMoodGradientEnd = useCallback((score: number): string => {
    if (score >= 8) return '#34D399'
    if (score >= 6) return '#93C5FD'
    if (score >= 4) return '#FCD34D'
    return '#FB923C'
  }, [])

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: item.mood,
      // Enhanced color coding based on mood score (Bearable style)
      color: getMoodColor(item.mood),
      fill: getMoodColor(item.mood),
      // Add gradient colors for area charts
      gradientStart: getMoodGradientStart(item.mood),
      gradientEnd: getMoodGradientEnd(item.mood)
    }))
  }, [data, getMoodColor, getMoodGradientStart, getMoodGradientEnd])

  // Memoize average calculation
  const averageMood = useMemo(() => {
    if (chartData.length === 0) return 0
    return chartData.reduce((sum, item) => sum + item.mood, 0) / chartData.length
  }, [chartData])

  // Memoize chart data with average for reference line
  const chartDataWithAverage = useMemo(() => {
    if (chartData.length === 0) return []
    
    const withAverage = [...chartData]
    // Add average line data points
    withAverage.push({
      date: 'Avg',
      mood: averageMood,
      color: isDarkMode ? '#94A3B8' : '#64748B',
      fill: isDarkMode ? '#94A3B8' : '#64748B',
      gradientStart: isDarkMode ? '#94A3B8' : '#64748B',
      gradientEnd: isDarkMode ? '#94A3B8' : '#64748B'
    })
    
    return withAverage
  }, [chartData, averageMood, isDarkMode])

  // Force chart re-render when data changes significantly
  useEffect(() => {
    setChartKey(prev => prev + 1)
  }, [data?.length])

  // Handle brush change for zoom functionality
  const handleBrushChange = useCallback((brushData: any) => {
    if (brushData && brushData.startIndex !== brushData.endIndex) {
      setBrushRange([brushData.startIndex, brushData.endIndex])
      setIsZoomed(true)
    }
  }, [])

  // Reset zoom
  const resetZoom = useCallback(() => {
    setBrushRange(null)
    setIsZoomed(false)
    setChartKey(prev => prev + 1)
  }, [])

  // Custom tooltip content
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{`Date: ${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Mood: ${data.value}/10`}
          </p>
          <div 
            className="w-4 h-4 rounded-full mt-2"
            style={{ backgroundColor: getMoodColor(data.value) }}
          />
        </div>
      )
    }
    return null
  }, [getMoodColor])

  // Show loading state
  if (isLoading) {
    return <ChartSpinner height={`h-${height}`} text="Loading chart data..." />
  }

  // Show empty state if no data
  if (!chartData || chartData.length === 0) {
    return (
      <div className={`h-${height} w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-dashed border-blue-200 dark:border-gray-700`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-lg font-medium mb-2">No mood data available</p>
          <p className="text-sm">Start logging your mood to see beautiful charts here</p>
        </div>
      </div>
    )
  }

  // Chart controls
  const ChartControls = () => (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsZoomed(!isZoomed)}
        className="h-8 px-3"
      >
        {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
        {isZoomed ? 'Zoom Out' : 'Zoom In'}
      </Button>
      {isZoomed && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetZoom}
          className="h-8 px-3"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      )}
    </div>
  )

  if (type === 'area') {
    return (
      <div className={`h-${height} w-full`}>
        <ChartControls />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            key={chartKey}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={entry.gradientStart} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={entry.gradientEnd} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: colors.text }}
              axisLine={{ stroke: colors.grid }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={[1, 10]}
              tick={{ fontSize: 12, fill: colors.text }}
              axisLine={{ stroke: colors.grid }}
              tickCount={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="mood" 
              stroke="#4A90E2" 
              strokeWidth={3}
              fill="url(#gradient-0)"
              animationDuration={1000}
              animationBegin={0}
            />
            <ReferenceLine 
              y={averageMood} 
              stroke={colors.axis} 
              strokeDasharray="5 5"
              label={{ value: `Avg: ${averageMood.toFixed(1)}`, position: 'insideRight' }}
            />
            {isZoomed && (
              <Brush 
                dataKey="date" 
                height={30} 
                stroke="#4A90E2"
                onChange={handleBrushChange}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === 'line') {
    return (
      <div className={`h-${height} w-full`}>
        <ChartControls />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            key={chartKey}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: colors.text }}
              axisLine={{ stroke: colors.grid }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={[1, 10]}
              tick={{ fontSize: 12, fill: colors.text }}
              axisLine={{ stroke: colors.grid }}
              tickCount={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="#4A90E2" 
              strokeWidth={4}
              dot={(props: any) => {
                const { cx, cy, payload } = props
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={getMoodColor(payload.mood)}
                    stroke="#fff"
                    strokeWidth={2}
                    className="drop-shadow-lg animate-pulse"
                  />
                )
              }}
              activeDot={{ 
                r: 8, 
                fill: '#4A90E2', 
                stroke: '#fff', 
                strokeWidth: 3,
                className: 'drop-shadow-xl'
              }}
              connectNulls={true}
              animationDuration={1000}
              animationBegin={0}
            />
            {/* Average reference line */}
            <ReferenceLine 
              y={averageMood} 
              stroke={colors.axis} 
              strokeDasharray="5 5"
              label={{ value: `Avg: ${averageMood.toFixed(1)}`, position: 'insideRight' }}
            />
            {isZoomed && (
              <Brush 
                dataKey="date" 
                height={30} 
                stroke="#4A90E2"
                onChange={handleBrushChange}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className={`h-${height} w-full`}>
      <ChartControls />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          key={chartKey}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: colors.text }}
            axisLine={{ stroke: colors.grid }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[1, 10]}
            tick={{ fontSize: 12, fill: colors.text }}
            axisLine={{ stroke: colors.grid }}
            tickCount={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="mood" 
            fill="#4A90E2"
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
            animationBegin={0}
            className="drop-shadow-md hover:drop-shadow-xl transition-all duration-300"
          />
          {/* Average reference line */}
          <ReferenceLine 
            y={averageMood} 
            stroke={colors.axis} 
            strokeDasharray="5 5"
            label={{ value: `Avg: ${averageMood.toFixed(1)}`, position: 'insideRight' }}
          />
          {isZoomed && (
            <Brush 
              dataKey="date" 
              height={30} 
              stroke="#4A90E2"
              onChange={handleBrushChange}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}