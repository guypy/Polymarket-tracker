import { TrackedUser } from '../types'
import UserCard from './UserCard'

interface Props {
  users: TrackedUser[]
  onRemoveUser: (userId: string) => void
}

export default function TrackedUsersList({ users, onRemoveUser }: Props) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-poly-card flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-400 mb-1">No users tracked</h3>
        <p className="text-sm text-gray-600">
          Add Polymarket users to start monitoring their activity
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <div
          key={user.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <UserCard user={user} onRemove={() => onRemoveUser(user.id)} />
        </div>
      ))}
    </div>
  )
}
