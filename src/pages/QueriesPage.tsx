import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  ThumbsUp, 
  ShieldCheck, 
  AlertCircle,
  FileQuestion,
  Sparkles,
  Database
} from 'lucide-react';
import { CitizenQuery, ReportCategory } from '../types';
import { CATEGORIES_CONFIG } from '../lib/constants';
import { useAuth } from '../lib/authStore';
import { QueryService } from '../lib/queryStore';
import { isSupabaseConfigured } from '../lib/supabase';

const FAQS = [
  {
    q: 'How does CivicLens AI verify and classify reported civic problems?',
    a: 'When you upload an issue photograph, the multi-modal computer vision model analyzes visual textures, structural patterns, and defect geometry to identify the defect category (pothole, streetlight, garbage, etc.) and suggest a severity rating. Citizens can always review, modify, or override the suggested classification before submission.',
  },
  {
    q: 'What is the turnaround timeline (SLA) for reported issues?',
    a: 'Critical safety emergencies (water main ruptures, exposed rebar) are triaged within 2 hours. High severity hazards are targeted for remediation within 24–48 hours. Standard maintenance requests typically resolve in 3–5 working days.',
  },
  {
    q: 'Can I report a problem if my exact street address is unknown?',
    a: 'Yes! The integrated Leaflet map allows you to click "Use GPS" or drag a marker pin directly over the defect. The system utilizes reverse geocoding to resolve the closest municipal coordinates automatically within 5 meters.',
  },
  {
    q: 'How does community agreement ("I Agree") influence municipal priority?',
    a: 'The CivicLens priority algorithm assigns weight to community validation upvotes. Multiple citizen confirmations raise a ticket’s priority score, triggering faster escalation to supervisory dispatchers.',
  },
  {
    q: 'Is CivicLens an official emergency hotline?',
    a: 'CivicLens is an independent civic technology platform and demonstration prototype. Reports are logged in the public audit registry and municipal database. For immediate life safety emergencies, call local emergency services directly.',
  },
];

