import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReportSeverity } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CVL-${year}-${randomStr}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function timeAgo(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

/**
 * Calculates a transparent, explainable civic priority score (1 to 100)
 * based on severity weight, civic agreement/upvotes, and unresolved age.
 */
export function calculatePriorityScore(
  severity: ReportSeverity,
  upvotesCount: number,
  createdAt: string
): number {
  const severityMultiplier: Record<ReportSeverity, number> = {
    low: 20,
    medium: 40,
    high: 65,
    critical: 85,
  };

  const base = severityMultiplier[severity] || 30;
  // Each upvote adds 2 points (capped at +10)
  const upvoteBonus = Math.min(upvotesCount * 2, 10);
  
  // Stale unresolved reports gradually increase priority (up to +5)
  const daysOld = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const ageBonus = Math.min(daysOld * 0.5, 5);

  return Math.min(Math.round(base + upvoteBonus + ageBonus), 100);
}

/**
 * OpenStreetMap Nominatim reverse geocode helper
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        // Return a clean concise address
        const parts = data.display_name.split(',');
        if (parts.length >= 3) {
          return `${parts[0].trim()}, ${parts[1].trim()}, ${parts[2].trim()}`;
        }
        return data.display_name;
      }
    }
  } catch {
    // Graceful fallback on network timeout or rate limit
  }
  return `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
