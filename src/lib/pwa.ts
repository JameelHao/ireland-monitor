/**
 * PWA Utilities
 *
 * Client-side helpers for PWA functionality:
 * - Service Worker registration
 * - Push notification subscription
 * - Install prompt handling
 */

import { VAPID_CONFIG } from '@/types/push';

/**
 * Check if running as installed PWA
 */
export function isInstalledPWA(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error - Safari specific
    window.navigator.standalone === true
  );
}

/**
 * Check if PWA installation is available
 */
export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if already installed
  if (isInstalledPWA()) return false;

  // Check if browser supports PWA
  return 'serviceWorker' in navigator;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;

  return 'PushManager' in window && 'serviceWorker' in navigator;
}

/**
 * Check push notification permission
 */
export function getPushPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission;
}

/**
 * Request push notification permission
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  return await Notification.requestPermission();
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service worker registered:', registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.unregister();
  } catch {
    return false;
  }
}

/**
 * Convert VAPID public key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  userId?: string
): Promise<{ subscriptionId: string } | null> {
  if (!isPushSupported()) {
    console.warn('[PWA] Push not supported');
    return null;
  }

  try {
    // Request permission
    const permission = await requestPushPermission();
    if (permission !== 'granted') {
      console.warn('[PWA] Push permission denied');
      return null;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();

    // Create new subscription if needed
    if (!subscription) {
      const vapidKey = urlBase64ToUint8Array(VAPID_CONFIG.publicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
    }

    // Send subscription to server
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }

    const data = await response.json();
    return { subscriptionId: data.subscriptionId };
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return true;

    // Unsubscribe from browser
    await subscription.unsubscribe();

    // Notify server
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    return true;
  } catch (error) {
    console.error('[PWA] Push unsubscription failed:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/**
 * PWA install prompt handler
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Initialize PWA install prompt capture
 */
export function initInstallPrompt(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('[PWA] Install prompt captured');
  });
}

/**
 * Check if install prompt is available
 */
export function hasInstallPrompt(): boolean {
  return deferredPrompt !== null;
}

/**
 * Trigger PWA install prompt
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) {
    return 'unavailable';
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome;
  } catch {
    return 'unavailable';
  }
}
