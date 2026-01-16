import { useState } from 'react'

interface Props {
  onAddUser: (input: string) => void
  isLoading: boolean
  error: string | null
}

export default function AddUserForm({ onAddUser, isLoading, error }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onAddUser(input.trim())
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter wallet address or username..."
          className="w-full bg-poly-card border border-poly-border rounded-2xl px-4 py-4 pr-14 text-white placeholder-gray-500 focus:border-poly-accent transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-poly-accent to-poly-purple flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-poly-red animate-fade-in">{error}</p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Add Polymarket users by wallet address (0x...) or search by username
      </p>
    </form>
  )
}
