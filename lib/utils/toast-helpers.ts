import toast from 'react-hot-toast'

// Pre-configured toast helpers for consistent UX
export const toastHelpers = {
  // Success toasts
  success: {
    moodSaved: () => toast.success('Mood saved successfully!', {
      duration: 3000,
      icon: '🎉'
    }),
    
    accountCreated: () => toast.success('Account created! Check your email for verification.', {
      duration: 5000,
      icon: '✉️'
    }),
    
    subscriptionActive: () => toast.success('Welcome to Premium! 🎉', {
      duration: 4000,
      icon: '💎'
    }),
    
    dataExported: () => toast.success('Data exported successfully!', {
      duration: 3000,
      icon: '📊'
    }),
    
    settingsSaved: () => toast.success('Settings saved!', {
      duration: 2000,
      icon: '⚙️'
    })
  },

  // Error toasts
  error: {
    loginRequired: () => toast.error('Please login first', {
      duration: 4000,
      icon: '🔒'
    }),
    
    saveFailed: (item = 'data') => toast.error(`Failed to save ${item}. Please try again.`, {
      duration: 5000,
      icon: '❌'
    }),
    
    loadFailed: (item = 'data') => toast.error(`Failed to load ${item}. Please refresh the page.`, {
      duration: 5000,
      icon: '⚠️'
    }),
    
    networkError: () => toast.error('Network error. Please check your connection.', {
      duration: 6000,
      icon: '🌐'
    }),
    
    premiumRequired: () => toast.error('This feature requires a Premium subscription', {
      duration: 4000,
      icon: '💎'
    }),
    
    validationError: (message: string) => toast.error(message, {
      duration: 4000,
      icon: '⚠️'
    })
  },

  // Loading toasts
  loading: {
    saving: (item = 'data') => toast.loading(`Saving ${item}...`, {
      icon: '💾'
    }),
    
    loading: (item = 'content') => toast.loading(`Loading ${item}...`, {
      icon: '⏳'
    }),
    
    processing: () => toast.loading('Processing...', {
      icon: '⚙️'
    })
  },

  // Info toasts
  info: {
    welcome: (name?: string) => toast(
      `Welcome ${name ? name : 'back'}! 👋`,
      {
        duration: 3000,
        icon: '👋',
        style: {
          background: '#8B5CF6',
          color: '#fff',
        },
      }
    ),
    
    streakMilestone: (days: number) => toast(
      `🔥 Amazing! You've maintained your streak for ${days} days!`,
      {
        duration: 4000,
        icon: '🔥',
        style: {
          background: '#F59E0B',
          color: '#fff',
        },
      }
    ),
    
    newFeature: (feature: string) => toast(
      `✨ New feature: ${feature}`,
      {
        duration: 5000,
        icon: '✨',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      }
    )
  },

  // Custom toast
  custom: (message: string, options?: any) => toast(message, {
    duration: 3000,
    ...options
  }),

  // Dismiss all toasts
  dismiss: () => toast.dismiss(),

  // Promise-based toasts for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => toast.promise(promise, messages)
}

export default toastHelpers
