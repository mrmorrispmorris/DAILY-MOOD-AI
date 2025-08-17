'use client'

import { useState, useEffect } from 'react'
import { Share2, Trophy, Users, TrendingUp, Award, Target, Calendar, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
  reward: string
}

interface Challenge {
  id: string
  name: string
  description: string
  participants: number
  daysLeft: number
  progress: number
  reward: string
  category: string
}

interface SocialStats {
  totalFriends: number
  moodStreak: number
  achievementsUnlocked: number
  communityRank: string
  influenceScore: number
}

const achievements: Achievement[] = [] // No mock data - will use real data from database

const challenges: Challenge[] = [] // No mock data - will use real data from database

export default function ViralFeatures() {
  const [socialStats, setSocialStats] = useState<SocialStats>({
    totalFriends: 0, // No mock data - will use real data
    moodStreak: 0,
    achievementsUnlocked: 0,
    communityRank: 'Bronze',
    influenceScore: 0
  })

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  const shareMood = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My DailyMood AI Journey',
          text: 'I\'m tracking my mood and improving my mental health with DailyMood AI! Join me on this journey.',
          url: 'https://dailymood-ai.vercel.app'
        })
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText('https://dailymood-ai.vercel.app')
        alert('Link copied to clipboard! Share it with your friends.')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const inviteFriends = () => {
    const referralLink = `https://dailymood-ai.vercel.app?ref=${socialStats.influenceScore}`
    navigator.clipboard.writeText(referralLink)
    alert('Referral link copied! Share it with friends to earn rewards.')
  }

  const joinChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    // In production, this would add user to challenge
    console.log(`Joined challenge: ${challenge.name}`)
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join the DailyMood AI Community
          </h2>
          <p className="text-xl text-gray-600">
            Connect with friends, earn achievements, and take on challenges together
          </p>
        </div>

        {/* Social Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{socialStats.totalFriends}</div>
              <div className="text-sm text-gray-600">Friends</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{socialStats.moodStreak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{socialStats.achievementsUnlocked}</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{socialStats.communityRank}</div>
              <div className="text-sm text-gray-600">Rank</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{socialStats.influenceScore}</div>
              <div className="text-sm text-gray-600">Influence</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={shareMood}>
            <CardContent className="p-6 text-center">
              <Share2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Share Your Journey</h3>
              <p className="text-gray-600 mb-4">
                Share your mood tracking progress and inspire others
              </p>
              <Button className="w-full">Share Now</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={inviteFriends}>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
              <p className="text-gray-600 mb-4">
                Get rewards for every friend who joins DailyMood AI
              </p>
              <Button className="w-full" variant="outline">Invite Friends</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Set Goals</h3>
              <p className="text-gray-600 mb-4">
                Create personal wellness goals and track progress
              </p>
              <Button className="w-full" variant="outline">Create Goal</Button>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.unlocked ? 'ring-2 ring-green-500' : ''}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold mb-2">{achievement.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  {!achievement.unlocked && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                    </div>
                  )}
                  
                  <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                    {achievement.unlocked ? 'Unlocked!' : 'In Progress'}
                  </Badge>
                  
                  {achievement.unlocked && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      Reward: {achievement.reward}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Challenges */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Community Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{challenge.name}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{challenge.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Participants</span>
                      <span className="font-medium">{challenge.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Days Left</span>
                      <span className="font-medium">{challenge.daysLeft}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Progress</span>
                      <span className="font-medium">{challenge.progress}%</span>
                    </div>
                  </div>
                  
                  <Progress value={challenge.progress} className="mb-4" />
                  
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium mb-2">
                      Reward: {challenge.reward}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => joinChallenge(challenge)}
                    >
                      Join Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Community Leaders</h3>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-500">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No Leaderboard Data</h3>
                <p className="text-sm">Start tracking your mood to appear on the leaderboards!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Program */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0">
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Share the Love, Earn Rewards!
            </h3>
            <p className="text-xl text-gray-600 mb-6">
              Every friend you invite gets 1 month free, and you get rewards too!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">1 Month Free</div>
                <div className="text-gray-600">For every friend who joins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Pro Plan</div>
                <div className="text-gray-600">Upgrade for free with referrals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">Exclusive Badges</div>
                <div className="text-gray-600">Unlock special achievements</div>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Start Inviting Friends
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