export const QueriesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'ask' | 'faq'>('feed');
  const [queries, setQueries] = useState<CitizenQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // New Query Form State
  const [newQuestion, setNewQuestion] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newTicketRef, setNewTicketRef] = useState('');
  const [newCategory, setNewCategory] = useState<ReportCategory>('pothole');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadQueries();
  }, [selectedCategory, searchQuery]);

  const loadQueries = async () => {
    setLoading(true);
    const data = await QueryService.getQueries(selectedCategory, searchQuery);
    setQueries(data);
    setLoading(false);
  };

  const handleUpvoteQuery = async (id: string) => {
    const updatedCount = await QueryService.upvoteQuery(id);
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: updatedCount } : q))
    );
  };

  const handlePostQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await QueryService.createQuery({
        author_name: user?.display_name || 'Citizen Inquirer',
        category: newCategory,
        question: newQuestion.trim(),
        details: newDetails.trim() || undefined,
        ticket_reference: newTicketRef.trim() || undefined,
      });

      setQueries([created, ...queries]);
      setNewQuestion('');
      setNewDetails('');
      setNewTicketRef('');
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('feed');
      }, 1000);
    } catch (err) {
      console.error('Failed to post query:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE5F0] text-[#552B58] text-xs font-bold border border-[#DFCEE2]">
          <FileQuestion size={13} />
          <span>Citizen Queries & Helpdesk</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Civic Inquiries & Citizen Queries
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Submit questions regarding issue remediation, municipal response timelines, and tracking guidelines.
        </p>
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
          <Database size={11} className="text-[#552B58]" />
          <span>Storage: {isSupabaseConfigured ? 'Supabase Synchronized' : 'Active Local Store'}</span>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center justify-center">
        <div className="bg-white p-1 rounded-2xl border border-[#E7E2ED] shadow-2xs flex items-center gap-1">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-[#442646] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F4F8]'
            }`}
          >
            <MessageSquare size={13} />
            <span>Community Queries</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              {queries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ask')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ask'
                ? 'bg-[#442646] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F4F8]'
            }`}
          >
            <Plus size={13} />
            <span>Submit a Query</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-[#442646] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F5F4F8]'
            }`}
          >
            <HelpCircle size={13} />
            <span>Frequently Asked</span>
          </button>
        </div>
      </div>

      {/* 3. TAB 1: COMMUNITY QUERIES FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-[#E7E2ED] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries, ticket reference, or topics..."
                className="w-full pl-8 pr-4 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#442646] text-white'
                    : 'bg-[#F5F4F8] text-slate-600 hover:bg-[#EDE8F2]'
                }`}
              >
                All
              </button>
              {Object.entries(CATEGORIES_CONFIG).slice(0, 4).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    selectedCategory === key
                      ? 'bg-[#442646] text-white font-bold'
                      : 'bg-[#F5F4F8] text-slate-600 hover:bg-[#EDE8F2]'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Queries List */}
          <div className="space-y-4">
            {queries.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E7E2ED] hover:border-[#D3CADB] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] space-y-3.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EDE5F0] border border-[#DFCEE2] text-[#552B58] flex items-center justify-center font-bold text-xs shrink-0">
                      {item.author_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.author_name}</h4>
                      <div className="text-[11px] text-slate-400">
                        {item.ticket_reference && (
                          <span className="font-mono text-slate-500 font-semibold mr-2">
                            Ref: {item.ticket_reference}
                          </span>
                        )}
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      item.status === 'answered'
                        ? 'bg-[#E8F6ED] text-[#247A48] border-[#CDEED7]'
                        : 'bg-[#FDF0E6] text-[#B55D1C] border-[#F6D5BD]'
                    }`}
                  >
                    {item.status === 'answered' ? '✓ Answered' : '⏱ Pending Review'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {item.question}
                  </h3>
                  {item.details && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.details}
                    </p>
                  )}
                </div>

                {/* Official Response Box */}
                {item.response && (
                  <div className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EAE4F0] space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#552B58]">
                      <ShieldCheck size={14} className="text-[#8A4A8E]" />
                      <span>{item.responder_name || 'Official Municipal Coordinator'}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {item.response}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#F2EEF6] text-xs">
                  <button
                    onClick={() => handleUpvoteQuery(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F5F4F8] hover:bg-[#EDE5F0] text-slate-700 hover:text-[#552B58] font-bold text-xs transition-colors"
                  >
                    <ThumbsUp size={12} />
                    <span>{item.upvotes} Helpful</span>
                  </button>

                  <span className="text-[11px] text-slate-400 capitalize">
                    Category: #{item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB 2: SUBMIT A QUERY */}
      {activeTab === 'ask' && (
        <div className="bg-white border border-[#E7E2ED] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_-2px_rgba(44,25,48,0.03)] space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit a Civic Inquiry</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask questions directly regarding repair schedules, priority ratings, or report status.
            </p>
          </div>

          <form onSubmit={handlePostQuery} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ReportCategory)}
                className="w-full px-3 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
              >
                {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Related Ticket Code (Optional)
              </label>
              <input
                type="text"
                value={newTicketRef}
                onChange={(e) => setNewTicketRef(e.target.value)}
                placeholder="e.g. CVL-2026-8812"
                className="w-full px-3.5 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Question Headline *
              </label>
              <input
                type="text"
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. What is the scheduled inspection date for the drainage blockage on Elm Street?"
                className="w-full px-3.5 py-2.5 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Details or Context
              </label>
              <textarea
                rows={4}
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Describe your question, timeline observations, or previous communication..."
                className="w-full px-3.5 py-2.5 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs text-slate-900 placeholder-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white"
              />
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Inquiry submitted! Stored in database & routing to dispatch desk...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#442646] hover:bg-[#341B36] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Send size={13} />
              <span>{isSubmitting ? 'Posting Query...' : 'Submit Inquiry'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 5. TAB 3: FREQUENTLY ASKED QUERIES (FAQ) */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          <div className="mb-2">
            <h2 className="text-base font-bold text-slate-900">Knowledge Base & FAQ</h2>
            <p className="text-xs text-slate-500">Official guidelines on civic reporting, priority algorithms, and SLAs</p>
          </div>

          {FAQS.map((item, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-[#E7E2ED] rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#FAF8FB] transition-colors"
                >
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    {item.q}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-[#552B58] shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-[#F5F2F8] animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
