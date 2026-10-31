import { ReportCategory, ReportSeverity, ReportStatus } from '../types';

export const APP_CONFIG = {
  name: 'CivicLens',
  tagline: 'See a Problem. Report It. Track the Change.',
  version: '1.0.0',
  disclaimer: 'CivicLens is an independent civic technology prototype for demonstration and hackathon evaluation. It is not an official municipal or government agency application.',
  contact: {
    supportEmail: 'civiclens-prototype@example.com',
    githubRepo: 'https://github.com/example/civiclens',
  },
  defaultMapCenter: {
    lat: 37.7749,
    lng: -122.4194, // Default to metropolitan center, adapts to user location
    zoom: 13,
  },
};

export const CATEGORIES_CONFIG: Record<
  ReportCategory,
  {
    label: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    badgeBg: string;
  }
> = {
  pothole: {
    label: 'Roads & Potholes',
    description: 'Damaged asphalt, craters, cracks, and hazardous road conditions',
    icon: 'AlertTriangle',
    color: '#D97706', // amber-600
    bgColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  garbage: {
    label: 'Garbage & Dumping',
    description: 'Overflowing dumpsters, litter piles, and illegal waste dumping',
    icon: 'Trash2',
    color: '#10B981', // emerald-500
    bgColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  streetlight: {
    label: 'Broken Streetlights',
    description: 'Non-functioning street lamps, flickering lights, exposed electrical wiring',
    icon: 'LightbulbOff',
    color: '#EAB308', // yellow-500
    bgColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    badgeBg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  water_leakage: {
    label: 'Water Leakage',
    description: 'Broken water mains, leaking supply lines, wasteful bursts',
    icon: 'Droplets',
    color: '#0284C7', // sky-600
    bgColor: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  },
  drainage: {
    label: 'Drainage & Flooding',
    description: 'Clogged storm drains, stagnant water accumulation, sewer overflows',
    icon: 'Waves',
    color: '#06D6A0', // electric teal
    bgColor: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  },
  infrastructure: {
    label: 'Public Infrastructure',
    description: 'Broken sidewalks, damaged guardrails, vandalized park benches, leaning poles',
    icon: 'Building2',
    color: '#8B5CF6', // purple-500
    bgColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
  other: {
    label: 'Other Civic Issues',
    description: 'Noise violations, overgrown vegetation, visual hazards, and miscellaneous concerns',
    icon: 'HelpCircle',
    color: '#64748B', // slate-500
    bgColor: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  },
};

export const SEVERITY_CONFIG: Record<
  ReportSeverity,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    weight: number;
    description: string;
  }
> = {
  low: {
    label: 'Low',
    color: 'text-slate-600 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800/60',
    borderColor: 'border-slate-300 dark:border-slate-700',
    weight: 1,
    description: 'Minor inconvenience; no immediate safety risk',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-300 dark:border-amber-800',
    weight: 2,
    description: 'Moderate nuisance or recurring impediment to citizens',
  },
  high: {
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40',
    borderColor: 'border-orange-300 dark:border-orange-800',
    weight: 3,
    description: 'Significant public disruption or potential hazard',
  },
  critical: {
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-400 dark:border-red-800',
    weight: 4,
    description: 'Immediate threat to public safety, mobility, or sanitation',
  },
};

export const STATUS_CONFIG: Record<
  ReportStatus,
  {
    label: string;
    color: string;
    badgeClass: string;
    stepIndex: number;
    description: string;
  }
> = {
  reported: {
    label: 'Reported',
    color: '#3B82F6',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    stepIndex: 1,
    description: 'Citizen report received and waiting for preliminary review',
  },
  under_review: {
    label: 'Under Review',
    color: '#F59E0B',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    stepIndex: 2,
    description: 'Assigned to civic dispatch team; verification in progress',
  },
  in_progress: {
    label: 'In Progress',
    color: '#8B5CF6',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    stepIndex: 3,
    description: 'Maintenance crew deployed or scheduled for remediation',
  },
  resolved: {
    label: 'Resolved',
    color: '#06D6A0',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    stepIndex: 4,
    description: 'Issue has been repaired, verified, and successfully resolved',
  },
  rejected: {
    label: 'Rejected / Out of Scope',
    color: '#EF4444',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    stepIndex: -1,
    description: 'Duplicate report, private property, or outside civic jurisdiction',
  },
};

