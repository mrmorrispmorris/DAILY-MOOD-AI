'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star, Target, Users, Zap, Crown, Gift, TrendingUp, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'daily' | 'weekly' | 'monthly' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  maxProgress: number
  unlocked: boolean
  reward: string
  xpReward: number
  unlockedAt?: Date
}

interface UserStats {
  level: number
  xp: number
  xpToNext: number
  totalAchievements: number
  streak: number
  rank: string
  points: number
}

const achievements: Achievement[] = [
  // Daily Achievements
  {
    id: 'daily_mood',
    name: 'Daily Mood Master',
    description: 'Log your mood for 7 consecutive days',
    icon: '📅',
    category: 'daily',
    rarity: 'common',
    progress: 5,
    maxProgress: 7,
    unlocked: false,
    reward: '50 XP + Daily Badge',
    xpReward: 50
  },
  {
    id: 'daily_insight',
    name: 'Insight Seeker',
    description: 'Generate 3 AI insights in one day',
    icon: '🧠',
    category: 'daily',
    rarity: 'rare',
    progress: 2,
    maxProgress: 3,
    unlocked: false,
    reward: '100 XP + Insight Badge',
    xpReward: 100
  },
  
  // Weekly Achievements
  {
    id: 'weekly_streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day mood streak',
    icon: '🔥',
    category: 'weekly',
    rarity: 'epic',
    progress: 7,
    maxProgress: 7,
    unlocked: true,
    reward: '500 XP + Streak Badge',
    xpReward: 500,
    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'weekly_challenge',
    name: 'Challenge Champion',
    description: 'Complete 3 weekly challenges',
    icon: '🏆',
    category: 'weekly',
    rarity: 'rare',
    progress: 1,
    maxProgress: 3,
    unlocked: false,
    reward: '300 XP + Challenge Badge',
    xpReward: 300
  },
  
  // Monthly Achievements
  {
    id: 'monthly_consistency',
    name: 'Consistency King',
    description: 'Log mood for 30 consecutive days',
    icon: '👑',
    category: 'monthly',
    rarity: 'legendary',
    progress: 15,
    maxProgress: 30,
    unlocked: false,
    reward: '2000 XP + Crown Badge + Pro Plan 1 Month',
    xpReward: 2000
  },
  {
    id: 'monthly_insights',
    name: 'Insight Master',
    description: 'Generate 100 AI insights in a month',
    icon: '🌟',
    category: 'monthly',
    rarity: 'epic',
    progress: 67,
    maxProgress: 100,
    unlocked: false,
    reward: '1000 XP + Master Badge',
    xpReward: 1000
  },
  
  // Special Achievements
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Invite 10 friends to DailyMood AI',
    icon: '🦋',
    category: 'special',
    rarity: 'legendary',
    progress: 3,
    maxProgress: 10,
    unlocked: false,
    reward: '5000 XP + Social Badge + Premium Features',
    xpReward: 5000
  },
  {
    id: 'wellness_guru',
    name: 'Wellness Guru',
    description: 'Maintain positive mood for 14 consecutive days',
    icon: '🧘',
    category: 'special',
    rarity: 'epic',
    progress: 8,
    maxProgress: 14,
    unlocked: false,
    reward: '1500 XP + Guru Badge',
    xpReward: 1500
  }
]

export default function AchievementSystem() {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 12,
    xp: 2840,
    xpToNext: 160,
    totalAchievements: 3,
    streak: 15,
    rank: 'Silver',
    points: 2840
  })

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily': return 'bg-green-100 text-green-800'
      case 'weekly': return 'bg-blue-100 text-blue-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      case 'special': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-yellow-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Achievement System
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Unlock achievements, earn rewards, and climb the leaderboards
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">Level {userStats.level}</div>
              <div className="text-sm text-gray-600">Current Level</div>
              <Progress value={(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100} className="mt-2" />
              <div className="text-xs text-gray-500 mt-1">{userStats.xpToNext} XP to next level</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.totalAchievements}</div>
              <div className="text-sm text-gray-600">Achievements Unlocked</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.streak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.rank}</div>
              <div className="text-sm text-gray-600">Current Rank</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            size="sm"
          >
            All ({achievements.length})
          </Button>
          <Button
            variant={selectedCategory === 'daily' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('daily')}
            size="sm"
          >
            Daily ({achievements.filter(a => a.category === 'daily').length})
          </Button>
          <Button
            variant={selectedCategory === 'weekly' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('weekly')}
            size="sm"
          >
            Weekly ({achievements.filter(a => a.category === 'weekly').length})
          </Button>
          <Button
            variant={selectedCategory === 'monthly' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('monthly')}
            size="sm"
          >
            Monthly ({achievements.filter(a => a.category === 'monthly').length})
          </Button>
          <Button
            variant={selectedCategory === 'special' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('special')}
            size="sm"
          >
            Special ({achievements.filter(a => a.category === 'special').length})
          </Button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAchievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`relative transition-all duration-300 ${
                achievement.unlocked 
                  ? 'ring-2 ring-green-500 shadow-lg scale-105' 
                  : 'hover:shadow-lg hover:scale-105'
              }`}
            >
              {achievement.unlocked && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Unlocked
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-3">{achievement.icon}</div>
                <CardTitle className="text-lg">{achievement.name}</CardTitle>
                <CardDescription className="text-sm">{achievement.description}</CardDescription>
                
                <div className="flex justify-center gap-2 mt-3">
                  <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                    {achievement.category}
                  </Badge>
                  <Badge className={getRarityColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {!achievement.unlocked && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                  </div>
                )}
                
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    Reward: {achievement.reward}
                  </div>
                  <div className="text-xs text-gray-600">
                    +{achievement.xpReward} XP
                  </div>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-green-600">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round((unlockedAchievements.length / achievements.length) * 100)}%</span>
                  </div>
                  <Progress value={(unlockedAchievements.length / achievements.length) * 100} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{unlockedAchievements.length}</div>
                    <div className="text-sm text-gray-600">Unlocked</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{lockedAchievements.length}</div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-purple-600" />
                Next Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements
                  .filter(a => !a.unlocked)
                  .sort((a, b) => (a.progress / a.maxProgress) - (b.progress / b.maxProgress))
                  .slice(0, 3)
                  .map((achievement) => (
                    <div key={achievement.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{achievement.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{achievement.name}</div>
                          <div className="text-xs text-gray-600">
                            {achievement.progress}/{achievement.maxProgress}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 text-center">
          <CardContent className="p-8">
            <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Unlock More Achievements?
            </h3>
            <p className="text-xl text-gray-600 mb-6">
              Keep tracking your mood, complete challenges, and watch your achievements grow!
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                View Leaderboard
              </Button>
              <Button size="lg" variant="outline">
                Daily Challenges
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

