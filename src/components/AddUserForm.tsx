import { useState } from 'react'

interface Props {
  onAddUser: (input: string) => void
  isLoading: boolean
  error: string | null
}

export default function AddUserForm({ onAddUser, isLoading, error }: Props) {
  const [input, setInput] = useState('')
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onAddUser(input.trim())
      setInput('')
      setShowHint(false)
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    // Show hint if user is typing something that doesn't look like an address
    if (value.length >= 2 && !value.startsWith('0x')) {
      setShowHint(true)
    } else {
      setShowHint(false)
    }
  }

  const isValidAddress = input.trim().startsWith('0x') && input.trim().length >= 10

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter wallet address (0x...)"
          className={`w-full bg-poly-card border rounded-2xl px-4 py-4 pr-14 text-white placeholder-gray-500 transition-colors ${
            isValidAddress ? 'border-poly-green' : 'border-poly-border focus:border-poly-accent'
          }`}
          disabled={isLoading}
          autoComplete="off"
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

      {/* Hint when user types non-address text */}
      {showHint && (
        <div className="mt-3 p-3 bg-poly-darker border border-poly-border rounded-xl animate-fade-in">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-poly-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-gray-300">Username search is not available</p>
              <p className="text-xs text-gray-500 mt-1">
                To track a user, you need their wallet address. You can find it on their Polymarket profile page.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-poly-red animate-fade-in">{error}</p>
      )}

      <div className="mt-3 p-3 bg-poly-darker/50 rounded-xl">
        <p className="text-xs text-gray-400 mb-2">How to find a wallet address:</p>
        <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
          <li>Go to the user's Polymarket profile</li>
          <li>Copy the address from the URL or profile page</li>
          <li>Paste the 0x... address here</li>
        </ol>
      </div>
    </form>
  )
}
