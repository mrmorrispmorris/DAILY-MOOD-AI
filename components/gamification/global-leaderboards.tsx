'use client'

import { useState, useEffect } from 'react'
import { Trophy, Crown, Star, Medal, TrendingUp, Users, Target, Zap, Globe, Award, Flame, Sparkles, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface LeaderboardEntry {
  id: string
  rank: number
  username: string
  avatar: string
  country: string
  points: number
  level: number
  achievements: number
  streak: number
  moodConsistency: number
  lastActive: Date
  isCurrentUser: boolean
  isPremium: boolean
  badge: string
}

interface LeaderboardCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  entries: LeaderboardEntry[]
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'allTime'
}



const leaderboardCategories: LeaderboardCategory[] = [
  {
    id: 'overall',
    name: 'Overall Rankings',
    description: 'Top performers across all metrics',
    icon: <Trophy className="h-5 w-5" />,
    entries: [],
    timeFrame: 'allTime'
  },
  {
    id: 'weekly',
    name: 'Weekly Champions',
    description: 'This week\'s top performers',
    icon: <Star className="h-5 w-5" />,
    entries: [],
    timeFrame: 'weekly'
  },
  {
    id: 'streaks',
    name: 'Streak Masters',
    description: 'Longest active streaks',
    icon: <Flame className="h-5 w-5" />,
    entries: [],
    timeFrame: 'allTime'
  },
  {
    id: 'consistency',
    name: 'Mood Consistency',
    description: 'Most consistent mood trackers',
    icon: <Target className="h-5 w-5" />,
    entries: [],
    timeFrame: 'monthly'
  }
]

export default function GlobalLeaderboards() {
  const [selectedCategory, setSelectedCategory] = useState('overall')
  const [currentUserRank, setCurrentUserRank] = useState(6)
  const [userStats, setUserStats] = useState({
    globalRank: 0, // Will be updated when leaderboards are implemented
    totalParticipants: 0,
    points: 0,
    level: 1,
    moodConsistency: 0
  })

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      case 4: return '⭐'
      case 5: return '🔥'
      default: return '🎯'
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200'
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200'
      case 4: return 'bg-blue-100 text-blue-800 border-blue-200'
      case 5: return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getCurrentCategory = () => {
    return leaderboardCategories.find(cat => cat.id === selectedCategory) || leaderboardCategories[0]
  }

  const shareAchievement = () => {
    const text = `I'm ranked #${currentUserRank} on DailyMood AI! 🏆 Join me and track your mood with AI insights! #DailyMoodAI #MentalHealth #MoodTracking`
    
    if (navigator.share) {
      navigator.share({
        title: 'My DailyMood AI Ranking',
        text: text,
        url: window.location.href
      })
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(text)
      alert('Achievement copied to clipboard! Share it on social media!')
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-yellow-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Global Leaderboards
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Compete with users worldwide and climb the rankings
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">{userStats.totalParticipants.toLocaleString()}</div>
              <div className="text-sm text-yellow-700">Global Participants</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-blue-900">{userStats.globalRank}</div>
              <div className="text-sm text-blue-700">Countries</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">89%</div>
              <div className="text-sm text-green-700">Active Users</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">2.4M</div>
              <div className="text-sm text-purple-700">Mood Entries</div>
            </CardContent>
          </Card>
        </div>

        {/* Current User Status */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Current Ranking</h3>
                  <p className="text-gray-600">Keep tracking to climb higher!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">#{userStats.globalRank}</div>
                <div className="text-sm text-gray-600">out of {userStats.totalParticipants.toLocaleString()}</div>
                <Button onClick={shareAchievement} className="mt-2" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Share Achievement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            {leaderboardCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {leaderboardCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {category.icon}
                    <span>{category.name}</span>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {category.entries.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No Leaderboard Data</h3>
                      <p className="text-sm">Start tracking your mood to appear on the leaderboards!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {category.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                            entry.isCurrentUser 
                              ? 'ring-2 ring-primary bg-primary/5' 
                              : 'hover:bg-gray-50'
                          } ${getRankColor(entry.rank)}`}
                        >
                          {/* Rank */}
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-gray-900 w-12 text-center">
                              {getRankBadge(entry.rank)} {entry.rank}
                            </div>
                            
                            {/* Avatar & User Info */}
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={entry.avatar} />
                                <AvatarFallback className="bg-primary text-white">
                                  {entry.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">
                                    {entry.username}
                                    {entry.isCurrentUser && (
                                      <Badge className="ml-2 bg-primary text-white">You</Badge>
                                    )}
                                  </span>
                                  <span className="text-lg">{entry.country}</span>
                                  {entry.isPremium && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Level {entry.level} • {entry.achievements} achievements
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{entry.points.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">Points</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{entry.streak}</div>
                              <div className="text-xs text-gray-600">Day Streak</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{entry.moodConsistency}%</div>
                              <div className="text-xs text-gray-600">Consistency</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* How to Climb */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How to Climb the Leaderboards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Track Daily</h4>
                <p className="text-sm text-gray-600">Log your mood every day to build streaks and earn points</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Complete Challenges</h4>
                <p className="text-sm text-gray-600">Finish daily and weekly challenges for bonus points</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Invite Friends</h4>
                <p className="text-sm text-gray-600">Get referral bonuses and compete with friends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-0 text-center">
          <CardContent className="p-8">
            <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Dominate the Rankings?
            </h3>
            <p className="text-xl text-gray-600 mb-6">
              Start tracking your mood daily and climb to the top!
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                Start Tracking
              </Button>
              <Button size="lg" variant="outline">
                View Challenges
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
