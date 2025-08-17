'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon,
  Download,
  Calendar,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedMoodChartProps {
  data: any[]
  isLoading?: boolean
  height?: number
  showLoadingState?: boolean
  onDataPointClick?: (data: any) => void
}

type ChartType = 'line' | 'area' | 'bar' | 'pie'

const chartTypes: { type: ChartType; icon: any; label: string }[] = [
  { type: 'line', icon: TrendingUp, label: 'Line' },
  { type: 'area', icon: BarChart3, label: 'Area' },
  { type: 'bar', icon: BarChart3, label: 'Bar' },
  { type: 'pie', icon: PieChartIcon, label: 'Pie' }
]

const moodColors = {
  high: '#10B981',    // Green
  medium: '#F59E0B',  // Yellow
  low: '#EF4444',     // Red
  neutral: '#6B7280'  // Gray
}

export function EnhancedMoodChart({ 
  data, 
  isLoading = false, 
  height = 400,
  showLoadingState = true,
  onDataPointClick 
}: EnhancedMoodChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [showTooltips, setShowTooltips] = useState(true)

  // Process and optimize chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry, index) => ({
        ...entry,
        index,
        date: new Date(entry.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        moodScore: entry.mood_score || 0,
        color: getMoodColor(entry.mood_score || 5)
      }))
  }, [data])

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null

    const scores = chartData.map(d => d.moodScore)
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)
    const trend = scores[scores.length - 1] > scores[0] ? 'improving' : 'declining'

    return { average: average.toFixed(1), highest, lowest, trend }
  }, [chartData])

  // Get mood color based on score
  function getMoodColor(score: number): string {
    if (score >= 8) return moodColors.high
    if (score >= 6) return moodColors.medium
    if (score >= 4) return moodColors.neutral
    return moodColors.low
  }

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1)
    setSelectedRange(null)
  }, [])

  // Custom tooltip
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {data.date}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Mood: <span className="font-medium" style={{ color: data.color }}>
              {data.moodScore}/10
            </span>
          </p>
          {data.notes && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {data.notes}
            </p>
          )}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.tags.slice(0, 3).map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }, [])

  // Handle data point click
  const handleDataPointClick = useCallback((data: any) => {
    if (onDataPointClick) {
      onDataPointClick(data)
    }
  }, [onDataPointClick])

  // Loading state
  if (isLoading && showLoadingState) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-calm-blue" />
            Mood Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-calm-blue" />
            Mood Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No mood data available</p>
            <p className="text-sm">Start logging your moods to see trends</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      onClick: handleDataPointClick,
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 10]} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            {showTooltips && <Tooltip content={<CustomTooltip />} />}
            <Line
              type="monotone"
              dataKey="moodScore"
              stroke="#4A90E2"
              strokeWidth={3}
              dot={{ 
                fill: '#4A90E2', 
                strokeWidth: 2, 
                stroke: '#fff',
                r: 6,
                cursor: 'pointer'
              }}
              activeDot={{ 
                r: 8, 
                stroke: '#4A90E2', 
                strokeWidth: 2,
                cursor: 'pointer'
              }}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 10]} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            {showTooltips && <Tooltip content={<CustomTooltip />} />}
            <Area
              type="monotone"
              dataKey="moodScore"
              stroke="#4A90E2"
              strokeWidth={3}
              fill="#4A90E2"
              fillOpacity={0.3}
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 10]} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            {showTooltips && <Tooltip content={<CustomTooltip />} />}
            <Bar 
              dataKey="moodScore" 
              fill="#4A90E2"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
            />
          </BarChart>
        )

      case 'pie':
        const pieData = chartData.reduce((acc, entry) => {
          const category = entry.moodScore >= 8 ? 'High' : 
                          entry.moodScore >= 6 ? 'Medium' : 
                          entry.moodScore >= 4 ? 'Neutral' : 'Low'
          const existing = acc.find(item => item.name === category)
          if (existing) {
            existing.value++
          } else {
            acc.push({ name: category, value: 1, color: getMoodColor(entry.moodScore) })
          }
          return acc
        }, [] as any[])

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              cursor="pointer"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {showTooltips && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-calm-blue" />
            Mood Trends
          </CardTitle>
          
          {/* Chart Controls */}
          <div className="flex items-center gap-2">
            {/* Chart Type Selector */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {chartTypes.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant={chartType === type ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className="h-8 px-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="sr-only">{label}</span>
                </Button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="h-8 px-2"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="h-8 px-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 5}
                className="h-8 px-2"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Display Options */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={showGrid ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className="h-8 px-2"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={showTooltips ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowTooltips(!showTooltips)}
                className="h-8 px-2"
              >
                <Target className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Average: <strong>{stats.average}/10</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span>Range: <strong>{stats.lowest}-{stats.highest}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span>Trend: <strong className={cn(
                stats.trend === 'improving' ? 'text-green-600' : 'text-red-600'
              )}>{stats.trend}</strong></span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
          
          {/* Zoom Level Indicator */}
          {zoomLevel !== 1 && (
            <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
