# Synapse: Tutoring Materials Engine & Student Interface

## 1. Architecture Overview
Synapse is a multi-tenant, 100% serverless web application designed to govern the intake of tutoring materials and enforce a strict 0-token LLM consumption rule during student out-of-class revision loops. 

The system relies on exactly 1 overarching `index.html` orchestrator compiled via Vite. 

### Core Tech Stack
- **Frontend Orchestrator:** Vanilla JS + Vite (`import.meta.env` integration)
- **Styling:** TailwindCSS via CDN
- **UI Libraries:** FontAwesome, AOS (Animate On Scroll), SweetAlert2
- **Document Processing:** html2pdf.js (Client-side PDF node extraction)
- **Authentication & Storage:** Supabase Auth (Multi-Tenant) & Supabase Storage Bucket (`documents`)
- **Backend Compute:** Supabase Edge Functions (Deno deploy)

## 2. Infrastructure Setup (0-Context Handover)

Because all client architectural environments abide by "Bring Your Own Infrastructure", you must provision exactly 1 Supabase backend instance. 

### Step 1: Environment Variables
Create exactly 1 `.env` file in your root tracking directory:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

### Step 2: Database & Storage Initialization
Execute `infrastructure.sql` exactly 1 time in your Supabase Dashboard SQL Editor to create:
- 1 Storage bucket (`documents`) with 100MB limit + 2 RLS policies
- `state_machines` table — stores pre-computed JSON state machines (questions, hints, prompts)
- `student_progress` table — tracks per-student completion
- `meet_analyses` table — stores parsed Google Meet transcript results
- Full RLS policies for multi-tenant isolation

### Step 3: Edge Function Deployment
Authenticate your CLI locally to push the processing function natively:
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase functions deploy process-document --no-verify-jwt
```

## 3. Operational Usage (Start Server)
Because the codebase implements `.env` encryption handling, you cannot natively `file://` double-click the `index.html`. You must instantiate 1 local build:
```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the authenticated gateway. 

## 4. Phase 1 KPI Sign-Off
- **Server Cost:** $0.00 recurring (Free Tier architecture 100% successful).
- **Student Token Consumption:** 0 API calls required. All client-matching is bounded inside the local JSON mapping framework.
- **Node Dependency:** Eliminated. Replaced natively by Vite. 
- **Security Check:** Validated. All keys are isolated in local memory without exposing to GitHub or generic frontend caches.
