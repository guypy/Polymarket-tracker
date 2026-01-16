import express from 'express'
import cors from 'cors'
import webpush from 'web-push'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage (replace with database in production)
interface Subscription {
  id: string
  subscription: webpush.PushSubscription
  trackedUsers: string[]
  lastActivity: Record<string, string>
}

const subscriptions: Map<string, Subscription> = new Map()
const userActivityCache: Map<string, any[]> = new Map()

// VAPID keys for web push (generate new ones for production)
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAf7-fGe-q4XE3tXYCY2DWr7_DZrRk0'

webpush.setVapidDetails(
  'mailto:admin@pmtracker.app',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

// API Routes

// Get VAPID public key for push subscription
app.get('/api/vapid-public-key', (_, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY })
})

// Subscribe to push notifications
app.post('/api/subscribe', (req, res) => {
  const { subscription, trackedUsers } = req.body

  if (!subscription) {
    return res.status(400).json({ error: 'Subscription is required' })
  }

  const id = Buffer.from(JSON.stringify(subscription.keys)).toString('base64').slice(0, 32)

  subscriptions.set(id, {
    id,
    subscription,
    trackedUsers: trackedUsers || [],
    lastActivity: {}
  })

  console.log(`New subscription: ${id}, tracking ${trackedUsers?.length || 0} users`)

  res.json({ success: true, id })
})

// Update tracked users for a subscription
app.put('/api/subscribe/:id', (req, res) => {
  const { id } = req.params
  const { trackedUsers } = req.body

  const sub = subscriptions.get(id)
  if (!sub) {
    return res.status(404).json({ error: 'Subscription not found' })
  }

  sub.trackedUsers = trackedUsers || []
  subscriptions.set(id, sub)

  res.json({ success: true })
})

// Unsubscribe from push notifications
app.delete('/api/subscribe/:id', (req, res) => {
  const { id } = req.params
  subscriptions.delete(id)
  res.json({ success: true })
})

// Proxy endpoint for Polymarket API (to avoid CORS issues)
app.get('/api/polymarket/activity/:address', async (req, res) => {
  const { address } = req.params
  const { limit = '50' } = req.query

  try {
    const response = await fetch(
      `https://data-api.polymarket.com/activity?user=${address}&limit=${limit}`
    )

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching Polymarket activity:', error)
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

app.get('/api/polymarket/profile/:address', async (req, res) => {
  const { address } = req.params

  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/public-profile?address=${address}`
    )

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching Polymarket profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

app.get('/api/polymarket/search', async (req, res) => {
  const { query } = req.query

  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/search?query=${encodeURIComponent(query as string)}&type=profiles&limit=5`
    )

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error searching Polymarket:', error)
    res.status(500).json({ error: 'Failed to search' })
  }
})

// Health check
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    subscriptions: subscriptions.size,
    uptime: process.uptime()
  })
})

// Background job: Check for new activity and send notifications
async function checkActivityAndNotify() {
  console.log(`[${new Date().toISOString()}] Checking activity for ${subscriptions.size} subscriptions`)

  for (const [id, sub] of subscriptions) {
    for (const userAddress of sub.trackedUsers) {
      try {
        const response = await fetch(
          `https://data-api.polymarket.com/activity?user=${userAddress}&limit=10`
        )

        if (!response.ok) continue

        const activities = await response.json()

        if (activities.length === 0) continue

        const latestActivity = activities[0]
        const lastKnownActivity = sub.lastActivity[userAddress]

        // Check if there's new activity
        if (lastKnownActivity !== latestActivity.transactionHash) {
          sub.lastActivity[userAddress] = latestActivity.transactionHash

          // Send push notification
          const userName = latestActivity.name || latestActivity.pseudonym || userAddress.slice(0, 8)
          const action = latestActivity.side === 'BUY' ? 'bought' : latestActivity.side === 'SELL' ? 'sold' : latestActivity.type?.toLowerCase()
          const amount = parseFloat(latestActivity.usdcSize || '0').toFixed(2)
          const market = latestActivity.title || 'Unknown Market'

          try {
            await webpush.sendNotification(
              sub.subscription,
              JSON.stringify({
                title: `${userName} ${action}`,
                body: `$${amount} on "${market}"`,
                icon: latestActivity.profileImage || '/pwa-192x192.png',
                data: {
                  url: `https://polymarket.com/event/${latestActivity.eventSlug || ''}`
                }
              })
            )
            console.log(`Notification sent for ${userName}'s activity`)
          } catch (pushError: any) {
            if (pushError.statusCode === 410 || pushError.statusCode === 404) {
              // Subscription is no longer valid
              console.log(`Removing invalid subscription: ${id}`)
              subscriptions.delete(id)
            }
          }
        }
      } catch (error) {
        console.error(`Error checking activity for ${userAddress}:`, error)
      }
    }
  }
}

// Start background job every 2 minutes
setInterval(checkActivityAndNotify, 2 * 60 * 1000)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')))

  app.get('*', (_, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'))
  })
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`VAPID Public Key: ${VAPID_PUBLIC_KEY}`)
})

export default app
