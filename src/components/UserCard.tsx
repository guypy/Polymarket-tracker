import { useState } from 'react'
import { TrackedUser, Activity } from '../types'
import { formatTimeAgo, formatUSD } from '../utils/format'
import { fetchUserActivity } from '../api/polymarket'

interface Props {
  user: TrackedUser
  onRemove: () => void
}

export default function UserCard({ user, onRemove }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = user.name || user.pseudonym || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleToggleExpand = async () => {
    if (!isExpanded && recentActivities.length === 0) {
      // Fetch activities when expanding for the first time
      setIsLoading(true)
      setError(null)
      try {
        const activities = await fetchUserActivity(user.address, 5)
        setRecentActivities(activities)
      } catch (err) {
        setError('Failed to load activities')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    setIsExpanded(!isExpanded)
  }

  const getActivityTypeInfo = (type: string, side?: string) => {
    if (type === 'TRADE') {
      if (side === 'BUY') {
        return { label: 'Bought', color: 'text-poly-green', bg: 'bg-poly-green/10', icon: '↗' }
      }
      return { label: 'Sold', color: 'text-poly-red', bg: 'bg-poly-red/10', icon: '↘' }
    }
    switch (type) {
      case 'REDEEM':
        return { label: 'Redeemed', color: 'text-poly-orange', bg: 'bg-poly-orange/10', icon: '✓' }
      case 'REWARD':
        return { label: 'Reward', color: 'text-poly-purple', bg: 'bg-poly-purple/10', icon: '★' }
      case 'SPLIT':
        return { label: 'Split', color: 'text-poly-blue', bg: 'bg-poly-blue/10', icon: '⟁' }
      case 'MERGE':
        return { label: 'Merged', color: 'text-poly-pink', bg: 'bg-poly-pink/10', icon: '⟐' }
      default:
        return { label: type, color: 'text-gray-400', bg: 'bg-gray-400/10', icon: '•' }
    }
  }

  return (
    <div className="bg-poly-card border border-poly-border rounded-2xl overflow-hidden card-hover">
      {/* Main card content - clickable */}
      <div
        className="p-4 cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-poly-accent/30"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-poly-purple to-poly-pink flex items-center justify-center text-white font-bold">
              {initials}
            </div>
          )}

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{displayName}</h3>
            <p className="text-xs text-gray-500 font-mono truncate">
              {user.address.slice(0, 10)}...{user.address.slice(-8)}
            </p>
            {user.lastActivityAt && (
              <p className="text-xs text-poly-accent mt-1">
                Last active: {formatTimeAgo(user.lastActivityAt)}
              </p>
            )}
          </div>

          {/* Expand indicator */}
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="w-10 h-10 rounded-xl bg-poly-darker flex items-center justify-center text-gray-500 hover:text-poly-red hover:bg-poly-red/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-poly-border/50">
          <div className="w-2 h-2 rounded-full bg-poly-green animate-pulse" />
          <span className="text-xs text-gray-500">Monitoring active</span>
          <span className="text-xs text-gray-600 ml-auto">
            Added {formatTimeAgo(user.addedAt)}
          </span>
        </div>
      </div>

      {/* Expanded section - Recent Activities */}
      {isExpanded && (
        <div className="border-t border-poly-border bg-poly-darker/50 p-4 animate-fade-in">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Activity</h4>

          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-4 text-poly-red text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && recentActivities.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent activity found
            </div>
          )}

          {!isLoading && !error && recentActivities.length > 0 && (
            <div className="space-y-2">
              {recentActivities.map((activity, index) => {
                const typeInfo = getActivityTypeInfo(activity.type, activity.side)
                const usdAmount = formatUSD(parseFloat(activity.usdcSize || '0'))
                const marketTitle = activity.title || 'Unknown Market'

                return (
                  <div
                    key={activity.id || index}
                    className="bg-poly-card rounded-xl p-3 border border-poly-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color} ${typeInfo.bg}`}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      <span className={`text-sm font-bold font-mono ${typeInfo.color}`}>
                        {usdAmount}
                      </span>
                    </div>
                    <p className="text-sm text-white line-clamp-1 mb-1">{marketTitle}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp * 1000)}
                      </span>
                      {activity.price && (
                        <span className="text-xs text-gray-500">
                          @ {(parseFloat(activity.price) * 100).toFixed(1)}¢
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* View on Polymarket link */}
          <a
            href={`https://polymarket.com/profile/${user.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 text-sm text-poly-accent hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View full profile on Polymarket
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}
