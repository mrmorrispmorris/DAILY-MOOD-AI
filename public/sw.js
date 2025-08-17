const CACHE_NAME = 'dailymood-v1.0.0'
const urlsToCache = [
  '/',
  '/dashboard',
  '/log-mood',
  '/insights',
  '/profile',
  '/pricing',
  '/static/css/app.css',
  '/icon.svg',
  '/manifest.json'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((response) => {
            // Cache new responses for future offline use
            if (response.status === 200) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone)
                })
            }
            return response
          })
          .catch(() => {
            // Return offline page when network fails
            if (event.request.destination === 'document') {
              return caches.match('/')
            }
          })
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time to log your mood!',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'log-mood',
        title: 'Log Mood',
        icon: '/icon.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon.svg'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('DailyMood AI', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'log-mood') {
    event.waitUntil(
      clients.openWindow('/log-mood')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    // Default action - open dashboard
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline mood entries
      syncOfflineData()
    )
  }
})

async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB or localStorage
    const offlineData = await getOfflineData()
    
    if (offlineData.length > 0) {
      // Sync with backend
      await syncWithBackend(offlineData)
      
      // Clear offline data after successful sync
      await clearOfflineData()
      
      // Show success notification
      self.registration.showNotification('DailyMood AI', {
        body: 'Your offline data has been synced!',
        icon: '/icon.svg'
      })
    }
  } catch (error) {
    console.error('Background sync failed:', error)
    
    // Show error notification
    self.registration.showNotification('DailyMood AI', {
      body: 'Failed to sync offline data. Will retry later.',
      icon: '/icon.svg'
    })
  }
}

async function getOfflineData() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return []
}

async function syncWithBackend(data) {
  // This would typically make API calls to sync data
  // For now, just simulate success
  return Promise.resolve()
}

async function clearOfflineData() {
  // This would typically clear IndexedDB
  // For now, just return success
  return Promise.resolve()
}