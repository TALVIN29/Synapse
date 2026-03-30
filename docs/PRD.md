# Product Requirements Document (PRD): Synapse
## Version: 3.0 | AXELO Governance Layer 3
## Talvin Principle: Maker/Checker (PRD §4.1)
## Knowledge Tier: 3 (Domain-Specific Syllabus) (PRD §4.3)
## Last updated: 2026-03-26T22:25:00

## 1. System Intent & Instructions
The system must operate as a zero-maintenance syllabus orchestrator. 
- **AI Agent Constraint:** You must only generate questions/hints based on the uploaded text.
- **Agent Constraint:** If a student query has 0% keyword match with pre-computed nodes → refuse to answer.
- **Instruction:** All student interactions must be 100% deterministic (0-token retrieve).

## 2. Aesthetic Spec (AXELO ARCHITECT §2.1)
- **Palette:** Slate-900 (Backgrounds), Primary-600 (Actions), Emerald-500 (Success), Amber-400 (Hints).
- **Typography:** Inter (Sans-serif, 300 to 700 weights).
- **Layout:** Glassmorphism dashboard with fixed sidebar for revision prompts.
- **Animations:** AOS (Fade-in-up) for all dynamic lists.

## 3. Section-by-Section Functional Spec
### 3.1 Tutor Dashboard
- **File Intake:** Drag-and-drop zone for 100MB+ PDF/TXT.
- **Nota Preview:** A4-standard Preview Modal confirming extraction before DB sync.
- **Meet Analyzer:** Interactive analytics panel for Stat-Tiers (1-5).
### 3.2 Student Portal
- **Socratic Agent:** Chat interface using local string-matching against `state_machines`.
- **Revision Sidebar:** Dynamic loading of 30 guided prompts per session.

## 4. Data Integration Map
- **Doc-to-Text:** Client-side `pdf.js` pipe → Base64 Store.
- **Text-to-SM:** Edge Function → SQL Insert (`state_machines`).
- **SM-to-Student:** SQL Select → Local JSON Object → Local Lookup.

## 5. Industry-Standard KPIs (Mandatory & Numerical)
1. **Uptime Target:** ≥ 99.9%.
2. **API Latency (p95):** < 800ms.
3. **Extraction Latency:** < 15s/chapter.
4. **Lighthouse Performance:** > 90.
5. **Retrieval Error Rate:** < 1% (Matched queries).
6. **Data Completeness:** 100% (Q/A/Hint triplets).
7. **Accessibility Score:** 100/100.
8. **Token Efficiency (Student):** 0 Tokens per query.
9. **UI Stability:** 0 layout shifts (CLS < 0.1).

## 6. Success Criteria (Zero Adjectives)
1. **100% PRD compliance** across all 8 modular sub-workflows.
2. **0-token student retrieval** verified via audit.
3. **10-question minimum** for every extracted syllabus chapter.
4. **5 Stat-Tiers** available for every Meet analysis.
