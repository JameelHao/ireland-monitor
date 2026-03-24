/**
 * Push Notification Types
 *
 * Data structures for PWA push notification subscriptions.
 */

/**
 * Push subscription from browser
 */
export interface PushSubscriptionData {
  /** Push endpoint URL */
  endpoint: string;
  /** Expiration time (if set) */
  expirationTime?: number | null;
  /** Keys for encryption */
  keys: {
    /** p256dh public key */
    p256dh: string;
    /** Auth secret */
    auth: string;
  };
}

/**
 * Stored push subscription
 */
export interface StoredPushSubscription {
  /** Unique subscription ID */
  id: string;
  /** User ID (optional) */
  userId?: string;
  /** Push endpoint */
  endpoint: string;
  /** Encryption keys */
  keys: {
    p256dh: string;
    auth: string;
  };
  /** When subscribed */
  subscribedAt: string;
  /** Last notification sent */
  lastNotificationAt?: string;
  /** Is subscription active */
  isActive: boolean;
  /** User agent info */
  userAgent?: string;
}

/**
 * Push notification payload
 */
export interface PushNotificationPayload {
  /** Notification title */
  title: string;
  /** Notification body text */
  body: string;
  /** URL to open on click */
  url?: string;
  /** Notification tag for grouping */
  tag?: string;
  /** Icon URL */
  icon?: string;
  /** Badge icon URL */
  badge?: string;
  /** Custom data */
  data?: Record<string, unknown>;
}

/**
 * Subscribe request
 */
export interface PushSubscribeRequest {
  /** Browser push subscription */
  subscription: PushSubscriptionData;
  /** Optional user identifier */
  userId?: string;
}

/**
 * Unsubscribe request
 */
export interface PushUnsubscribeRequest {
  /** Push endpoint to unsubscribe */
  endpoint: string;
}

/**
 * Push API response
 */
export interface PushResponse {
  success: boolean;
  subscriptionId?: string;
  error?: string;
}

// Constants
export const PUSH_LIMITS = {
  /** Maximum subscriptions per user */
  MAX_SUBSCRIPTIONS_PER_USER: 5,
  /** Notification rate limit (per hour) */
  MAX_NOTIFICATIONS_PER_HOUR: 10,
  /** Subscription TTL if inactive (30 days) */
  SUBSCRIPTION_TTL_DAYS: 30,
};

/**
 * VAPID configuration (public key only - private key in env)
 */
export const VAPID_CONFIG = {
  /** VAPID public key (can be exposed to client) */
  publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  /** Subject (mailto or URL) */
  subject: 'mailto:push@irishtech.daily',
};
