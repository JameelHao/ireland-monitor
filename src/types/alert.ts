// Alert keyword entity stored in localStorage.
export interface AlertKeyword {
  id: string;
  keyword: string;
  createdAt: string;
  enabled: boolean;
}

// Alert preference payload persisted for client-side subscriptions.
export interface AlertPreference {
  keywords: AlertKeyword[];
  notifySound: boolean;
  notifyBrowser: boolean;
}

export const ALERT_KEYWORD_LIMIT = 20;

export const DEFAULT_ALERT_PREFERENCE: AlertPreference = {
  keywords: [],
  notifySound: true,
  notifyBrowser: true,
};
