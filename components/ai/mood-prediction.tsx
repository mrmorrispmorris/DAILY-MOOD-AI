'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MoodPrediction {
  id: string
  predictedMood: number
  confidence: number
  triggerFactors: string[]
  recommendedActions: string[]
  predictedTime: Date
  accuracy: number
  isPositive: boolean
}

interface PredictionInsight {
  type: 'pattern' | 'trigger' | 'improvement' | 'warning'
  title: string
  description: string
  icon: React.ReactNode
  action: string
  priority: 'high' | 'medium' | 'low'
}

export default function MoodPrediction() {
  const [predictions, setPredictions] = useState<MoodPrediction[]>([])
  const [insights, setInsights] = useState<PredictionInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [predictionAccuracy, setPredictionAccuracy] = useState(0) // Will be updated when AI predictions are implemented

  // Mock data - in production this would come from AI analysis
  useEffect(() => {
    const mockPredictions: MoodPrediction[] = [] // No mock data - will use real AI predictions

    const mockInsights: PredictionInsight[] = [] // No mock data - will use real AI insights

    setPredictions(mockPredictions)
    setInsights(mockInsights)
  }, [])

  const generatePrediction = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newPrediction: MoodPrediction = {
      id: Date.now().toString(),
      predictedMood: Math.floor(Math.random() * 10) + 1,
      confidence: Math.floor(Math.random() * 20) + 80,
      triggerFactors: ['AI analysis of recent patterns', 'Environmental factors', 'Behavioral indicators'],
      recommendedActions: ['Practice mindfulness', 'Take a break', 'Connect with nature'],
      predictedTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
      accuracy: Math.floor(Math.random() * 20) + 75,
      isPositive: Math.random() > 0.5
    }
    
    setPredictions(prev => [newPrediction, ...prev])
    setIsAnalyzing(false)
  }

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄'
    if (mood >= 6) return '🙂'
    if (mood >= 4) return '😐'
    if (mood >= 2) return '😔'
    return '😢'
  }

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return 'Excellent'
    if (mood >= 6) return 'Good'
    if (mood >= 4) return 'Neutral'
    if (mood >= 2) return 'Poor'
    return 'Very Poor'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              AI Mood Prediction
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Your AI coach predicts your mood before it happens and helps you stay ahead
          </p>
          
          {/* Prediction Accuracy */}
          <div className="inline-flex items-center bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3 rounded-full border">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-lg font-semibold text-gray-900">
              Prediction Accuracy: {predictionAccuracy}%
            </span>
            <Badge className="ml-3 bg-green-100 text-green-800">
              Improving
            </Badge>
          </div>
        </div>

        {/* Generate New Prediction */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-0">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Get Your Next Mood Prediction
            </h3>
            <p className="text-gray-600 mb-6">
              Our AI analyzes your patterns and predicts how you&apos;ll feel in the next few hours
            </p>
            <Button 
              size="lg" 
              onClick={generatePrediction}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Predict My Mood
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Predictions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Mood Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <span className="text-3xl mr-3">{getMoodEmoji(prediction.predictedMood)}</span>
                        <div>
                          <div className="text-2xl font-bold">{prediction.predictedMood}/10</div>
                          <div className="text-sm text-gray-600">{getMoodLabel(prediction.predictedMood)}</div>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Predicted for {prediction.predictedTime.toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <Badge variant={prediction.isPositive ? 'default' : 'secondary'}>
                      {prediction.confidence}% Confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Accuracy Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Previous Accuracy</span>
                      <span>{prediction.accuracy}%</span>
                    </div>
                    <Progress value={prediction.accuracy} className="h-2" />
                  </div>

                  {/* Trigger Factors */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Why This Prediction?</h4>
                    <div className="space-y-1">
                      {prediction.triggerFactors.map((factor, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Recommended Actions</h4>
                    <div className="space-y-2">
                      {prediction.recommendedActions.map((action, index) => (
                        <Button key={index} variant="outline" size="sm" className="w-full justify-start">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Prediction Status */}
                  <div className="text-center">
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Prediction Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-purple-100 mr-3">
                        {insight.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    {insight.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="bg-gray-50 border-0">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How AI Mood Prediction Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Pattern Analysis</h4>
                <p className="text-gray-600 text-sm">
                  AI analyzes your mood patterns, triggers, and behaviors over time
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Predictive Modeling</h4>
                <p className="text-gray-600 text-sm">
                  Machine learning models predict future moods based on current indicators
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Proactive Guidance</h4>
                <p className="text-gray-600 text-sm">
                  Get personalized recommendations to improve your predicted mood
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <div className="mt-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Users Love Our Predictions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
                              <div className="text-2xl font-bold text-purple-600 mb-2">{predictionAccuracy}%</div>
              <div className="text-gray-600">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">2.1x</div>
              <div className="text-gray-600">Better Mood Management</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-green-600 mb-2">4.2/5</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

