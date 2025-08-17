'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Target, Zap, Calendar, Brain, Activity, Clock, Sun, Moon, Cloud, CloudRain } from 'lucide-react'

interface MoodEntry {
  id: string
  date: string
  mood_score: number
  tags: string[]
  notes: string
  sleep_hours?: number
  exercise_minutes?: number
  stress_level?: number
  weather?: string
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night'
}

interface CorrelationData {
  factor: string
  correlation: number
  impact: 'positive' | 'negative' | 'neutral'
  confidence: number
}

interface TriggerAnalysis {
  trigger: string
  frequency: number
  avgMoodBefore: number
  avgMoodAfter: number
  improvement: number
  recommendation: string
}

interface SeasonalPattern {
  month: string
  avgMood: number
  moodVariance: number
  commonTags: string[]
  recommendations: string[]
}

interface EnhancedMoodVisualizationProps {
  moodData?: MoodEntry[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function EnhancedMoodVisualization({ moodData = [] }: EnhancedMoodVisualizationProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [selectedChart, setSelectedChart] = useState('trends')

  const getMoodTrendData = () => {
    if (!moodData || moodData.length === 0) return []
    return moodData.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood_score,
      sleep: entry.sleep_hours || 0,
      exercise: entry.exercise_minutes || 0,
      stress: entry.stress_level || 0
    }))
  }

  const getTagFrequencyData = () => {
    if (!moodData || moodData.length === 0) return []
    const tagCounts: { [key: string]: number } = {}
    moodData.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }

  const getTimeOfDayData = () => {
    if (!moodData || moodData.length === 0) return []
    const timeCounts: { [key: string]: number } = {}
    moodData.forEach(entry => {
      if (entry.time_of_day) {
        timeCounts[entry.time_of_day] = (timeCounts[entry.time_of_day] || 0) + 1
      }
    })
    
    return Object.entries(timeCounts).map(([time, count]) => ({
      time: time.charAt(0).toUpperCase() + time.slice(1),
      count
    }))
  }

  const getWeatherMoodData = () => {
    if (!moodData || moodData.length === 0) return []
    const weatherMoods: { [key: string]: number[] } = {}
    moodData.forEach(entry => {
      if (entry.weather) {
        if (!weatherMoods[entry.weather]) {
          weatherMoods[entry.weather] = []
        }
        weatherMoods[entry.weather].push(entry.mood_score)
      }
    })
    
    return Object.entries(weatherMoods).map(([weather, moods]) => ({
      weather,
      avgMood: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
      count: moods.length
    }))
  }

  const getCorrelationData = () => {
    if (!moodData || moodData.length === 0) return []
    
    // Calculate correlations between mood and other factors
    const correlations: CorrelationData[] = []
    
    // Sleep correlation
    const sleepEntries = moodData.filter(entry => entry.sleep_hours !== undefined)
    if (sleepEntries.length > 0) {
      const sleepCorrelation = calculateCorrelation(
        sleepEntries.map(e => e.sleep_hours!),
        sleepEntries.map(e => e.mood_score)
      )
      correlations.push({
        factor: 'Sleep Hours',
        correlation: Math.abs(sleepCorrelation),
        impact: sleepCorrelation > 0 ? 'positive' : 'negative',
        confidence: Math.min(0.9, sleepEntries.length / 10)
      })
    }
    
    // Exercise correlation
    const exerciseEntries = moodData.filter(entry => entry.exercise_minutes !== undefined)
    if (exerciseEntries.length > 0) {
      const exerciseCorrelation = calculateCorrelation(
        exerciseEntries.map(e => e.exercise_minutes!),
        exerciseEntries.map(e => e.mood_score)
      )
      correlations.push({
        factor: 'Exercise Minutes',
        correlation: Math.abs(exerciseCorrelation),
        impact: exerciseCorrelation > 0 ? 'positive' : 'negative',
        confidence: Math.min(0.9, exerciseEntries.length / 10)
      })
    }
    
    // Stress correlation
    const stressEntries = moodData.filter(entry => entry.stress_level !== undefined)
    if (stressEntries.length > 0) {
      const stressCorrelation = calculateCorrelation(
        stressEntries.map(e => e.stress_level!),
        stressEntries.map(e => e.mood_score)
      )
      correlations.push({
        factor: 'Stress Level',
        correlation: Math.abs(stressCorrelation),
        impact: stressCorrelation > 0 ? 'positive' : 'negative',
        confidence: Math.min(0.9, stressEntries.length / 10)
      })
    }
    
    return correlations.sort((a, b) => b.correlation - a.correlation)
  }

  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length < 2) return 0
    
    const n = x.length
    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0)
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  const getTriggerAnalysis = () => {
    if (!moodData || moodData.length === 0) return []
    
    const triggers: TriggerAnalysis[] = []
    
    // Analyze sleep impact
    const sleepEntries = moodData.filter(entry => entry.sleep_hours !== undefined)
    if (sleepEntries.length > 0) {
      const goodSleep = sleepEntries.filter(e => e.sleep_hours! >= 8)
      const poorSleep = sleepEntries.filter(e => e.sleep_hours! < 6)
      
      if (goodSleep.length > 0 && poorSleep.length > 0) {
        const avgGoodSleepMood = goodSleep.reduce((sum, e) => sum + e.mood_score, 0) / goodSleep.length
        const avgPoorSleepMood = poorSleep.reduce((sum, e) => sum + e.mood_score, 0) / poorSleep.length
        
        triggers.push({
          trigger: 'Good Sleep (8+ hours)',
          frequency: goodSleep.length,
          avgMoodBefore: avgPoorSleepMood,
          avgMoodAfter: avgGoodSleepMood,
          improvement: avgGoodSleepMood - avgPoorSleepMood,
          recommendation: 'Maintain consistent sleep schedule'
        })
      }
    }
    
    // Analyze exercise impact
    const exerciseEntries = moodData.filter(entry => entry.exercise_minutes !== undefined)
    if (exerciseEntries.length > 0) {
      const withExercise = exerciseEntries.filter(e => e.exercise_minutes! >= 30)
      const withoutExercise = exerciseEntries.filter(e => e.exercise_minutes! < 15)
      
      if (withExercise.length > 0 && withoutExercise.length > 0) {
        const avgWithExerciseMood = withExercise.reduce((sum, e) => sum + e.mood_score, 0) / withExercise.length
        const avgWithoutExerciseMood = withoutExercise.reduce((sum, e) => sum + e.mood_score, 0) / withoutExercise.length
        
        triggers.push({
          trigger: 'Exercise (30+ min)',
          frequency: withExercise.length,
          avgMoodBefore: avgWithoutExerciseMood,
          avgMoodAfter: avgWithExerciseMood,
          improvement: avgWithExerciseMood - avgWithoutExerciseMood,
          recommendation: 'Exercise 3-4 times per week'
        })
      }
    }
    
    return triggers.sort((a, b) => Math.abs(b.improvement) - Math.abs(a.improvement))
  }

  const getSeasonalPatterns = () => {
    if (!moodData || moodData.length === 0) return []
    
    const monthlyData: { [key: string]: number[] } = {}
    
    moodData.forEach(entry => {
      const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'long' })
      if (!monthlyData[month]) {
        monthlyData[month] = []
      }
      monthlyData[month].push(entry.mood_score)
    })
    
    return Object.entries(monthlyData).map(([month, moods]) => {
      const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length
      const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - avgMood, 2), 0) / moods.length
      
      // Get common tags for this month
      const monthEntries = moodData.filter(entry => 
        new Date(entry.date).toLocaleDateString('en-US', { month: 'long' }) === month
      )
      const tagCounts: { [key: string]: number } = {}
      monthEntries.forEach(entry => {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })
      const commonTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag)
      
      return {
        month,
        avgMood: Math.round(avgMood * 10) / 10,
        moodVariance: Math.round(variance * 10) / 10,
        commonTags,
        recommendations: getRecommendationsForMonth(month, avgMood, commonTags)
      }
    }).sort((a, b) => {
      const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December']
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    })
  }

  const getRecommendationsForMonth = (month: string, avgMood: number, commonTags: string[]): string[] => {
    const recommendations: string[] = []
    
    if (avgMood < 6) {
      recommendations.push('Consider mood-boosting activities')
      recommendations.push('Practice stress management techniques')
    }
    
    if (commonTags.includes('work') || commonTags.includes('stress')) {
      recommendations.push('Balance work and relaxation')
      recommendations.push('Set healthy boundaries')
    }
    
    if (commonTags.includes('exercise') || commonTags.includes('outdoor')) {
      recommendations.push('Maintain physical activity routine')
      recommendations.push('Spend time in nature')
    }
    
    return recommendations.slice(0, 3)
  }

  // Show empty state if no data
  if (!moodData || moodData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-semibold mb-3">No Mood Data Available</h3>
          <p className="text-lg mb-6">Start tracking your mood to see detailed analytics and insights!</p>
          <Button size="lg" onClick={() => window.location.href = '/log-mood'}>
            <Target className="h-5 w-5 mr-2" />
            Log Your First Mood
          </Button>
        </div>
      </div>
    )
  }

  const correlationData = getCorrelationData()
  const triggerAnalysis = getTriggerAnalysis()
  const seasonalPatterns = getSeasonalPatterns()

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.6) return 'text-green-600'
    if (correlation > 0.3) return 'text-blue-600'
    if (correlation > -0.3) return 'text-gray-600'
    if (correlation > -0.6) return 'text-orange-600'
    return 'text-red-600'
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Advanced Mood Analytics
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Discover patterns, correlations, and insights about your mood
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Tabs */}
        <Tabs value={selectedChart} onValueChange={setSelectedChart} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mood Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Mood Trends
                  </CardTitle>
                  <CardDescription>Your mood over time with key factors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getMoodTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Multi-Factor Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Multi-Factor Analysis
                  </CardTitle>
                  <CardDescription>Mood correlation with sleep, exercise, and stress</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getMoodTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sleep" fill="#10B981" name="Sleep Hours" />
                      <Bar dataKey="exercise" fill="#F59E0B" name="Exercise (min)" />
                      <Bar dataKey="stress" fill="#EF4444" name="Stress Level" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Correlations Tab */}
          <TabsContent value="correlations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Correlation Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-600" />
                    Mood Correlations
                  </CardTitle>
                  <CardDescription>How different factors affect your mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={correlationData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[-1, 1]} />
                      <YAxis dataKey="factor" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="correlation" fill="#8B5CF6">
                        {correlationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.correlation > 0 ? '#10B981' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Correlation Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Correlation Details</CardTitle>
                  <CardDescription>Detailed breakdown of mood factors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {correlationData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getImpactIcon(item.impact)}
                          <div>
                            <div className="font-medium">{item.factor}</div>
                            <div className="text-sm text-gray-600">
                              Confidence: {Math.round(item.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getCorrelationColor(item.correlation)}`}>
                            {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(2)}
                          </div>
                          <Badge variant={item.impact === 'positive' ? 'default' : item.impact === 'negative' ? 'destructive' : 'secondary'}>
                            {item.impact}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Triggers Tab */}
          <TabsContent value="triggers">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trigger Impact Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                    Trigger Impact Analysis
                  </CardTitle>
                  <CardDescription>How different triggers affect your mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={triggerAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trigger" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="improvement" fill="#F59E0B" name="Mood Improvement" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trigger Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Trigger Details</CardTitle>
                  <CardDescription>Detailed analysis of mood triggers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {triggerAnalysis.map((trigger, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{trigger.trigger}</h4>
                          <Badge variant={trigger.improvement > 0 ? 'default' : 'destructive'}>
                            {trigger.improvement > 0 ? '+' : ''}{trigger.improvement.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Frequency:</span>
                            <span className="ml-2 font-medium">{trigger.frequency} times</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <span className="ml-2 font-medium">High</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                          <strong>Recommendation:</strong> {trigger.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time of Day Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                    Time of Day Patterns
                  </CardTitle>
                  <CardDescription>When you tend to feel your best</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getTimeOfDayData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ time, percent }) => `${time} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {getTimeOfDayData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weather Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sun className="h-5 w-5 mr-2 text-yellow-600" />
                    Weather Impact
                  </CardTitle>
                  <CardDescription>How weather affects your mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getWeatherMoodData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="weather" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="avgMood" fill="#10B981" name="Average Mood" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Seasonal Patterns */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Seasonal Patterns
                </CardTitle>
                <CardDescription>Monthly mood trends and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {seasonalPatterns.map((pattern, index) => (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-2">{pattern.month}</div>
                      <div className="text-3xl font-bold text-primary mb-2">{pattern.avgMood.toFixed(1)}/10</div>
                      <div className="text-sm text-gray-600 mb-3">
                        Variance: {pattern.moodVariance.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-700 mb-3">
                        <strong>Common Tags:</strong> {pattern.commonTags.join(', ')}
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Recommendations:</strong> {pattern.recommendations.join('; ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    Key Insights
                  </CardTitle>
                  <CardDescription>AI-powered mood analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Positive Pattern</span>
                      </div>
                      <p className="text-green-700">Your mood improves significantly after 8+ hours of sleep. Consider maintaining a consistent sleep schedule.</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Optimization Opportunity</span>
                      </div>
                      <p className="text-blue-700">Exercise sessions of 30+ minutes consistently boost your mood. Aim for 3-4 workouts per week.</p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-5 w-5 text-orange-600" />
                        <span className="font-semibold text-orange-800">Risk Factor</span>
                      </div>
                      <p className="text-orange-700">High stress levels at work significantly impact your mood. Consider stress management techniques.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>Actionable steps to improve your mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Sleep Optimization</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Aim for 8-9 hours of sleep consistently</li>
                        <li>• Establish a regular bedtime routine</li>
                        <li>• Avoid screens 1 hour before bed</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Exercise Routine</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Exercise 30+ minutes, 3-4 times per week</li>
                        <li>• Mix cardio and strength training</li>
                        <li>• Exercise in the morning for best mood boost</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Stress Management</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Practice deep breathing exercises</li>
                        <li>• Take regular breaks during work</li>
                        <li>• Use the 5-4-3-2-1 grounding technique</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

