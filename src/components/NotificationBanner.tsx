interface Props {
  notificationsEnabled: boolean
  onEnableNotifications: () => void
}

export default function NotificationBanner({ notificationsEnabled, onEnableNotifications }: Props) {
  if (notificationsEnabled) {
    return null
  }

  // Check if notifications are supported
  if (!('Notification' in window)) {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-poly-purple/20 to-poly-accent/20 border border-poly-purple/30 rounded-2xl animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-poly-purple/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-poly-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Enable Notifications</h3>
          <p className="text-sm text-gray-400 mb-3">
            Get instant alerts when tracked users make trades or other activity.
          </p>
          <button
            onClick={onEnableNotifications}
            className="px-4 py-2 bg-poly-purple hover:bg-poly-purple/80 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Enable Push Notifications
          </button>
        </div>
      </div>
    </div>
  )
}
