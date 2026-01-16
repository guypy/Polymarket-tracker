import { useState, useEffect, useRef } from 'react'
import { UserProfile } from '../types'
import { searchUsers } from '../api/polymarket'

interface Props {
  onAddUser: (input: string) => void
  isLoading: boolean
  error: string | null
}

export default function AddUserForm({ onAddUser, isLoading, error }: Props) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'no-results' | 'error'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const trimmedInput = input.trim()

    // Don't search if it looks like an address or is too short
    if (trimmedInput.startsWith('0x') || trimmedInput.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      setSearchStatus('idle')
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      setSearchStatus('searching')
      try {
        const results = await searchUsers(trimmedInput)
        setSuggestions(results)
        if (results.length > 0) {
          setShowSuggestions(true)
          setSearchStatus('idle')
        } else {
          setShowSuggestions(true)
          setSearchStatus('no-results')
        }
        setSelectedIndex(-1)
      } catch (err) {
        console.error('Search error:', err)
        setSuggestions([])
        setSearchStatus('error')
        setShowSuggestions(true)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [input])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onAddUser(input.trim())
      setInput('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (profile: UserProfile) => {
    onAddUser(profile.address)
    setInput('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Enter wallet address or username..."
          className="w-full bg-poly-card border border-poly-border rounded-2xl px-4 py-4 pr-14 text-white placeholder-gray-500 focus:border-poly-accent transition-colors"
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-poly-accent to-poly-purple flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          {isLoading || isSearching ? (
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

        {/* Search suggestions dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-poly-card border border-poly-border rounded-2xl overflow-hidden shadow-xl animate-fade-in"
          >
            {searchStatus === 'no-results' && (
              <div className="p-4 text-center text-gray-400">
                <p className="text-sm">No users found for "{input}"</p>
                <p className="text-xs mt-1 text-gray-500">Try a wallet address instead</p>
              </div>
            )}
            {searchStatus === 'error' && (
              <div className="p-4 text-center text-poly-red">
                <p className="text-sm">Search failed</p>
                <p className="text-xs mt-1 text-gray-500">Try entering a wallet address directly</p>
              </div>
            )}
            {suggestions.map((profile, index) => {
              const displayName = profile.name || profile.pseudonym || 'Unknown'
              const initials = displayName.slice(0, 2).toUpperCase()

              return (
                <button
                  key={profile.address}
                  type="button"
                  onClick={() => handleSelectSuggestion(profile)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-poly-accent/20'
                      : 'hover:bg-poly-darker'
                  } ${index !== suggestions.length - 1 ? 'border-b border-poly-border/50' : ''}`}
                >
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-poly-purple to-poly-pink flex items-center justify-center text-white text-sm font-bold">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {profile.address.slice(0, 8)}...{profile.address.slice(-6)}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )
            })}
          </div>
        )}
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
