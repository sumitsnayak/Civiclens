import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  X, 
  Loader2, 
  ShieldAlert, 
  RefreshCw,
  FileCheck
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

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-step state: 1 (Upload) -> 2 (AI Analysis) -> 3 (Location) -> 4 (Details) -> 5 (Celebration)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Image
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');

  // Step 2: AI Vision
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIVisionResult | null>(null);
  const [isLiveAI, setIsLiveAI] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('pothole');
  const [selectedSeverity, setSelectedSeverity] = useState<ReportSeverity>('medium');
  const [useManualMode, setUseManualMode] = useState<boolean>(false);

  // Step 3: Location
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string }>({
    lat: 37.7749,
    lng: -122.4194,
    address: '420 Oakridge Blvd, San Francisco, CA',
  });
  const [landmark, setLandmark] = useState<string>('');

  // Step 4: Details
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [detailsError, setDetailsError] = useState<string>('');

  // Step 5: Submission & Success
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  // IMAGE HANDLING
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    setImageError('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      setImageError('Unsupported file type. Please upload a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('File exceeds 10MB limit. Please upload an optimized photo.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setAiResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ADVANCE TO AI ANALYSIS (Step 2)
  const proceedToAIAnalysis = async () => {
    if (!selectedFile) {
      setImageError('Please select or capture a photograph first.');
      return;
    }

    setCurrentStep(2);
    setIsAnalyzing(true);

    try {
      const { result, isLiveAI: live } = await analyzeCivicImage(selectedFile, previewUrl);
      setAiResult(result);
      setIsLiveAI(live);
      setSelectedCategory(result.category);
      setSelectedSeverity(result.severity);
      if (!title) setTitle(result.suggested_title);
      if (!description) setDescription(result.explanation);
    } catch (err) {
      console.warn('AI analysis issue, falling back to manual entry:', err);
      setUseManualMode(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // SUBMIT FORM
  const handleFinalSubmit = async () => {
    if (!title.trim()) {
      setDetailsError('Please enter a clear summary title.');
      return;
    }
    if (!description.trim()) {
      setDetailsError('Please enter a descriptive explanation of the problem.');
      return;
    }

    setIsSubmitting(true);
    setDetailsError('');

    try {
      const created = await ReportService.createReport(
        {
          title: title.trim(),
          description: description.trim(),
          category: selectedCategory,
          severity: selectedSeverity,
          status: 'reported',
          image_path: previewUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          landmark: landmark.trim() || undefined,
          ai_category: aiResult?.category,
          ai_explanation: aiResult?.explanation,
          ai_confidence: aiResult?.confidence,
          user_id: user?.id,
          author_name: user?.display_name || 'Anonymous Citizen',
        },
        selectedFile || undefined
      );

      setSubmittedReport(created);
      setCurrentStep(5);

      // Trigger celebratory confetti burst!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06D6A0', '#1C2541', '#38BDF8', '#F59E0B'],
        });
      } catch {
        // Confetti fallback
      }
    } catch (err: any) {
      setDetailsError(err.message || 'Submission failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Wizard Header & Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Report a Civic Problem
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Submit photo verification and coordinates for community tracking
            </p>
          </div>
          {currentStep < 5 && (
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Stepper Progress Bar */}
        {currentStep < 5 && (
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { num: 1, label: 'Upload Photo' },
              { num: 2, label: 'AI Classification' },
              { num: 3, label: 'Pinpoint Location' },
              { num: 4, label: 'Review & Submit' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div key={step.num} className="space-y-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isPast
                        ? 'bg-emerald-500'
                        : isActive
                        ? 'bg-electric-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isPast
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-midnight-950 text-white dark:bg-electric-500 dark:text-midnight-950'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPast ? '✓' : step.num}
                    </span>
                    <span
                      className={`truncate hidden sm:inline ${
                        isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 1: UPLOAD PHOTO */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera size={20} className="text-electric-500" />
              <span>Step 1: Capture or Upload Issue Photograph</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Provide a clear image of the defect. Our computer vision models analyze the visual features to suggest severity and category.
            </p>
          </div>

          {/* Drag & Drop Area */}
          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-electric-500 dark:hover:border-electric-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/50 hover:bg-electric-500/5 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-midnight-950 text-electric-400 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Upload size={28} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Click to browse or drag and drop photo here
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Supported formats: JPG, PNG, WebP (Max size: 10MB)
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-electric-600 dark:text-electric-400 bg-electric-500/10 px-3 py-1 rounded-full">
                <Sparkles size={13} />
                <span>Instant AI defect detection ready</span>
              </div>
            </div>
          ) : (
            /* Image Preview */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 aspect-video max-h-96">
                <img
                  src={previewUrl}
                  alt="Issue preview"
                  className="w-full h-full object-contain mx-auto"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 rounded-full bg-midnight-950/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors shadow-lg"
                  title="Remove photograph"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 size={14} />
                  <span>Photo loaded: {selectedFile?.name}</span>
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-electric-600 font-semibold hover:underline"
                >
                  Replace photo
                </button>
              </div>
            </div>
          )}

          {imageError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{imageError}</span>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={!selectedFile}
              onClick={proceedToAIAnalysis}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-500 hover:bg-electric-400 disabled:opacity-50 text-midnight-950 font-bold text-sm shadow-md transition-all"
            >
              <span>Analyze with AI</span>
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI CLASSIFICATION & CORRECTION */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={20} className="text-electric-500" />
                <span>Step 2: AI-Powered Defect Classification</span>
              </h2>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                isLiveAI 
                  ? 'bg-electric-500/10 text-electric-600 border-electric-500/30' 
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              }`}>
                {isLiveAI ? '⚡ Gemini 1.5 Flash Vision' : '⚙️ Vision Classifier Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review the automated findings below. As a citizen reporter, you have full authority to override any category or severity.
            </p>
          </div>

          {isAnalyzing ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-electric-500/20 border-t-electric-500 animate-spin" />
                <Sparkles size={20} className="absolute inset-0 m-auto text-electric-500 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Analyzing visual features...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Detecting hazard signatures, structural defects, and severity indicators
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Structured Findings Card */}
              {aiResult && !useManualMode && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-electric-500/10 text-electric-500">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          AI Confidence: {Math.round(aiResult.confidence * 100)}%
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          Suggested: {CATEGORIES_CONFIG[aiResult.category]?.label || aiResult.category}
                        </h4>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-electric-600 bg-electric-500/10 px-3 py-1 rounded-full border border-electric-500/20 self-start sm:self-auto">
                      Recommendation: {aiResult.severity.toUpperCase()} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Engineering Diagnostic:</strong> {aiResult.explanation}
                  </p>

                  {/* Detected features tag cloud */}
                  {aiResult.detected_elements && aiResult.detected_elements.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-semibold mr-1">Visual tags:</span>
                      {aiResult.detected_elements.map((elem, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-mono"
                        >
                          #{elem}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Citizen Verification & Manual Overrides */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Confirm or Modify Issue Category:
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseManualMode(!useManualMode)}
                    className="text-xs text-electric-600 dark:text-electric-400 font-semibold hover:underline"
                  >
                    {useManualMode ? 'Show AI Analysis' : 'Manual Override Fallback'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => {
                    const isSelected = selectedCategory === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedCategory(key as ReportCategory)}
                        className={`p-3 rounded-2xl border cursor-pointer text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-electric-500 bg-electric-500/10 text-slate-900 dark:text-white font-bold ring-1 ring-electric-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <div>{config.label}</div>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-electric-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Severity Selection */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Confirm Urgency / Severity Level:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(SEVERITY_CONFIG).map(([key, config]) => {
                      const isSelected = selectedSeverity === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedSeverity(key as ReportSeverity)}
                          className={`p-3 rounded-2xl border cursor-pointer text-xs text-center transition-all ${
                            isSelected
                              ? 'border-electric-500 bg-electric-500/10 font-bold ring-1 ring-electric-500 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <div>{config.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{config.description}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <ArrowLeft size={14} />
              <span>Back to Photo</span>
            </button>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-midnight-950 font-bold text-sm shadow-md transition-all"
            >
              <span>Confirm & Set Location</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION PICKER */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin size={20} className="text-electric-500" />
              <span>Step 3: Pinpoint Problem Location</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Drag the pin or click on the map to mark the exact spot. You can also search for a street name or tap "Use My Location".
            </p>
          </div>

          <LocationPickerMap
            initialLat={location.lat}
            initialLng={location.lng}
            initialAddress={location.address}
            onLocationSelected={(loc) => setLocation(loc)}
          />

          {/* Optional Landmark Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Specific Landmark or Navigation Note (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near bus stop #24, in front of community clinic, crosswalk corner"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-electric-500"
            />
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <ArrowLeft size={14} />
              <span>Back to Classification</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-midnight-950 font-bold text-sm shadow-md transition-all"
            >
              <span>Next: Review Details</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REPORT DETAILS & REVIEW */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck size={20} className="text-electric-500" />
              <span>Step 4: Finalize Report Details</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Give your report a clear title and description to help maintenance teams prioritize equipment and supplies.
            </p>
          </div>

          {/* Summary Preview Banner */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Thumbnail"
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            )}
            <div className="space-y-1 text-xs truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  {CATEGORIES_CONFIG[selectedCategory]?.label}
                </span>
                <span className="text-[10px] uppercase font-bold text-electric-600 bg-electric-500/10 px-2 py-0.5 rounded">
                  {selectedSeverity} Severity
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 truncate">
                📍 {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
              </p>
              {landmark && <p className="text-slate-500 italic truncate">Landmark: {landmark}</p>}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Issue Headline / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole damaging tires near transit hub"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-electric-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Detailed Problem Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed, potential hazards, and any specific details that will help work crews locate the problem."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-electric-500"
              />
            </div>
          </div>

          {detailsError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{detailsError}</span>
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <ArrowLeft size={14} />
              <span>Back to Map</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-electric-500 hover:bg-electric-400 disabled:opacity-50 text-midnight-950 font-extrabold text-sm shadow-glow-teal transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting to Registry...</span>
                </>
              ) : (
                <>
                  <span>Submit Civic Report</span>
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CELEBRATION & SUCCESS */}
      {currentStep === 5 && submittedReport && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-3xl bg-electric-500/20 text-electric-500 border border-electric-500/30 mx-auto flex items-center justify-center shadow-glow-teal animate-bounce">
            <CheckCircle2 size={40} />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-electric-600 dark:text-electric-400">
              Report Successfully Registered
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Thank You for Protecting Your Community!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Your submission has been cataloged in the open civic registry and assigned an audit-trail reference code.
            </p>
          </div>

          {/* Reference Card */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-midnight-950 border border-midnight-800 text-white space-y-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Tracking Reference Code
            </div>
            <div className="text-2xl font-mono font-black text-electric-400 tracking-wider">
              {submittedReport.reference_code}
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-midnight-800 flex items-center justify-between">
              <span>Status: <strong className="text-blue-400">Reported (Pending Review)</strong></span>
              <span>Priority: <strong className="text-amber-400">{submittedReport.severity}</strong></span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onSuccess(submittedReport)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-electric-500 hover:bg-electric-400 text-midnight-950 font-bold text-sm shadow-md transition-all"
            >
              View Full Report Details
            </button>
            <button
              onClick={() => {
                // Reset form to submit another
                setSelectedFile(null);
                setPreviewUrl('');
                setAiResult(null);
                setTitle('');
                setDescription('');
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
