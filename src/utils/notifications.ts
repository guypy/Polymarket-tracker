export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    console.log('Notifications are blocked')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function showNotification(title: string, body: string, icon?: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  try {
    // Try to use service worker notification for better mobile support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: icon || '/pwa-192x192.png',
          badge: '/favicon.svg',
          vibrate: [100, 50, 100],
          tag: `pm-activity-${Date.now()}`,
          renotify: true,
          requireInteraction: false,
          data: {
            url: window.location.href,
          },
        })
      })
    } else {
      // Fallback to regular notification
      new Notification(title, {
        body,
        icon: icon || '/pwa-192x192.png',
        tag: `pm-activity-${Date.now()}`,
      })
    }
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

export async function initializePushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // For demo purposes, we'll use local notifications only
      // In production, you'd subscribe to a push server
      console.log('Using local notifications (no push server configured)')
    }

    return subscription
  } catch (error) {
    console.error('Error initializing push subscription:', error)
    return null
  }
}

// Request persistent storage for the PWA
export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    const persistent = await navigator.storage.persist()
    return persistent
  }
  return false
}
