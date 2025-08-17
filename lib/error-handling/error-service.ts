import { toast } from 'sonner'

export class ErrorService {
  private static instance: ErrorService
  private errors: Array<{ id: string; message: string; timestamp: Date; severity: 'low' | 'medium' | 'high' }> = []

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  static handleError(error: any, context: string = 'Application') {
    const message = error?.message || error?.toString() || 'An unexpected error occurred'
    console.error(`[${context}] Error:`, error)
    
    // Show user-friendly error message
    toast.error(message)
    
    // Log error for debugging
    ErrorService.getInstance().logError(`${context}: ${message}`, 'medium')
  }

  static showError(error: any, context: string = 'Application') {
    this.handleError(error, context)
  }

  static showSuccess(message: string) {
    toast.success(message)
  }

  static showInfo(message: string) {
    toast.info(message)
  }

  static showWarning(message: string) {
    toast.warning(message)
  }

  logError(message: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    const error = {
      id: `error-${Date.now()}`,
      message,
      timestamp: new Date(),
      severity
    }
    
    this.errors.push(error)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${severity.toUpperCase()}] ${message}`)
    }
    
    // In production, you might want to send to an error tracking service
    // like Sentry, LogRocket, etc.
  }

  getErrors() {
    return [...this.errors]
  }

  clearErrors() {
    this.errors = []
  }

  getErrorsBySeverity(severity: 'low' | 'medium' | 'high') {
    return this.errors.filter(error => error.severity === severity)
  }
}