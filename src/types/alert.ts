// Alert keyword entity stored in localStorage.
export interface AlertKeyword {
  id: string;
  keyword: string;
  createdAt: string;
  enabled: boolean;
}

export interface AlertArticle {
  id: string;
  title: string;
  url: string;
  source: string;
}

export interface AlertItem {
  id: string;
  article: AlertArticle;
  keywords: string[];
  timestamp: number;
  read: boolean;
}

// Alert preference payload persisted for client-side subscriptions.
export interface AlertPreference {
  keywords: AlertKeyword[];
  alerts: AlertItem[];
  notifySound: boolean;
  notifyBrowser: boolean;
}

export interface AlertEventDetail {
  article: AlertArticle;
  keywords: string[];
  timestamp: number;
}

export const ALERT_KEYWORD_LIMIT = 20;
export const ALERT_HISTORY_LIMIT = 100;

export const DEFAULT_ALERT_PREFERENCE: AlertPreference = {
  keywords: [],
  alerts: [],
  notifySound: true,
  notifyBrowser: true,
};
