import React from 'react';
import { 
  Eye, 
  Sparkles, 
  MapPin, 
  Database, 
  ShieldCheck, 
  Lock, 
  Code2, 
  Cpu, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import { APP_CONFIG } from '../lib/constants';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE5F0] text-[#552B58] text-xs font-bold border border-[#DFCEE2]">
          <Eye size={13} />
          <span>Product Architecture & Principles</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          About CivicLens
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          {APP_CONFIG.tagline}
        </p>
      </div>

      {/* Prototype Notice Alert Box */}
      <div className="p-5 rounded-3xl bg-[#FDF0E6] border border-[#F6D5BD] text-[#8C4311] text-xs leading-relaxed flex items-start gap-3.5 shadow-2xs">
        <AlertTriangle size={18} className="text-[#B55D1C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-slate-900">Prototype & Hackathon Demonstration Notice:</strong>
          <p className="text-slate-700">
            CivicLens is an independent civic technology research prototype developed for demonstration purposes. Reports submitted within this application are maintained in the demonstration database and are not automatically transmitted to municipal emergency services (such as 911 or city hotlines). For immediate life safety emergencies, contact municipal emergency personnel directly.
          </p>
        </div>
      </div>

      {/* Technology Stack Architecture */}
      <div className="bg-white border border-[#E7E2ED] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] space-y-6">
        <div className="flex items-center gap-2">
          <Cpu size={20} className="text-[#552B58]" />
          <h2 className="text-lg font-bold text-slate-900">Full-Stack Architecture</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F5F4F8] border border-[#EAE6F0] space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Code2 size={15} className="text-[#552B58]" />
              <span>Frontend & Reactive UI</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              React 18 with Vite, TypeScript, and Tailwind CSS. Clean component hierarchy with responsive mobile-first layouts and studio aesthetics.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F4F8] border border-[#EAE6F0] space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={15} className="text-[#552B58]" />
              <span>Multi-Modal BharatCode Model API</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Official BharatCode Model API (<code>qwen-3.8-27b</code>) multi-modal vision-language model with structured JSON triage output, paired with a secure server-side proxy and heuristic offline fallback for zero-downtime testing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F4F8] border border-[#EAE6F0] space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={15} className="text-[#552B58]" />
              <span>Interactive Leaflet Mapping</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              OpenStreetMap tile integration with HTML5 GPS geolocation, draggable map pin placement, and reverse geocoding via Nominatim.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F4F8] border border-[#EAE6F0] space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Database size={15} className="text-[#552B58]" />
              <span>Supabase Backend & Storage</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              PostgreSQL relational schema with Row-Level Security (RLS), Supabase Storage bucket for photo storage, and local browser cache fallback.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Roles */}
      <div className="bg-white border border-[#E7E2ED] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(44,25,48,0.03)] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#247A48]" />
          <h2 className="text-lg font-bold text-slate-900">Role-Based Access Control</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          CivicLens enforces dual-tier permission policies. Citizens can file reports, upload photos, upvote community submissions, and track ticket milestones. Administrators hold elevated privileges to update triage states, add internal technical dispatch logs, link duplicate reports, and export CSV audit data.
        </p>
      </div>
    </div>
  );
};
