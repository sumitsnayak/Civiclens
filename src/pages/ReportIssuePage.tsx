import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  X, 
  Loader2,
  Sparkles,
  Navigation,
  ChevronRight,
  Hash,
  Map as MapIcon,
  Eye,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';
import { ReportCategory, ReportSeverity, Report, AIVisionResult } from '../types';
import { CATEGORIES_CONFIG, SEVERITY_CONFIG } from '../lib/constants';
import { analyzeCivicImage, isAIApiConfigured } from '../lib/aiVisionService';
import { LocationPickerMap } from '../components/map/LocationPickerMap';
import { ReportService } from '../lib/reportStore';
import { useAuth } from '../lib/authStore';

interface ReportIssuePageProps {
  onSuccess: (report: Report) => void;
  onCancel: () => void;
}

// Visual High-Tech Incident Presets for Instant 1-Click Evaluation
const SAMPLE_PRESETS = [
  {
    label: 'Road Pothole',
    category: 'pothole' as ReportCategory,
    severity: 'critical' as ReportSeverity,
    title: 'Severe road cavity damaging vehicular traffic',
    description: 'Deep asphalt depression with exposed aggregates near the pedestrian crossing. Causing vehicles to swerve unpredictably.',
    url: '/images/issues/pothole.jpg',
    tags: ['#roadhazard', '#pothole', '#urgentfix'],
  },
  {
    label: 'Garbage Dump',
    category: 'garbage' as ReportCategory,
    severity: 'high' as ReportSeverity,
    title: 'Uncollected refuse pile overflowing onto sidewalk',
    description: 'Municipal trash bin overflowed with decomposing municipal solid waste and discarded plastics. Blocking pedestrian right of way.',
    url: '/images/issues/garbage.jpg',
    tags: ['#sanitation', '#garbagedump', '#cleancity'],
  },
  {
    label: 'Broken Streetlight',
    category: 'streetlight' as ReportCategory,
    severity: 'medium' as ReportSeverity,
    title: 'Non-functioning street luminaire causing dark zone',
    description: 'Overhead municipal luminaire non-operational for three consecutive nights. Entire crosswalk corridor left unilluminated.',
    url: '/images/issues/streetlight.jpg',
    tags: ['#streetlight', '#darkstreet', '#publicsafety'],
  },
  {
    label: 'Water Main Leak',
    category: 'water_leakage' as ReportCategory,
    severity: 'critical' as ReportSeverity,
    title: 'High-pressure water main rupture flooding street',
    description: 'Subterranean municipal water supply pipe leaking clean potable water across both lanes. Low pressure reported by nearby properties.',
    url: '/images/issues/water_leakage.jpg',
    tags: ['#waterleak', '#drainage', '#pipeburst'],
  },
  {
    label: 'Clogged Drain',
    category: 'drainage' as ReportCategory,
    severity: 'high' as ReportSeverity,
    title: 'Stormwater catchment drain severely obstructed',
    description: 'Catch basin grates submerged in street debris and organic litter, leading to pooling and flooding during light rain.',
    url: '/images/issues/drainage.jpg',
    tags: ['#cloggeddrain', '#stormwater', '#floodrisk'],
  },
];

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // High-Tech 3-Stage Intake Stepper State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Photos & Sensor Telemetry State
  const [photos, setPhotos] = useState<string[]>([]);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string>('');

  // BharatCode AI Vision Diagnostic State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIVisionResult | null>(null);
  const [isLiveAI, setIsLiveAI] = useState<boolean>(false);

  // Intake Form Parameters
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ReportCategory>('pothole');
  const [severity, setSeverity] = useState<ReportSeverity>('medium');
  const [description, setDescription] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: 12.9141,
    lng: 74.8560,
    address: 'K.S. Rao Road, Hampankatta, Mangalore, Karnataka 575001',
  });
  const [showMap, setShowMap] = useState<boolean>(true);

  // Hashtags
  const [activeTags, setActiveTags] = useState<string[]>(['#roadhazard', '#pothole']);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  // Handle local file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('File size exceeds 10MB limit.');
      return;
    }

    setPhotoError('');
    setPrimaryFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotos([objectUrl]);

    // Trigger AI Vision Classification
    triggerAIAnalysis(file, objectUrl);
  };

  // Handle Preset Click
  const handleSelectPreset = async (preset: typeof SAMPLE_PRESETS[0]) => {
    setPhotoError('');
    setPhotos([preset.url]);
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setSeverity(preset.severity);
    setActiveTags(preset.tags);

    // Run simulated / API analysis on the preset
    triggerAIAnalysis(null, preset.url, preset.category, preset.severity);
  };

  const triggerAIAnalysis = async (
    file: File | null, 
    url: string, 
    fallbackCategory?: ReportCategory,
    fallbackSeverity?: ReportSeverity
  ) => {
    setIsAnalyzing(true);
    try {
      const { result, isLiveAI: live } = await analyzeCivicImage(file, url);
      setAiResult(result);
      setIsLiveAI(live);
      if (!title) setTitle(result.suggested_title);
      if (!description) setDescription(result.explanation);
      setCategory(result.category || fallbackCategory || 'pothole');
      setSeverity(result.severity || fallbackSeverity || 'medium');
    } catch (err) {
      console.warn('AI analysis fallback applied:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    if (updated.length === 0) {
      setPrimaryFile(null);
      setAiResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  const addCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const formatted = customTagInput.startsWith('#')
        ? customTagInput.trim()
        : `#${customTagInput.trim().replace(/\s+/g, '')}`;
      if (!activeTags.includes(formatted)) {
        setActiveTags([...activeTags, formatted]);
      }
      setCustomTagInput('');
    }
  };

  // Validation before advancing steps
  const handleProceedToStep2 = () => {
    if (photos.length === 0) {
      setPhotoError('Please capture or select an incident photograph to continue.');
      return;
    }
    setPhotoError('');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep3 = () => {
    if (!title.trim()) {
      setFormError('Please enter a headline summary for the problem.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please describe the problem details.');
      return;
    }
    setFormError('');
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setFormError('Please add at least one photograph of the issue.');
      setCurrentStep(1);
      return;
    }
    if (!title.trim()) {
      setFormError('Please enter a headline summary for the problem.');
      setCurrentStep(2);
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const created = await ReportService.createReport(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          severity,
          status: 'reported',
          image_path: photos[0],
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          landmark: landmark.trim() || undefined,
          ai_category: aiResult?.category,
          ai_explanation: aiResult?.explanation,
          ai_confidence: aiResult?.confidence,
          user_id: user?.id,
          author_name: user?.display_name || 'Citizen Reporter',
        },
        primaryFile || undefined
      );

      setSubmittedReport(created);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#CF9E3C', '#10B981', '#0F172A'],
        });
      } catch {
        // Fallback
      }
    } catch (err: any) {
      setFormError(err.message || 'Submission failed. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION RECEIPT (High-Tech Municipal Boarding Pass)
  if (submittedReport) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="relative rounded-[32px] bg-gradient-to-b from-[#0F1117] via-[#0C0E14] to-[#08090D] border border-white/[0.14] p-6 sm:p-8 text-white shadow-[0_25px_60px_rgba(0,0,0,0.6)] space-y-6 overflow-hidden">
          
          {/* Top glowing ambient highlight */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#CF9E3C] to-transparent" />

          {/* Header Strip */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-300">
                MUNICIPAL TELEMETRY DISPATCH PASS
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#CF9E3C] bg-[#CF9E3C]/10 border border-[#CF9E3C]/30 px-2 py-0.5 rounded-full font-bold">
              VERIFIED TICKET
            </span>
          </div>

          {/* Reference Stamp */}
          <div className="text-center space-y-2 py-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#CF9E3C] to-[#996F20] text-black mx-auto flex items-center justify-center font-bold shadow-[0_0_25px_rgba(207,158,60,0.35)]">
              <Check size={28} className="stroke-[3]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Complaint Logged & Dispatched
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Your defect report has been assigned an immutable audit token and queued into the Mangalore City Works dispatch pipeline.
            </p>
          </div>

          {/* Cryptographic Voucher Card */}
          <div className="p-4 sm:p-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl space-y-3 font-mono">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>REFERENCE CODE</span>
              <span className="text-emerald-400">● LIVE ON MAP</span>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-wider text-[#CF9E3C]">
              {submittedReport.reference_code}
            </div>

            <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-left text-[11px]">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Coordinates</span>
                <span className="text-zinc-300 font-semibold">{submittedReport.latitude.toFixed(4)}° N, {submittedReport.longitude.toFixed(4)}° E</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Severity Level</span>
                <span className="text-amber-400 font-semibold uppercase">{submittedReport.severity} Priority</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] text-[11px] text-zinc-300">
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Location Pin</span>
              <span className="truncate block">📍 {submittedReport.address}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onSuccess(submittedReport)}
              className="w-full sm:flex-1 py-3.5 rounded-full bg-[#CF9E3C] hover:bg-[#DBA946] text-black text-xs font-black uppercase tracking-wider shadow-[0_4px_20px_rgba(207,158,60,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Track on Issues Map</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </button>
            <button
              onClick={() => {
                setPhotos([]);
                setPrimaryFile(null);
                setAiResult(null);
                setTitle('');
                setDescription('');
                setCurrentStep(1);
                setSubmittedReport(null);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
            >
              Report Another
            </button>
          </div>

        </div>
      </div>
    );
  }

  // HIGH-TECH GUIDED INTAKE WORKFLOW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* 1. TOP TELEMETRY NAVIGATION BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors py-1.5 px-3 rounded-full hover:bg-slate-200/60"
        >
          <ArrowLeft size={15} />
          <span>Exit Intake</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#CF9E3C] animate-pulse" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
            SMART INCIDENT INTAKE
          </span>
        </div>

        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full">
          DIRECT DISPATCH
        </span>
      </div>

      {/* 2. KINETIC STEPPER PILL DOCK (Replaces boring box header) */}
      <div className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-md rounded-full border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
        {[
          { step: 1, label: 'Visual Sensor & AI', icon: Camera },
          { step: 2, label: 'GIS Geotag & Tuning', icon: MapPin },
          { step: 3, label: 'Verify & Transmit', icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => {
                if (item.step === 1 || photos.length > 0) {
                  setCurrentStep(item.step as 1 | 2 | 3);
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 sm:px-4 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-950 text-[#CF9E3C] shadow-sm'
                  : isDone
                  ? 'text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                isActive ? 'bg-[#CF9E3C] text-black' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {isDone ? '✓' : item.step}
              </div>
              <span className="hidden sm:inline tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. INTAKE STAGE WORKSPACES */}

      {/* ==================== STAGE 1: VISUAL SENSOR & AI DIAGNOSTIC ==================== */}
      {currentStep === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Main Visual Sensor Deck */}
          <div className="rounded-[30px] bg-gradient-to-b from-white to-[#F8FAFC] border border-slate-200/90 p-6 sm:p-8 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.04)] space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CF9E3C]">
                  PHASE 01 • TELEMETRY CAPTURE
                </span>
                <h2 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">
                  Visual Sensor & AI Vision Scan
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                AI Vision analyzes defects & severity automatically
              </span>
            </div>

            {/* Cybernetic Reticle Upload Zone (Replaces the square box) */}
            <div className="relative">
              {photos.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#CF9E3C] bg-slate-50/80 hover:bg-amber-50/20 p-8 sm:p-12 text-center cursor-pointer transition-all group overflow-hidden"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {/* Subtle corner reticles */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-slate-400 group-hover:border-[#CF9E3C] transition-colors" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-slate-400 group-hover:border-[#CF9E3C] transition-colors" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-slate-400 group-hover:border-[#CF9E3C] transition-colors" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-slate-400 group-hover:border-[#CF9E3C] transition-colors" />

                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm mx-auto flex items-center justify-center text-slate-700 group-hover:text-[#CF9E3C] group-hover:scale-110 transition-all">
                    <Camera size={30} className="stroke-[1.8]" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-4">
                    Drop photo here or click to browse
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Take a clear photo of road damage, uncollected waste, streetlights, or water mains.
                  </p>
                  
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-mono font-medium">
                    <Sparkles size={12} className="text-[#CF9E3C]" />
                    <span>BharatCode Qwen-3.8-27b Auto-Classifier Enabled</span>
                  </div>
                </div>
              ) : (
                /* Attached Photo Display with Neural Vision HUD */
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] bg-slate-950 border border-slate-200 shadow-md group">
                  <img
                    src={photos[0]}
                    alt="Attached incident"
                    className="w-full h-full object-cover"
                  />
                  {/* Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

                  {/* Corner Actions */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/10">
                      SENSOR FEED: 1080P
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePhoto(0)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-md"
                    title="Remove Photo"
                  >
                    <X size={15} />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-semibold text-sm truncate max-w-md">{title || 'Incident Photo Loaded'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-[#CF9E3C] hover:underline"
                    >
                      Replace Photo
                    </button>
                  </div>
                </div>
              )}

              {photoError && (
                <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}
            </div>

            {/* AI Vision Diagnostic Feedback */}
            {isAnalyzing ? (
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-white/10 flex items-center gap-3.5 animate-pulse">
                <Loader2 size={20} className="animate-spin text-[#CF9E3C] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-[#CF9E3C]">
                    <Sparkles size={14} />
                    <span>BharatCode Model (qwen-3.8-27b) Analyzing Telemetry...</span>
                  </div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    Extracting structural defect features, hazard classification, and severity score.
                  </div>
                </div>
              </div>
            ) : aiResult ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-white/10 space-y-2.5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Sparkles size={15} className="text-[#CF9E3C]" />
                    <span className="text-[#CF9E3C]">BharatCode Qwen-3.8 Diagnostic Result</span>
                    {isLiveAI && (
                      <span className="text-[9px] bg-[#CF9E3C] text-black px-2 py-0.5 rounded font-mono font-bold">
                        LIVE API
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {Math.round(aiResult.confidence * 100)}% Confidence
                  </span>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  {aiResult.explanation}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    Suggested Category: <strong className="text-white uppercase">{aiResult.category}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    Calculated Severity: <strong className="text-amber-400 uppercase">{aiResult.severity}</strong>
                  </span>
                </div>
              </div>
            ) : null}

            {/* Quick 1-Click Incident Simulator Cards (Attractive Visual Presets) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  OR TEST WITH INSTANT MUNICIPAL PRESETS (1-CLICK)
                </span>
                <span className="text-[11px] text-slate-400">Click to auto-simulate</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {SAMPLE_PRESETS.map((preset) => {
                  const isCurrent = photos[0] === preset.url;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative rounded-2xl overflow-hidden border p-2 text-left transition-all group flex flex-col justify-between ${
                        isCurrent 
                          ? 'border-[#CF9E3C] ring-2 ring-[#CF9E3C]/30 bg-amber-50/30 shadow-md' 
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-slate-100">
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 right-1 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-black/70 text-white">
                          {preset.severity}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-[#CF9E3C] truncate transition-colors">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {preset.tags[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Continue Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="px-6 py-3 rounded-full bg-[#CF9E3C] hover:bg-[#DBA946] text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(207,158,60,0.25)] transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <span>Proceed to GIS Geotag</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== STAGE 2: GIS GEOTAG & CLASSIFICATION ==================== */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="rounded-[30px] bg-gradient-to-b from-white to-[#F8FAFC] border border-slate-200/90 p-6 sm:p-8 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.04)] space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CF9E3C]">
                  PHASE 02 • MANGALORE GIS GEOTAG
                </span>
                <h2 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">
                  Location Pinning & Defect Tuning
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Mangalore OpenStreetMap GIS coordinate resolution
              </span>
            </div>

            {/* Interactive Location Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#CF9E3C]" />
                  <span>Mangalore Defect Coordinates & Address</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
                </span>
              </div>

              <LocationPickerMap
                initialLat={location.lat}
                initialLng={location.lng}
                initialAddress={location.address}
                onLocationSelected={(loc) => setLocation(loc)}
              />

              <div className="pt-1">
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Optional landmark / cross-street (e.g. Near Hampankatta Signal, Opp City Centre)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CF9E3C] focus:bg-white"
                />
              </div>
            </div>

            {/* Category Selector (Tactile Pill Cards) */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Defect Category <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Auto-suggested by AI; citizen override allowed</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => {
                  const isSelected = category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key as ReportCategory)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{config.icon}</span>
                        <span className="text-xs font-bold truncate">{config.label}</span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#CF9E3C] text-black flex items-center justify-center shrink-0">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Rating Gauge */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-900">Hazard Severity Rating</label>
                <span className="text-[11px] font-mono text-[#CF9E3C] font-bold uppercase">{severity} priority</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => {
                  const isSelected = severity === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSeverity(key as ReportSeverity)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#CF9E3C] bg-slate-950 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`text-xs font-bold ${isSelected ? 'text-[#CF9E3C]' : 'text-slate-800'}`}>
                        {config.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {key === 'critical' ? '< 12h SLA' : key === 'high' ? '< 24h SLA' : key === 'medium' ? '< 48h SLA' : '< 5d SLA'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Description Fields */}
            <div className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Incident Headline Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep asphalt cavity disrupting traffic flow"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#CF9E3C] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Detailed Observations <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide physical observations, vehicular safety risks, or access hazards..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#CF9E3C] focus:bg-white"
                />
              </div>
            </div>

            {/* Hashtag Chips */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Citizen Tags</span>
                <span className="text-[11px] text-slate-400 font-normal">Press Enter to add custom tags</span>
              </label>

              <div className="flex flex-wrap items-center gap-1.5">
                {activeTags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    <span>{tag}</span>
                    <X size={11} className="stroke-[3]" />
                  </span>
                ))}

                {['#urgent', '#hazard', '#damagestop', '#cleanliness']
                  .filter((t) => !activeTags.includes(t))
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="px-2.5 py-1 rounded-full border border-dashed border-slate-300 text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}

                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={addCustomTag}
                  placeholder="+ tag (Enter)"
                  className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#CF9E3C] w-32"
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Stepper Navigation Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Back to Photo</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                className="px-6 py-3 rounded-full bg-[#CF9E3C] hover:bg-[#DBA946] text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(207,158,60,0.25)] transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <span>Proceed to Review</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== STAGE 3: VERIFY & TRANSMIT ==================== */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="rounded-[30px] bg-gradient-to-b from-white to-[#F8FAFC] border border-slate-200/90 p-6 sm:p-8 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.04)] space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#CF9E3C]">
                  PHASE 03 • FINAL DISPATCH AUDIT
                </span>
                <h2 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">
                  Confirm Ticket & Transmit
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Final review before queuing into municipal registry
              </span>
            </div>

            {/* Live Holographic Ticket Preview */}
            <div className="rounded-3xl bg-slate-950 text-white p-5 sm:p-6 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#CF9E3C] animate-pulse" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
                    DISPATCH PREVIEW
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#CF9E3C] uppercase tracking-wider font-bold">
                  {severity} PRIORITY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Photo */}
                <div className="sm:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                  <img
                    src={photos[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md font-mono text-[9px] text-white">
                    VERIFIED PHOTO
                  </div>
                </div>

                {/* Details */}
                <div className="sm:col-span-7 space-y-2 text-left">
                  <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    <MapPin size={11} className="text-[#CF9E3C]" />
                    <span>{location.address}</span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug">
                    {title}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed">
                    {description}
                  </p>
                  
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase">
                      Category: {category}
                    </span>
                    {landmark && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 text-[10px]">
                        📍 {landmark}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Reporter: {user?.display_name || 'Marcus Vance (Citizen)'}</span>
                <span className="text-emerald-400">Ready for City Dispatch</span>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Stepper Navigation Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Back to Geotag</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-8 py-3.5 rounded-full bg-[#CF9E3C] hover:bg-[#DBA946] active:scale-[0.99] disabled:opacity-50 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_24px_rgba(207,158,60,0.35)] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Transmitting to Registry...</span>
                  </>
                ) : (
                  <>
                    <span>Transmit Ticket to Municipal Registry</span>
                    <ArrowRight size={15} className="stroke-[3]" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
