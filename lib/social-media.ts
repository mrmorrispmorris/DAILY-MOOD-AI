export const socialTemplates = {
  twitter: {
    educational: [
      "Did you know? Tracking your mood for just 2 weeks can reveal patterns you never noticed. Start your mental wellness journey today 🧠 #MentalHealth #MoodTracking",
      "AI insight: 73% of our users discover their mood improves on days they exercise. What patterns will you discover? 📊 #Wellness #AIHealth",
      "Mental health tip: Rating your mood daily increases emotional awareness by 40% (study link). Try it free: [link] 💜 #MentalHealthMatters",
      "🧵 Thread: 5 signs you should start mood tracking:\n1. Feeling emotional ups and downs\n2. Stress affecting daily life\n3. Want to understand triggers\n4. Working on self-improvement\n5. Need data-driven insights",
      "Research shows: People who track their mood are 25% less likely to experience prolonged depression episodes. Start today → [link] #MentalHealthResearch"
    ],
    engagement: [
      "What's one thing that always improves your mood? Share below! 👇 #MoodBooster #Community",
      "Poll: What time of day do you usually feel your best?\n⭐ Morning\n☀️ Afternoon\n🌙 Evening\n🦉 Night",
      "Complete the sentence: 'My mental health improved when I started ___' 💭",
      "Quick question: How many of you track your mood regularly? 🤔 Reply with 🙋‍♀️ if you do, 🤷‍♀️ if you don't!",
      "Sunday reset vibes ✨ What's one small step you're taking this week for your mental wellness?"
    ],
    promotional: [
      "New to mood tracking? Start with DailyMood AI's free 14-day trial. No credit card needed. Link in bio 🚀 #MoodTracking #MentalWellness",
      "Your emotions have patterns. Our AI helps you discover them. Start free → [link] 🧠✨ #AI #MentalHealth",
      "4.9⭐ rating from 10,000+ users can't be wrong. Try DailyMood AI free for 14 days → [link]",
      "Stop guessing about your mental health. Get AI-powered insights that actually help. Free trial → [link] 🎯"
    ]
  },
  
  instagram: {
    carousel: [
      {
        title: "5 Signs You Should Track Your Mood",
        slides: [
          "1. You feel emotional ups and downs",
          "2. Stress affects your daily life", 
          "3. You want to understand triggers",
          "4. You're working on self-improvement",
          "5. You want data-driven insights"
        ]
      },
      {
        title: "Mood Tracking vs Therapy: What's Better?",
        slides: [
          "Both have their place in mental wellness",
          "Mood tracking: Daily self-awareness",
          "Therapy: Professional guidance",
          "Combined: Maximum impact",
          "Start tracking today to enhance your therapy"
        ]
      },
      {
        title: "How AI Transforms Mental Health",
        slides: [
          "Traditional: Manual mood journaling",
          "AI-Powered: Automatic pattern detection",
          "Insights: Predictive mood forecasting",
          "Personal: Customized recommendations",
          "Future: Proactive mental wellness"
        ]
      }
    ],
    
    reels: [
      "POV: You finally understand what triggers your anxiety after 30 days of mood tracking",
      "That moment when AI shows you've been happiest on Tuesdays all month 🤔",
      "Me: *rates mood as 3/10* \nAI: 'Based on patterns, try going for a walk' \nMe: *actually feels better* \nAI: 😎",
      "When your mood tracking app reminds you to check in and you realize you haven't thought about your mental health all day ✨"
    ],
    
    stories: [
      {
        type: "poll",
        content: "Do you track your mood daily?",
        options: ["Yes, religiously! 📊", "Sometimes 🤷‍♀️"]
      },
      {
        type: "question", 
        content: "What's your biggest mental health challenge right now?"
      },
      {
        type: "tip",
        content: "💡 Daily tip: Your mood at 3pm often predicts your evening. Track it to see patterns!"
      }
    ]
  },
  
  linkedin: {
    professional: [
      "Workplace mental health matters. Our data shows employees who track their mood report 32% higher job satisfaction. Here's why companies should care about emotional wellness... [article link]",
      "New research: AI-powered mood tracking can predict burnout 3 weeks before it happens. Learn how we're helping professionals maintain work-life balance. [case study link]",
      "The future of employee wellness isn't just gym memberships and free snacks. It's understanding emotional patterns and providing personalized mental health support. Thoughts?",
      "I've been tracking my mood for 90 days. Here's what I learned about productivity, stress, and work-life balance: [detailed post with insights]"
    ],
    
    thoughtLeadership: [
      "The intersection of AI and mental health is creating unprecedented opportunities for scalable, personalized wellness solutions. Here's where the industry is heading...",
      "Why every HR team should consider digital mental wellness tools: 1) Early intervention 2) Reduced healthcare costs 3) Higher retention 4) Better productivity",
      "Mental health stigma in the workplace is decreasing, but are we providing the right tools? Here's what forward-thinking companies are implementing..."
    ],
    
    companyUpdates: [
      "Exciting milestone: DailyMood AI has helped 10,000+ professionals better understand their mental wellness patterns. Here's what we've learned...",
      "Behind the scenes: How we built AI that can detect mood patterns with 94% accuracy while maintaining complete user privacy.",
      "Proud to announce our partnership with [Company] to provide mental wellness tools to their 5,000+ employees. Mental health at work matters."
    ]
  },
  
  tiktok: {
    trending: [
      "POV: You discover you're always sad on Sundays because that's when you meal prep",
      "Rating my mood tracking apps (DailyMood AI vs others)",
      "Things my mood tracker taught me about myself (part 1)",
      "Me explaining to my therapist how an app knows me better than I know myself"
    ],
    
    educational: [
      "3 mood tracking mistakes everyone makes (and how to avoid them)",
      "Why your mood dips at 3pm every day (scientific explanation)",
      "How to read your mood patterns like a pro",
      "The psychology behind why tracking works"
    ]
  }
}

