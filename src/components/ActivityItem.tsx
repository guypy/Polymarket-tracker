import { Activity } from '../types'
import { formatTimeAgo, formatUSD } from '../utils/format'

interface Props {
  activity: Activity
}

export default function ActivityItem({ activity }: Props) {
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

  const typeInfo = getActivityTypeInfo(activity.type, activity.side)
  const displayName = activity.name || activity.pseudonym || activity.proxyWallet?.slice(0, 8)
  const marketTitle = activity.title || 'Unknown Market'
  const usdAmount = formatUSD(parseFloat(activity.usdcSize || '0'))

  return (
    <div className="bg-poly-card border border-poly-border rounded-2xl p-4 card-hover">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {activity.profileImage ? (
          <img
            src={activity.profileImage}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-poly-accent to-poly-purple flex items-center justify-center text-white text-sm font-bold">
            {displayName?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate">{displayName}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color} ${typeInfo.bg}`}>
              {typeInfo.icon} {typeInfo.label}
            </span>
          </div>
          <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp * 1000)}</p>
        </div>
        <span className={`text-lg font-bold font-mono ${typeInfo.color}`}>
          {usdAmount}
        </span>
      </div>

      {/* Market Info */}
      <div className="flex items-center gap-3 p-3 bg-poly-darker rounded-xl">
        {activity.icon && (
          <img
            src={activity.icon}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium line-clamp-2">{marketTitle}</p>
          {activity.outcome && (
            <p className="text-xs text-poly-accent mt-1">
              Position: {activity.outcome}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-poly-border/50">
        {activity.price && (
          <span className="text-xs text-gray-500">
            @ {(parseFloat(activity.price) * 100).toFixed(1)}¢
          </span>
        )}
        <a
          href={`https://polygonscan.com/tx/${activity.transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-poly-accent hover:underline flex items-center gap-1"
        >
          View tx
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
