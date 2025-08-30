export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      
      {/* Modern AI Chip/Circuit Design */}
      {/* Main rounded square container */}
      <rect
        x="8" y="8" width="32" height="32" 
        rx="8" ry="8"
        fill="url(#logoGradient)"
        fillOpacity="0.1"
        stroke="url(#logoGradient)"
        strokeWidth="2"
      />
      
      {/* Central AI core - hexagonal */}
      <polygon
        points="24,16 28,19 28,25 24,28 20,25 20,19"
        fill="url(#logoGradient)"
        opacity="0.9"
      />
      
      {/* Mood indicators around the core - representing emotions */}
      <circle cx="16" cy="16" r="2" fill="#10B981" opacity="0.8">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="16" r="2" fill="#F59E0B" opacity="0.8">
        <animate attributeName="r" values="2;1.5;2" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="16" cy="32" r="2" fill="#8B5CF6" opacity="0.8">
        <animate attributeName="r" values="1.8;2.2;1.8" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="32" cy="32" r="2" fill="#EF4444" opacity="0.8">
        <animate attributeName="r" values="2.2;1.8;2.2" dur="3s" repeatCount="indefinite"/>
      </circle>
      
      {/* Circuit connections - clean lines */}
      <path
        d="M24 16 L24 12 M24 32 L24 36 M16 24 L12 24 M32 24 L36 24"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Data flow indicators */}
      <rect x="22" y="20" width="4" height="4" rx="1" fill="url(#moodGradient)" opacity="0.7">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
      </rect>
      
      {/* Modern accent dots */}
      <circle cx="14" cy="24" r="1" fill="#3B82F6" opacity="0.5"/>
      <circle cx="34" cy="24" r="1" fill="#06B6D4" opacity="0.5"/>
      <circle cx="24" cy="14" r="1" fill="#8B5CF6" opacity="0.5"/>
      <circle cx="24" cy="34" r="1" fill="#3B82F6" opacity="0.5"/>
    </svg>
  )
}

export function LogoWithText({ className = "", size = "normal" }: { 
  className?: string
  size?: "small" | "normal" | "large" 
}) {
  const logoSize = size === "small" ? "h-8 w-8" : size === "large" ? "h-16 w-16" : "h-12 w-12"
  const textSize = size === "small" ? "text-lg" : size === "large" ? "text-3xl" : "text-2xl"
  const subtextSize = size === "small" ? "text-xs" : size === "large" ? "text-sm" : "text-xs"
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo className={logoSize} />
      <div className="flex flex-col">
        <span className={`font-bold ${textSize} text-purple-600`}>
          DailyMood
        </span>
        <span className={`${subtextSize} text-gray-500 -mt-1 tracking-wide`}>
          AI-Powered Analytics
        </span>
      </div>
    </div>
  )
}

export function LogoIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      
      {/* Simplified version for small use */}
      <circle cx="24" cy="24" r="18" fill="url(#iconGradient)" opacity="0.1"/>
      <circle cx="24" cy="24" r="18" stroke="url(#iconGradient)" strokeWidth="2" fill="none"/>
      
      {/* Central brain node */}
      <circle cx="24" cy="24" r="4" fill="url(#iconGradient)"/>
      
      {/* Surrounding nodes */}
      <circle cx="18" cy="18" r="2" fill="url(#iconGradient)" opacity="0.8"/>
      <circle cx="30" cy="18" r="2" fill="url(#iconGradient)" opacity="0.8"/>
      <circle cx="18" cy="30" r="2" fill="url(#iconGradient)" opacity="0.8"/>
      <circle cx="30" cy="30" r="2" fill="url(#iconGradient)" opacity="0.8"/>
    </svg>
  )
}