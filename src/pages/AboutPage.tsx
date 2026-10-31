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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 text-electric-600 dark:text-electric-400 text-xs font-bold border border-electric-500/20">
          <Eye size={14} />
          <span>Product Architecture & Principles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          About CivicLens
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {APP_CONFIG.tagline}
        </p>
      </div>

      {/* Prototype Notice Alert Box */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3 shadow-sm">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Prototype & Hackathon Demonstration Disclaimer:</strong>
          <p className="mt-1">
            CivicLens is an independent civic technology research prototype. Reports submitted within this application are maintained in the demonstration database and are not automatically transmitted to municipal emergency services (such as 911 or city hotlines). For immediate life safety emergencies, contact local emergency personnel directly.
          </p>
        </div>
      </div>

      {/* Technology Stack Architecture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu size={22} className="text-electric-500" />
          <span>Modern Full-Stack Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 size={16} className="text-electric-500" />
              <span>Frontend & Reactive UI</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              React 18 with Vite, TypeScript, and Tailwind CSS. Clean component hierarchy with responsive mobile-first layouts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database size={16} className="text-emerald-500" />
              <span>Backend & Database</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Supabase PostgreSQL with strict Row Level Security (RLS) policies, triggers for automated profile sync, and persistent state fallbacks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>AI Vision Diagnostic</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Google Gemini 1.5 Flash Vision API integration with structured JSON defect categorization, combined with smart heuristic classification fallbacks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin size={16} className="text-sky-500" />
              <span>Spatial Mapping & Geocoding</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Leaflet with OpenStreetMap tiles, reverse geocoding via Nominatim API, draggable markers, and GPS location pinpointing.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Data Policy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock size={20} className="text-electric-500" />
          <span>Privacy & Data Protection Principles</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>1. Location Information:</strong> Exact geographic coordinates and resolved street names are collected exclusively to allow repair crews to locate civic problems. We do not track continuous user movements or background locations.
          </p>
          <p>
            <strong>2. Photographic Evidence:</strong> Images uploaded are stored in dedicated storage buckets. Please refrain from uploading photographs depicting identifiable faces, private residential interiors, or vehicle license plates.
          </p>
          <p>
            <strong>3. Citizen Privacy:</strong> Email addresses and personal authentication credentials are never published in public registry APIs or explorer views. Only anonymous or user-chosen display names are associated with public reports.
          </p>
          <p>
            <strong>4. Role-Based Data Isolation:</strong> Internal administrative dispatch notes and work orders are protected via Row Level Security (RLS) and accessible only to verified staff credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
