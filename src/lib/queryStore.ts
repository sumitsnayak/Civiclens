import { CitizenQuery, ReportCategory } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'civiclens_queries_store_v1';

export const INITIAL_QUERIES: CitizenQuery[] = [
  {
    id: 'qry-1',
    ticket_reference: 'CVL-2026-8812',
    author_name: 'Elena Rostova',
    category: 'pothole',
    question: 'How long does a severe pothole work order take to be dispatched?',
    details: 'I reported an 8-inch deep road cavity on Market Street that is damaging bicycle rims. It is marked as In Remediation. When will the milling crew arrive?',
    status: 'answered',
    responder_name: 'Director Sharma (Department of Public Works)',
    response: 'Critical priority road cavities on arterial transit corridors are scheduled for initial cold-patch asphalt stabilization within 24 to 48 hours of municipal triage. Heavy milling equipment has been deployed for Market Street.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    upvotes: 18,
  },
  {
    id: 'qry-2',
    ticket_reference: 'CVL-2026-3490',
    author_name: 'David Chen',
    category: 'garbage',
    question: 'What is the procedure if a commercial garbage dumpster overflows repeatedly every weekend?',
    details: 'Our local market dumpster overflows by Saturday afternoon attracting pests. Can municipal sanitation increase pickup frequency?',
    status: 'answered',
    responder_name: 'Sanitation Bureau Dispatch',
    response: 'Repeated commercial overflow reports are automatically forwarded to the Bureau of Code Enforcement. A commercial waste audit has been triggered for this sector to enforce larger bin capacity.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    upvotes: 12,
  },
  {
    id: 'qry-3',
    ticket_reference: 'CVL-2026-9041',
    author_name: 'Priya Patel',
    category: 'streetlight',
    question: 'Can I report multiple dark streetlights along a block under a single ticket?',
    details: 'Five consecutive streetlights along 4th Avenue are dead, creating a 200-meter dark corridor.',
    status: 'answered',
    responder_name: 'Public Infrastructure Triage',
    response: 'Yes! When multiple adjacent streetlights fail simultaneously, it usually indicates an electrical circuit breaker or underground feeder cable fault rather than individual bulbs. Note "Corridor failure" in the description so electrical grid teams are assigned.',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    upvotes: 24,
  },
  {
    id: 'qry-4',
    author_name: 'Marcus Vance',
    category: 'water_leakage',
    question: 'How do I differentiate between clean potable water leakage and sewer drainage backup?',
    details: 'There is running water bubbling from a curb joint without odor. Which team gets routed?',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    upvotes: 7,
  },
];

function loadLocalQueries(): CitizenQuery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load local queries:', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUERIES));
  return INITIAL_QUERIES;
}

function saveLocalQueries(list: CitizenQuery[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save local queries:', e);
  }
}

export class QueryService {
  /**
   * Retrieves citizen queries from Supabase or local store
   */
  static async getQueries(categoryFilter: string = 'all', searchQuery: string = ''): Promise<CitizenQuery[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('citizen_queries').select('*').order('created_at', { ascending: false });
        if (categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data as CitizenQuery[];
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
              (item) =>
                item.question.toLowerCase().includes(q) ||
                (item.details && item.details.toLowerCase().includes(q)) ||
                (item.ticket_reference && item.ticket_reference.toLowerCase().includes(q))
            );
          }
          return list;
        }
      } catch (err) {
        console.warn('Supabase query fetch fallback:', err);
      }
    }

    // Local fallback
    let local = loadLocalQueries();
    if (categoryFilter !== 'all') {
      local = local.filter((q) => q.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      local = local.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          (item.details && item.details.toLowerCase().includes(q)) ||
          (item.ticket_reference && item.ticket_reference.toLowerCase().includes(q))
      );
    }
    return local;
  }

  /**
   * Submits a new citizen inquiry to Supabase & local store
   */
  static async createQuery(data: {
    author_name: string;
    category: ReportCategory | 'general';
    question: string;
    details?: string;
    ticket_reference?: string;
  }): Promise<CitizenQuery> {
    const newQuery: CitizenQuery = {
      id: `qry-${Date.now()}`,
      author_name: data.author_name,
      category: data.category,
      question: data.question,
      details: data.details,
      ticket_reference: data.ticket_reference,
      status: 'pending',
      created_at: new Date().toISOString(),
      upvotes: 1,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('citizen_queries')
          .insert([newQuery])
          .select()
          .single();

        if (!error && inserted) {
          const list = loadLocalQueries();
          saveLocalQueries([inserted as CitizenQuery, ...list]);
          return inserted as CitizenQuery;
        }
      } catch (err) {
        console.warn('Supabase query insert fallback:', err);
      }
    }

    const list = loadLocalQueries();
    saveLocalQueries([newQuery, ...list]);
    return newQuery;
  }

  /**
   * Upvotes a citizen query
   */
  static async upvoteQuery(id: string): Promise<number> {
    const list = loadLocalQueries();
    const target = list.find((q) => q.id === id);
    const newCount = target ? target.upvotes + 1 : 1;

    if (target) {
      target.upvotes = newCount;
      saveLocalQueries(list);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('citizen_queries')
          .update({ upvotes: newCount })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase query upvote fallback:', err);
      }
    }

    return newCount;
  }
}

