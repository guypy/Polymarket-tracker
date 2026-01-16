import { formatTimeAgo } from '../utils/format'

interface Props {
  isMonitoring: boolean
  lastChecked?: number
  isLoading: boolean
  trackedUsersCount: number
  onToggleMonitoring: () => void
  onRefresh: () => void
}

export default function StatusBar({
  isMonitoring,
  lastChecked,
  isLoading,
  trackedUsersCount,
  onToggleMonitoring,
  onRefresh,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass safe-bottom">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring && trackedUsersCount > 0 ? 'bg-poly-green animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-400">
              {isMonitoring && trackedUsersCount > 0
                ? `Monitoring ${trackedUsersCount} user${trackedUsersCount !== 1 ? 's' : ''}`
                : 'Paused'
              }
            </span>
          </div>

          {/* Last checked */}
          {lastChecked && (
            <span className="text-xs text-gray-500">
              Updated {formatTimeAgo(lastChecked)}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={isLoading || trackedUsersCount === 0}
              className="w-10 h-10 rounded-xl bg-poly-card border border-poly-border flex items-center justify-center text-gray-400 hover:text-white hover:border-poly-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg
                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Toggle monitoring */}
            <button
              onClick={onToggleMonitoring}
              disabled={trackedUsersCount === 0}
              className={`px-4 h-10 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isMonitoring
                  ? 'bg-poly-red/20 text-poly-red border border-poly-red/30 hover:bg-poly-red/30'
                  : 'bg-poly-accent text-poly-dark hover:bg-poly-accent-dark'
              }`}
            >
              {isMonitoring ? 'Pause' : 'Start'}
            </button>
          </div>
        </div>

        {/* Progress bar for next check */}
        {isMonitoring && trackedUsersCount > 0 && (
          <div className="mt-2 h-1 bg-poly-darker rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-poly-accent to-poly-purple rounded-full"
              style={{
                animation: 'progress 120s linear infinite',
              }}
            />
            <style>{`
              @keyframes progress {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}
