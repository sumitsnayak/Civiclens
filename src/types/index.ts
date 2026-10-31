export type ReportCategory = 
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'water_leakage'
  | 'drainage'
  | 'infrastructure'
  | 'other';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus = 
  | 'reported'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  id: string;
  display_name: string;
  email?: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}

export interface ReportUpdate {
  id: string;
  report_id: string;
  actor_id?: string;
  actor_name?: string;
  previous_status?: ReportStatus;
  new_status: ReportStatus;
  public_message?: string;
  internal_note?: string; // Visible only to administrators
  created_at: string;
}

export interface Report {
  id: string;
  reference_code: string;
  user_id?: string;
  author_name?: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  image_path: string;
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  ai_category?: ReportCategory;
  ai_explanation?: string;
  ai_confidence?: number;
  duplicate_of?: string;
  upvotes_count: number;
  has_upvoted?: boolean;
  priority_score?: number; // Calculated civic priority score
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  updates?: ReportUpdate[];
}

export interface AIVisionResult {
  category: ReportCategory;
  severity: ReportSeverity;
  explanation: string;
  confidence: number;
  detected_elements: string[];
  suggested_title: string;
}

export interface CivicStats {
  total: number;
  reported: number;
  under_review: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  critical_count: number;
  avg_resolution_days: number;
  category_distribution: Record<ReportCategory, number>;
  severity_distribution: Record<ReportSeverity, number>;
  timeline_data: { date: string; submitted: number; resolved: number }[];
}

export interface ReportFilterOptions {
  searchQuery?: string;
  category?: ReportCategory | 'all';
  severity?: ReportSeverity | 'all';
  status?: ReportStatus | 'all';
  sortBy?: 'newest' | 'oldest' | 'highest_priority' | 'most_upvoted';
}

export interface CitizenQuery {
  id: string;
  ticket_reference?: string;
  author_name: string;
  category: ReportCategory | 'general';
  question: string;
  details?: string;
  status: 'answered' | 'pending' | 'escalated';
  response?: string;
  responder_name?: string;
  created_at: string;
  upvotes: number;
}

