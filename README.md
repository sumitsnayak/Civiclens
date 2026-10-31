# CivicLens — AI-Powered Civic Problem Reporter

> **Tagline:** See a Problem. Report It. Track the Change.  
> **Category:** Smart Cities, AI Multi-modal Vision, Civic Technology, Social Impact

CivicLens empowers citizens to report local municipal issues (potholes, garbage dumping, non-functioning streetlights, water pipe bursts, clogged storm drains, damaged infrastructure) and provides civic administrators with an automated triage, spatial dispatch, and progress tracking console.

*Note: CivicLens is an independent prototype built for hackathon demonstration and civic tech evaluation. It is not an official municipal or emergency 911 dispatch application.*

---

## 🌟 Key Features

### 1. For Citizens
- **Instant Photo Upload & Verification:** Drag & drop or camera capture for JPG, PNG, and WebP with client-side validation.
- **AI-Powered Vision Diagnostic:** Powered by Google Gemini 1.5 Flash Vision (with local smart classifier fallback) detecting defect type, severity (Low, Medium, High, Critical), confidence rating, and preliminary engineering summary.
- **Citizen Freedom of Override:** Full ability to correct or manually override AI suggestions.
- **Interactive OpenStreetMap Pinpoint:** Draggable Leaflet marker with 1-click GPS geolocation and reverse-geocoded street address resolution.
- **Audit-Trail Tracking:** Every report generates a unique reference code (e.g., `CVL-2026-8812`) with celebratory submission feedback.
- **Civic Agreement & Upvotes:** Community members can confirm active hazards nearby ("Agreed"), increasing municipal priority scores.
- **Citizen Dashboard:** Personal tracker showing reports awaiting review, in-remediation, and resolved.

### 2. For Municipal Operations & Administrators
- **Role-Protected Command Console:** Strict role checks (Citizen vs Admin) with Row Level Security (RLS) enforcement.
- **Real-Time Ticket Dispatch:** Transition tickets through `Reported → Under Review → In Progress → Resolved` (or `Rejected`).
- **Public Updates & Private Notes:** Add transparent milestone messages for citizens and internal technical notes for field crews.
- **Duplicate Ticket Consolidation:** Link redundant neighborhood submissions into a primary parent ticket.
- **CSV Data Export:** One-click export of filtered civic records for GIS software and legacy city databases.
- **Real-Time Analytics:** Recharts visualizations showing category breakdowns, severity distributions, and 7-day intake vs resolution pace.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 with Vite & TypeScript |
| **Styling & Design System** | Tailwind CSS (Midnight Navy & Electric Teal palette) |
| **Icons & Micro-interactions** | Lucide React & Canvas-Confetti |
| **Spatial Mapping** | Leaflet with OpenStreetMap & Nominatim Geocoding |
| **Charts & Metrics** | Recharts (Responsive Pie, Bar, Area charts) |
| **Database & Auth** | Supabase (PostgreSQL, Supabase Auth, Storage, RLS) |
| **AI Vision Diagnostics** | Google Gemini 1.5 Flash Vision API + Local Heuristic Fallback |

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository and navigate into project directory
cd HACKATHON

# Install dependencies
npm install
```

### 3. Environment Setup (Optional)
The application works **100% out of the box** using its built-in local persistence engine and vision classifier. To connect live Supabase and Google Gemini Vision:

```bash
# Copy example environment configuration
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Supabase Database Setup
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. In the **SQL Editor**, run the migration file provided at:
   `supabase/migrations/20261031_civiclens_init.sql`
3. In **Storage**, create a public bucket named `report-images`.

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚡ Hackathon Evaluator Quick-Switch

CivicLens includes a built-in role switcher in the navigation bar to allow judges to seamlessly test both personas:
1. **Citizen Persona (Marcus Vance):** Test submitting new issues, camera uploads, AI classification, and personal tracking dashboard.
2. **Administrator Persona (Director Sharma):** Test administrative ticket status changes, dispatch notes, CSV exports, and duplicate linking.

---

## 🔒 Security & Row Level Security (RLS)

- **Strict Role Isolation:** Citizen users cannot alter administrative fields or promote themselves to administrator.
- **Internal Note Privacy:** Administrative maintenance notes (`internal_note`) are hidden from public queries via RLS policies.
- **Sanitized Public Fields:** Personal emails and authentication tokens are never exposed on public cards or map markers.

---

## 📦 Build for Production

```bash
npm run build
```
The optimized bundle is output to `dist/`, ready for zero-config deployment to Vercel, Netlify, or Cloudflare Pages.

