export interface TrackedUser {
  id: string;
  address: string;
  name?: string;
  pseudonym?: string;
  profileImage?: string;
  addedAt: number;
  lastActivityAt?: number;
  lastActivityId?: string;
}

export interface Activity {
  id: string;
  proxyWallet: string;
  timestamp: number;
  conditionId: string;
  type: 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM' | 'REWARD' | 'CONVERSION';
  size: string;
  usdcSize: string;
  price?: string;
  transactionHash: string;
  side?: 'BUY' | 'SELL';
  outcomeIndex?: number;
  title?: string;
  slug?: string;
  icon?: string;
  eventSlug?: string;
  outcome?: string;
  name?: string;
  pseudonym?: string;
  profileImage?: string;
}

export interface UserProfile {
  address: string;
  proxyWallet: string;
  name?: string;
  pseudonym?: string;
  bio?: string;
  profileImage?: string;
  profileImageOptimized?: string;
  xUsername?: string;
  verifiedBadge?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  subscription?: PushSubscription;
}

export interface AppState {
  trackedUsers: TrackedUser[];
  activities: Activity[];
  isMonitoring: boolean;
  lastChecked?: number;
  notificationSettings: NotificationSettings;
}
