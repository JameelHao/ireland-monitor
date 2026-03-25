/**
 * Marker Types for Rich Popup Content
 *
 * Extended marker data types supporting rich popup content display
 * with logo, company details, investment info, and related news.
 */

/**
 * Base marker interface with common fields
 */
export interface BaseMarkerData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  // Tier determines visual prominence (1 = highest)
  tier?: 1 | 2 | 3;
  // Optional extended fields for rich popup
  logo?: string;
  address?: string;
  city?: string;
  employees?: number;
  investment?: string;
  website?: string;
  description?: string;
  relatedNewsIds?: string[];
}

/**
 * Extended semiconductor hub marker
 */
export interface SemiconductorHubMarker extends BaseMarkerData {
  type: 'semiconductorHub';
  company: string;
  business: string;
}

/**
 * Extended data center marker
 */
export interface DataCenterMarker extends BaseMarkerData {
  type: 'irelandDataCenter';
  operator: string;
  location: string;
  capacity?: string;
  status: 'operational' | 'under-construction' | 'planned';
}

/**
 * Extended tech HQ marker
 */
export interface TechHQMarker extends BaseMarkerData {
  type: 'irelandTechHQ';
  company: string;
  hqType: 'emea-hq' | 'european-hq' | 'intl-hq';
  location: string;
  founded?: number;
}

/**
 * Extended unicorn company marker
 */
export interface UnicornMarker extends BaseMarkerData {
  type: 'irishUnicorn';
  category: 'unicorn' | 'high-growth' | 'emerging';
  sector: string;
  founded: number;
  valuation?: string;
  status?: string;
}

/**
 * Union type for all marker types
 */
export type MarkerData =
  | SemiconductorHubMarker
  | DataCenterMarker
  | TechHQMarker
  | UnicornMarker;

/**
 * Related news item for popup display
 */
export interface PopupNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  date: Date;
}

/**
 * Generate initials from company name for logo fallback
 */
export function getCompanyInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) {
    return (words[0] ?? '').slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map(w => (w ?? '')[0] ?? '')
    .join('')
    .toUpperCase();
}
