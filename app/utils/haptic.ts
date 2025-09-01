export class HapticFeedback {
  private static canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

  // Light tap feedback
  static light() {
    if (this.canVibrate) {
      navigator.vibrate(10)
    }
  }

  // Medium tap feedback
  static medium() {
    if (this.canVibrate) {
      navigator.vibrate(20)
    }
  }

  // Strong tap feedback
  static heavy() {
    if (this.canVibrate) {
      navigator.vibrate(30)
    }
  }

  // Success pattern
  static success() {
    if (this.canVibrate) {
      navigator.vibrate([10, 10, 10, 10, 20])
    }
  }

  // Error pattern
  static error() {
    if (this.canVibrate) {
      navigator.vibrate([30, 10, 30])
    }
  }

  // Warning pattern
  static warning() {
    if (this.canVibrate) {
      navigator.vibrate([15, 5, 15])
    }
  }

  // Selection changed
  static selection() {
    if (this.canVibrate) {
      navigator.vibrate(5)
    }
  }
}

