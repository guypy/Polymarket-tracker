import { useState, useEffect, useCallback } from 'react'
import { TrackedUser, Activity, NotificationSettings } from './types'
import Header from './components/Header'
import AddUserForm from './components/AddUserForm'
import TrackedUsersList from './components/TrackedUsersList'
import ActivityFeed from './components/ActivityFeed'
import NotificationBanner from './components/NotificationBanner'
import StatusBar from './components/StatusBar'
import { fetchUserActivity, fetchUserProfile } from './api/polymarket'
import { requestNotificationPermission, showNotification, initializePushSubscription } from './utils/notifications'
import { loadState, saveState } from './utils/storage'

const POLLING_INTERVAL = 2 * 60 * 1000 // 2 minutes

function App() {
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastChecked, setLastChecked] = useState<number | undefined>()
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users')
  const [error, setError] = useState<string | null>(null)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = loadState()
    if (savedState) {
      setTrackedUsers(savedState.trackedUsers || [])
      setActivities(savedState.activities || [])
      setIsMonitoring(savedState.isMonitoring || false)
      setLastChecked(savedState.lastChecked)
      setNotificationSettings(savedState.notificationSettings || { enabled: false })
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState({
      trackedUsers,
      activities,
      isMonitoring,
      lastChecked,
      notificationSettings,
    })
  }, [trackedUsers, activities, isMonitoring, lastChecked, notificationSettings])

  const checkForNewActivity = useCallback(async () => {
    if (trackedUsers.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const allNewActivities: Activity[] = []

      for (const user of trackedUsers) {
        try {
          const userActivities = await fetchUserActivity(user.address)

          // Filter for activities newer than the last check
          const newActivities = userActivities.filter((activity: Activity) => {
            const activityTime = activity.timestamp * 1000
            return !user.lastActivityId || activity.id !== user.lastActivityId
          })

          if (newActivities.length > 0) {
            // Update user's last activity
            const latestActivity = newActivities[0]
            setTrackedUsers(prev =>
              prev.map(u =>
                u.id === user.id
                  ? {
                      ...u,
                      lastActivityAt: latestActivity.timestamp * 1000,
                      lastActivityId: latestActivity.id
                    }
                  : u
              )
            )

            // Add user info to activities
            const activitiesWithUser = newActivities.map((a: Activity) => ({
              ...a,
              name: user.name || user.pseudonym || user.address.slice(0, 8),
              profileImage: user.profileImage,
            }))

            allNewActivities.push(...activitiesWithUser)

            // Show notification for each new activity
            if (notificationSettings.enabled) {
              for (const activity of newActivities.slice(0, 3)) {
                const userName = user.name || user.pseudonym || user.address.slice(0, 8)
                const actionText = activity.side === 'BUY' ? 'bought' : activity.side === 'SELL' ? 'sold' : activity.type.toLowerCase()
                const title = activity.title || 'Unknown Market'
                showNotification(
                  `${userName} ${actionText}`,
                  `$${parseFloat(activity.usdcSize).toFixed(2)} on "${title}"`
                )
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching activity for ${user.address}:`, err)
        }
      }

      if (allNewActivities.length > 0) {
        setActivities(prev => {
          const combined = [...allNewActivities, ...prev]
          // Keep only the latest 100 activities
          return combined.slice(0, 100)
        })
      }

      setLastChecked(Date.now())
    } catch (err) {
      setError('Failed to fetch activity. Will retry...')
      console.error('Error checking activity:', err)
    } finally {
      setIsLoading(false)
    }
  }, [trackedUsers, notificationSettings.enabled])

  // Set up polling interval
  useEffect(() => {
    if (!isMonitoring || trackedUsers.length === 0) return

    // Check immediately when starting
    checkForNewActivity()

    const interval = setInterval(checkForNewActivity, POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [isMonitoring, checkForNewActivity, trackedUsers.length])

  const handleAddUser = async (input: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let address = input.trim()

      // Check if it's a valid address format
      if (!address.startsWith('0x')) {
        setError('Please enter a valid wallet address (0x...)')
        return
      }

      // Check if already tracking
      if (trackedUsers.some(u => u.address.toLowerCase() === address.toLowerCase())) {
        setError('User is already being tracked')
        return
      }

      // Fetch profile info
      const profile = await fetchUserProfile(address)

      // Fetch initial activity to establish baseline (prevents notification spam)
      let lastActivityId: string | undefined
      let lastActivityAt: number | undefined
      try {
        const initialActivities = await fetchUserActivity(address)
        if (initialActivities.length > 0) {
          lastActivityId = initialActivities[0].id
          lastActivityAt = initialActivities[0].timestamp * 1000
        }
      } catch (err) {
        console.log('Could not fetch initial activity, will start fresh')
      }

      const newUser: TrackedUser = {
        id: `${address}-${Date.now()}`,
        address,
        name: profile?.name,
        pseudonym: profile?.pseudonym,
        profileImage: profile?.profileImage || profile?.profileImageOptimized,
        addedAt: Date.now(),
        lastActivityId,  // Set baseline so we don't notify for old activities
        lastActivityAt,
      }

      setTrackedUsers(prev => [...prev, newUser])

      // Start monitoring if not already
      if (!isMonitoring) {
        setIsMonitoring(true)
      }
    } catch (err) {
      setError('Could not find user. Please check the address.')
      console.error('Error adding user:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveUser = (userId: string) => {
    setTrackedUsers(prev => prev.filter(u => u.id !== userId))
    // Also remove their activities
    const user = trackedUsers.find(u => u.id === userId)
    if (user) {
      setActivities(prev => prev.filter(a =>
        a.proxyWallet?.toLowerCase() !== user.address.toLowerCase()
      ))
    }
  }

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      const subscription = await initializePushSubscription()
      setNotificationSettings({
        enabled: true,
        subscription: subscription || undefined,
      })
    }
  }

  const handleToggleMonitoring = () => {
    setIsMonitoring(prev => !prev)
  }

  const handleRefresh = () => {
    checkForNewActivity()
  }

  return (
    <div className="min-h-screen bg-poly-dark">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-radial from-poly-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern bg-[size:50px_50px] pointer-events-none opacity-30" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pb-20 safe-top">
        <Header />

        <NotificationBanner
          notificationsEnabled={notificationSettings.enabled}
          onEnableNotifications={handleEnableNotifications}
        />

        <AddUserForm
          onAddUser={handleAddUser}
          isLoading={isLoading}
          error={error}
        />

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-poly-accent text-poly-dark'
                : 'bg-poly-card text-gray-400 hover:text-white'
            }`}
          >
            Users ({trackedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all relative ${
              activeTab === 'activity'
                ? 'bg-poly-accent text-poly-dark'
                : 'bg-poly-card text-gray-400 hover:text-white'
            }`}
          >
            Activity
            {activities.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-poly-purple rounded-full text-xs flex items-center justify-center text-white notification-pulse">
                {activities.length > 99 ? '99+' : activities.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'users' ? (
            <TrackedUsersList
              users={trackedUsers}
              onRemoveUser={handleRemoveUser}
            />
          ) : (
            <ActivityFeed activities={activities} />
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        isMonitoring={isMonitoring}
        lastChecked={lastChecked}
        isLoading={isLoading}
        trackedUsersCount={trackedUsers.length}
        onToggleMonitoring={handleToggleMonitoring}
        onRefresh={handleRefresh}
      />
    </div>
  )
}

export default App
