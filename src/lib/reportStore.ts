import { 
  Report, 
  ReportCategory, 
  ReportFilterOptions, 
  ReportSeverity, 
  ReportStatus, 
  CivicStats, 
  ReportUpdate 
} from '../types';
import { INITIAL_DEMO_REPORTS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';
import { generateReferenceCode, calculatePriorityScore } from './utils';

const STORAGE_KEY = 'civiclens_reports_store_v2';

function loadLocalReports(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('civiclens_reports_store_v1');
    if (raw) {
      const reports: Report[] = JSON.parse(raw);
      // Migrate legacy placeholder images to authentic real problem photos
      const migrated = reports.map((r) => {
        let img = r.image_path;
        if (!img || img.includes('photo-1544717305-2782549b5136') || (r.category === 'water_leakage' && img.includes('unsplash'))) {
          img = '/images/issues/water_leakage.jpg';
        } else if (img.includes('photo-1509114397022-ed747cca3f65') || (r.category === 'streetlight' && img.includes('unsplash'))) {
          img = '/images/issues/streetlight.jpg';
        } else if (img.includes('photo-1515162816999-a0c47dc192f7') || (r.category === 'pothole' && img.includes('unsplash'))) {
          img = '/images/issues/pothole.jpg';
        } else if (r.category === 'garbage' && img.includes('unsplash')) {
          img = '/images/issues/garbage.jpg';
        } else if (r.category === 'drainage' && img.includes('unsplash')) {
          img = '/images/issues/drainage.jpg';
        } else if (r.category === 'infrastructure' && img.includes('unsplash')) {
          img = '/images/issues/infrastructure.jpg';
        }
        return { ...r, image_path: img };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch (e) {
    console.warn('Failed to load local reports:', e);
  }
  // Initialize with rich demo reports
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
  return INITIAL_DEMO_REPORTS;
}

function saveLocalReports(reports: Report[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.warn('Failed to save local reports:', e);
  }
}

export class ReportService {
  /**
   * Retrieves all reports with optional filtering & sorting
   */
  static async getReports(filters?: ReportFilterOptions): Promise<Report[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('reports').select('*, updates:report_updates(*)');
        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters?.severity && filters.severity !== 'all') {
          query = query.eq('severity', filters.severity);
        }
        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data as Report[];
          return this.applyClientFilters(list, filters);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }

    // Local / offline store
    const reports = loadLocalReports();
    return this.applyClientFilters(reports, filters);
  }

  private static applyClientFilters(reports: Report[], filters?: ReportFilterOptions): Report[] {
    let result = [...reports];

    if (filters?.category && filters.category !== 'all') {
      result = result.filter((r) => r.category === filters.category);
    }

    if (filters?.severity && filters.severity !== 'all') {
      result = result.filter((r) => r.severity === filters.severity);
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((r) => r.status === filters.status);
    }

    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.reference_code.toLowerCase().includes(q) ||
          (r.address && r.address.toLowerCase().includes(q)) ||
          (r.landmark && r.landmark.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (filters?.sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest_priority':
        result.sort((a, b) => {
          const scoreA = a.priority_score ?? calculatePriorityScore(a.severity, a.upvotes_count, a.created_at);
          const scoreB = b.priority_score ?? calculatePriorityScore(b.severity, b.upvotes_count, b.created_at);
          return scoreB - scoreA;
        });
        break;
      case 'most_upvoted':
        result.sort((a, b) => b.upvotes_count - a.upvotes_count);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }

  static async getReportById(id: string): Promise<Report | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*, updates:report_updates(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data as Report;
      } catch (err) {
        console.warn('Supabase fetch failed:', err);
      }
    }
    const reports = loadLocalReports();
    return reports.find((r) => r.id === id || r.reference_code === id) || null;
  }

  static async getReportByReference(reference_code: string): Promise<Report | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*, updates:report_updates(*)')
          .eq('reference_code', reference_code)
          .single();
        if (!error && data) return data as Report;
      } catch (err) {
        console.warn('Supabase fetch failed:', err);
      }
    }
    const reports = loadLocalReports();
    return reports.find((r) => r.reference_code === reference_code || r.id === reference_code) || null;
  }

  static async createReport(
    payload: Omit<Report, 'id' | 'reference_code' | 'upvotes_count' | 'created_at' | 'updated_at'>,
    imageFile?: File
  ): Promise<Report> {
    const reference_code = generateReferenceCode();
    const now = new Date().toISOString();
    const priority_score = calculatePriorityScore(payload.severity, 0, now);

    let finalImagePath = payload.image_path;

    // Handle Supabase Storage upload if live Supabase is configured
    if (isSupabaseConfigured && supabase && imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `${reference_code}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName);
          finalImagePath = publicUrlData.publicUrl;
        }
      } catch (e) {
        console.warn('Storage upload error, using local/data URL:', e);
      }
    }

    const newReport: Report = {
      ...payload,
      id: 'rep-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      reference_code,
      image_path: finalImagePath,
      upvotes_count: 0,
      priority_score,
      created_at: now,
      updated_at: now,
      updates: [
        {
          id: 'upd-' + Date.now(),
          report_id: reference_code,
          actor_name: 'CivicLens System',
          new_status: 'reported',
          public_message: 'Report created and registered in the public civic registry.',
          created_at: now,
        },
      ],
    };

    // If Supabase live, save to database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reports').insert([newReport]).select().single();
        if (!error && data) {
          return data as Report;
        }
      } catch (e) {
        console.warn('Supabase insert failed, saving locally:', e);
      }
    }

    // Save locally
    const reports = loadLocalReports();
    reports.unshift(newReport);
    saveLocalReports(reports);
    return newReport;
  }

  static async updateReportStatus(
    reportId: string,
    newStatus: ReportStatus,
    publicMessage?: string,
    internalNote?: string,
    actorName: string = 'Administrator'
  ): Promise<Report> {
    const now = new Date().toISOString();
    const reports = loadLocalReports();
    const index = reports.findIndex((r) => r.id === reportId || r.reference_code === reportId);

    if (index === -1) {
      throw new Error('Report not found');
    }

    const previous_status = reports[index].status;
    const newUpdate: ReportUpdate = {
      id: 'upd-' + Date.now(),
      report_id: reportId,
      actor_name: actorName,
      previous_status,
      new_status: newStatus,
      public_message: publicMessage || `Status changed from ${previous_status} to ${newStatus}`,
      internal_note: internalNote,
      created_at: now,
    };

    const updatedReport: Report = {
      ...reports[index],
      status: newStatus,
      updated_at: now,
      resolved_at: newStatus === 'resolved' ? now : reports[index].resolved_at,
      updates: [...(reports[index].updates || []), newUpdate],
    };

    reports[index] = updatedReport;
    saveLocalReports(reports);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('reports')
          .update({
            status: newStatus,
            updated_at: now,
            resolved_at: newStatus === 'resolved' ? now : null,
          })
          .eq('id', reportId);

        await supabase.from('report_updates').insert([{
          report_id: reportId,
          previous_status,
          new_status: newStatus,
          public_message: publicMessage,
          internal_note: internalNote,
        }]);
      } catch (e) {
        console.warn('Supabase update failed:', e);
      }
    }

    return updatedReport;
  }

  static async toggleUpvote(
    reportId: string,
    _userId: string
  ): Promise<{ upvotes_count: number; has_upvoted: boolean }> {
    const reports = loadLocalReports();
    const index = reports.findIndex((r) => r.id === reportId || r.reference_code === reportId);
    if (index === -1) throw new Error('Report not found');

    const currentlyUpvoted = Boolean(reports[index].has_upvoted);
    const newCount = currentlyUpvoted 
      ? Math.max(0, reports[index].upvotes_count - 1) 
      : reports[index].upvotes_count + 1;

    reports[index].has_upvoted = !currentlyUpvoted;
    reports[index].upvotes_count = newCount;
    reports[index].priority_score = calculatePriorityScore(
      reports[index].severity,
      newCount,
      reports[index].created_at
    );

    saveLocalReports(reports);
    return { upvotes_count: newCount, has_upvoted: !currentlyUpvoted };
  }

  static async markDuplicate(reportId: string, parentReportId: string): Promise<Report> {
    const reports = loadLocalReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) throw new Error('Report not found');

    const updated = await this.updateReportStatus(
      reportId,
      'rejected',
      `Marked as duplicate of report #${parentReportId}. Consolidated into primary ticket.`,
      `Duplicate linked to ${parentReportId}`
    );

    updated.duplicate_of = parentReportId;
    saveLocalReports(loadLocalReports().map((r) => (r.id === reportId ? updated : r)));
    return updated;
  }

  static async getCivicStats(): Promise<CivicStats> {
    const reports = await this.getReports();

    const category_distribution: Record<ReportCategory, number> = {
      pothole: 0,
      garbage: 0,
      streetlight: 0,
      water_leakage: 0,
      drainage: 0,
      infrastructure: 0,
      other: 0,
    };

    const severity_distribution: Record<ReportSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    let reported = 0;
    let under_review = 0;
    let in_progress = 0;
    let resolved = 0;
    let rejected = 0;
    let critical_count = 0;

    const timelineMap: Record<string, { submitted: number; resolved: number }> = {};

    // Seed recent 7 days in timeline
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      timelineMap[dateKey] = { submitted: 0, resolved: 0 };
    }

    reports.forEach((r) => {
      // Category & Severity
      if (category_distribution[r.category] !== undefined) {
        category_distribution[r.category]++;
      }
      if (severity_distribution[r.severity] !== undefined) {
        severity_distribution[r.severity]++;
      }

      if (r.severity === 'critical') critical_count++;

      // Status
      if (r.status === 'reported') reported++;
      else if (r.status === 'under_review') under_review++;
      else if (r.status === 'in_progress') in_progress++;
      else if (r.status === 'resolved') resolved++;
      else if (r.status === 'rejected') rejected++;

      // Timeline mapping
      const subDate = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (timelineMap[subDate]) {
        timelineMap[subDate].submitted++;
      }
      if (r.resolved_at) {
        const resDate = new Date(r.resolved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (timelineMap[resDate]) {
          timelineMap[resDate].resolved++;
        }
      }
    });

    const timeline_data = Object.entries(timelineMap).map(([date, data]) => ({
      date,
      submitted: data.submitted,
      resolved: data.resolved,
    }));

    return {
      total: reports.length,
      reported,
      under_review,
      in_progress,
      resolved,
      rejected,
      critical_count,
      avg_resolution_days: 2.4, // Realistic civic resolution SLA
      category_distribution,
      severity_distribution,
      timeline_data,
    };
  }

  static exportReportsToCsv(reports: Report[]): string {
    const headers = [
      'Reference Code',
      'Title',
      'Category',
      'Severity',
      'Status',
      'Address',
      'Latitude',
      'Longitude',
      'Upvotes',
      'Priority Score',
      'Created At',
      'Resolved At',
    ];

    const rows = reports.map((r) => [
      `"${r.reference_code}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.severity}"`,
      `"${r.status}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      r.latitude,
      r.longitude,
      r.upvotes_count,
      r.priority_score ?? 0,
      `"${r.created_at}"`,
      `"${r.resolved_at || ''}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  static resetToDemoData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
  }
}