export function generateSocialPost(platform: string, type: string) {
  const templates = socialTemplates[platform]?.[type] || []
  return templates[Math.floor(Math.random() * templates.length)]
}

export const contentCalendar = {
  themes: {
    monday: { theme: 'Motivation Monday', focus: 'Weekly goals & inspiration' },
    tuesday: { theme: 'Tip Tuesday', focus: 'Mental health tips' },
    wednesday: { theme: 'Wellness Wednesday', focus: 'Self-care practices' },
    thursday: { theme: 'Thoughtful Thursday', focus: 'Reflection & gratitude' },
    friday: { theme: 'Feature Friday', focus: 'App features & updates' },
    saturday: { theme: 'Success Saturday', focus: 'User stories' },
    sunday: { theme: 'Sunday Reset', focus: 'Week planning' }
  },
  
  generateWeeklyPosts() {
    const posts = []
    const startDate = new Date()
    
    Object.entries(this.themes).forEach(([day, theme], index) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + index)
      
      posts.push({
        date: date.toISOString().split('T')[0],
        platform: 'twitter',
        type: 'educational',
        content: `${(theme as any).theme}: ${(theme as any).focus}`,
        hashtags: ['MentalHealth', 'MoodTracking', 'Wellness']
      })
      
      posts.push({
        date: date.toISOString().split('T')[0],
        platform: 'instagram',
        type: 'story',
        content: `${(theme as any).theme} story about ${(theme as any).focus}`,
        hashtags: ['MentalHealthMatters', 'SelfCare']
      })
    })
    
    return posts
  }
}

export const hashtagLibrary = {
  mentalHealth: [
    '#MentalHealth', '#MentalHealthMatters', '#MentalWellness', 
    '#EmotionalHealth', '#MentalHealthAwareness', '#SelfCare'
  ],
  moodTracking: [
    '#MoodTracking', '#MoodJournal', '#EmotionalWellness',
    '#MoodPatterns', '#WellnessJourney', '#MindfulnessMatters'
  ],
  ai: [
    '#AI', '#ArtificialIntelligence', '#HealthTech', 
    '#DigitalHealth', '#MentalHealthTech', '#WellnessTech'
  ],
  motivation: [
    '#Motivation', '#Inspiration', '#PersonalGrowth',
    '#SelfImprovement', '#MindsetMatters', '#PositiveVibes'
  ]
}

export function addHashtags(content: string, category: keyof typeof hashtagLibrary) {
  const tags = hashtagLibrary[category].slice(0, 3).join(' ')
  return `${content} ${tags}`
}


