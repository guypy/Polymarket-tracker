import { TrackedUser } from '../types'
import { formatTimeAgo } from '../utils/format'

interface Props {
  user: TrackedUser
  onRemove: () => void
}

export default function UserCard({ user, onRemove }: Props) {
  const displayName = user.name || user.pseudonym || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="bg-poly-card border border-poly-border rounded-2xl p-4 card-hover">
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

        {/* Remove Button */}
        <button
          onClick={onRemove}
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
  )
}
