'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star, Target, Zap, Calendar, CheckCircle, Clock, Gift, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'

interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  category: 'mood' | 'wellness' | 'social' | 'mindfulness' | 'productivity'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  points: number
  xpReward: number
  deadline: Date
  isCompleted: boolean
  progress: number
  maxProgress: number
  reward: string
  participants: number
  globalCompletion: number
  streak: number
}

interface UserChallengeStats {
  completed: number // Will be updated when challenges are implemented
  total: number
  streak: number
  rank: string
  totalPoints: number
  level: number
}

const dailyChallenges: Challenge[] = [] // No mock data - will use real data from database

const weeklyChallenges: Challenge[] = [] // No mock data - will use real data from database

const monthlyChallenges: Challenge[] = [] // No mock data - will use real data from database

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([...dailyChallenges, ...weeklyChallenges, ...monthlyChallenges])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [userStats, setUserStats] = useState<UserChallengeStats>({
    completed: 0, // Will be updated when challenges are implemented
    total: 20,
    streak: 0,
    rank: 'Bronze',
    totalPoints: 0,
    level: 1
  })

  const updateChallengeProgress = (challengeId: string, progress: number) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        const newProgress = Math.min(progress, challenge.maxProgress)
        const isCompleted = newProgress >= challenge.maxProgress
        
        if (isCompleted && !challenge.isCompleted) {
          // Update user stats when challenge is completed
          setUserStats(prev => ({
            ...prev,
            completed: prev.completed + 1,
            totalPoints: prev.totalPoints + challenge.points,
            streak: prev.streak + 1
          }))
        }
        
        return {
          ...challenge,
          progress: newProgress,
          isCompleted,
          streak: isCompleted ? challenge.streak + 1 : challenge.streak
        }
      }
      return challenge
    }))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'expert': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mood': return 'bg-blue-100 text-blue-800'
      case 'wellness': return 'bg-green-100 text-green-800'
      case 'social': return 'bg-purple-100 text-purple-800'
      case 'mindfulness': return 'bg-indigo-100 text-indigo-800'
      case 'productivity': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredChallenges = challenges.filter(challenge => {
    if (selectedCategory !== 'all' && challenge.category !== selectedCategory) return false
    if (!showCompleted && challenge.isCompleted) return false
    return true
  })

  const activeChallenges = challenges.filter(c => !c.isCompleted)
  const completedChallenges = challenges.filter(c => c.isCompleted)

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-yellow-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Daily Challenges
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Complete challenges, earn rewards, and climb the global leaderboards
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.streak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.rank}</div>
              <div className="text-sm text-gray-600">Current Rank</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">Level {userStats.level}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              All Categories
            </Button>
            <Button
              variant={selectedCategory === 'mood' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('mood')}
              size="sm"
            >
              Mood
            </Button>
            <Button
              variant={selectedCategory === 'wellness' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('wellness')}
              size="sm"
            >
              Wellness
            </Button>
            <Button
              variant={selectedCategory === 'social' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('social')}
              size="sm"
            >
              Social
            </Button>
            <Button
              variant={selectedCategory === 'mindfulness' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('mindfulness')}
              size="sm"
            >
              Mindfulness
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            />
            <span className="text-sm text-gray-600">Show Completed</span>
          </div>
        </div>

        {/* Challenge Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{activeChallenges.filter(c => c.type === 'daily').length}</div>
              <div className="text-sm text-blue-700">Daily Challenges</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{activeChallenges.filter(c => c.type === 'weekly').length}</div>
              <div className="text-sm text-green-700">Weekly Challenges</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{activeChallenges.filter(c => c.type === 'monthly').length}</div>
              <div className="text-sm text-purple-700">Monthly Challenges</div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Grid */}
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Trophy className="h-24 w-24 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-semibold mb-3">No Challenges Available</h3>
            <p className="text-lg mb-6">Challenges will be available soon. Start tracking your mood to unlock them!</p>
            <Button size="lg" onClick={() => window.location.href = '/log-mood'}>
              <Target className="h-5 w-5 mr-2" />
              Log Your First Mood
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredChallenges.map((challenge) => (
            <Card 
              key={challenge.id} 
              className={`relative transition-all duration-300 ${
                challenge.isCompleted 
                  ? 'ring-2 ring-green-500 shadow-lg scale-105' 
                  : 'hover:shadow-lg hover:scale-105'
              }`}
            >
              {challenge.isCompleted && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getCategoryColor(challenge.category)}>
                    {challenge.category}
                  </Badge>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Due {challenge.deadline.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{challenge.participants.toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {!challenge.isCompleted && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Reward:</span>
                    <span className="text-sm text-green-600">{challenge.reward}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Points:</span>
                    <span className="text-sm text-blue-600">+{challenge.points}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Global Completion:</span>
                    <span className="text-sm text-purple-600">{challenge.globalCompletion}%</span>
                  </div>
                  
                  {challenge.streak > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Streak:</span>
                      <span className="text-sm text-orange-600">{challenge.streak} days</span>
                    </div>
                  )}
                </div>
                
                {!challenge.isCompleted && (
                  <div className="mt-4 space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => updateChallengeProgress(challenge.id, challenge.progress + 1)}
                      disabled={challenge.progress >= challenge.maxProgress}
                    >
                      {challenge.progress >= challenge.maxProgress ? 'Complete!' : 'Update Progress'}
                    </Button>
                    
                    {challenge.type === 'daily' && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => updateChallengeProgress(challenge.id, challenge.maxProgress)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 text-center">
          <CardContent className="p-8">
            <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Dominate the Leaderboards?
            </h3>
            <p className="text-xl text-gray-600 mb-6">
              Complete challenges, earn points, and compete with users worldwide!
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                View Leaderboards
              </Button>
              <Button size="lg" variant="outline">
                Invite Friends
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

