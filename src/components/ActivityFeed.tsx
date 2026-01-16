import { Activity } from '../types'
import ActivityItem from './ActivityItem'

interface Props {
  activities: Activity[]
}

export default function ActivityFeed({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-poly-card flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-400 mb-1">No activity yet</h3>
        <p className="text-sm text-gray-600">
          Activity from tracked users will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={`${activity.transactionHash}-${activity.timestamp}`}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <ActivityItem activity={activity} />
        </div>
      ))}
    </div>
  )
}
