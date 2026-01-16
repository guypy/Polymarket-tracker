import { Activity, UserProfile } from '../types'

const DATA_API_BASE = 'https://data-api.polymarket.com'
const GAMMA_API_BASE = 'https://gamma-api.polymarket.com'

export async function fetchUserActivity(address: string, limit = 50): Promise<Activity[]> {
  const url = `${DATA_API_BASE}/activity?user=${address}&limit=${limit}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch activity: ${response.status}`)
  }

  const data = await response.json()

  // Map response to our Activity type and add unique IDs
  return data.map((item: any) => ({
    id: `${item.transactionHash}-${item.timestamp}-${item.conditionId}`,
    proxyWallet: item.proxyWallet || address,
    timestamp: item.timestamp,
    conditionId: item.conditionId,
    type: item.type,
    size: item.size,
    usdcSize: item.usdcSize,
    price: item.price,
    transactionHash: item.transactionHash,
    side: item.side,
    outcomeIndex: item.outcomeIndex,
    title: item.title,
    slug: item.slug,
    icon: item.icon,
    eventSlug: item.eventSlug,
    outcome: item.outcome,
    name: item.name,
    pseudonym: item.pseudonym,
    profileImage: item.profileImage || item.profileImageOptimized,
  }))
}

export async function fetchUserProfile(address: string): Promise<UserProfile | null> {
  try {
    const url = `${GAMMA_API_BASE}/public-profile?address=${address}`

    const response = await fetch(url)

    if (!response.ok) {
      // Profile might not exist, return minimal info
      return {
        address,
        proxyWallet: address,
      }
    }

    const data = await response.json()

    return {
      address: data.userAddress || address,
      proxyWallet: data.proxyWallet || address,
      name: data.name,
      pseudonym: data.pseudonym,
      bio: data.bio,
      profileImage: data.profileImage,
      profileImageOptimized: data.profileImageOptimized,
      xUsername: data.xUsername,
      verifiedBadge: data.verifiedBadge,
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return {
      address,
      proxyWallet: address,
    }
  }
}

export async function searchUser(query: string): Promise<UserProfile | null> {
  try {
    // Try to search via the search endpoint
    const url = `${GAMMA_API_BASE}/search?query=${encodeURIComponent(query)}&type=profiles&limit=5`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const data = await response.json()

    // Find matching profile
    const profiles = data.profiles || []

    if (profiles.length === 0) {
      return null
    }

    // Return the first matching profile
    const profile = profiles[0]

    return {
      address: profile.proxyWallet || profile.address || profile.id,
      proxyWallet: profile.proxyWallet || profile.address || profile.id,
      name: profile.name,
      pseudonym: profile.pseudonym,
      bio: profile.bio,
      profileImage: profile.profileImage,
      profileImageOptimized: profile.profileImageOptimized,
    }
  } catch (error) {
    console.error('Error searching user:', error)
    return null
  }
}

export async function fetchUserPositions(address: string) {
  const url = `${DATA_API_BASE}/positions?user=${address}&limit=50`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch positions: ${response.status}`)
  }

  return response.json()
}

export async function fetchUserTrades(address: string, limit = 50) {
  const url = `${DATA_API_BASE}/trades?user=${address}&limit=${limit}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch trades: ${response.status}`)
  }

  return response.json()
}
