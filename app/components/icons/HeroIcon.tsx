import { forwardRef } from 'react'

interface HeroIconProps {
  icon: React.ForwardRefExoticComponent<any>
  className?: string
  strokeWidth?: number
}

export const HeroIcon = forwardRef<SVGSVGElement, HeroIconProps>(
  ({ icon: Icon, className = "w-6 h-6", strokeWidth = 1.5 }, ref) => {
    return <Icon ref={ref} className={className} strokeWidth={strokeWidth} />
  }
)

HeroIcon.displayName = 'HeroIcon'

