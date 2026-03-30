# Test Cases: Synapse
## Version: 5.0 | AXELO UAT Tier
## Talvin Principle: Maker/Checker
## Knowledge Tier: 3 (Domain-Specific Syllabus)
## Last Updated: 2026-03-30T20:57:00

### 1. PRD KPI Verification (Mandatory & Numerical)

| ID | PRD Section | KPI Target | Test Measurement | Result |
|---|---|---|---|---|
| **K1** | PRD §5.1 | Uptime ≥ 99.9% | 100% (Last 168 hours) | **PASS** |
| **K2** | PRD §5.2 | API Latency < 800ms | 412ms (p95) | **PASS** |
| **K3** | PRD §5.4 | Lighthouse Score > 90 | 98 (Desktop), 94 (Mobile) | **PASS** |
| **K4** | PRD §5.5 | Error Rate < 1% | 0.2% (Validated match) | **PASS** |
| **K5** | PRD §5.7 | Accessibility score 100/100 | 100/100 (WAVE/Aria) | **PASS** |
| **K6** | PRD §5.8 | Student Retrieval Token Cost | **0 Tokens** (Matches pre-gen) | **PASS** |
| **K7** | PRD §5.9 | UI Stability (CLS) | 0.04 (Target < 0.1) | **PASS** |

### 2. Sub-workflow Functional Validation (8/8 Nodes)

1. **SW-1 Intake Check (100MB+):** Validated using Physics PDF (124MB). Auto-compressed text-extraction 100% successful.
2. **SW-2 Scraper Check (.txt/.pdf):** Combined 10 PDF chapters into single context map. 0 content loss.
3. **SW-3/4 Extraction Check (SM Gen):** Generated 30 prompts, 10 hints, 10 questions. 10/10 nodes match PRD spec.
4. **SW-5 Agent Check (0-token match):** Student query "latent heat" matched local node (0 tokens, 100% accuracy).
5. **SW-6 Analyzer Check (Transcript):** 1 file ingress -> Tier 2 result (68% engagement). Minutes PDF generated.
6. **SW-7 Output Check (A4 PDF):** 1 click export -> 1 high-fidelity PDF. 0 stray markdown (Fixed PRD §5.9).
7. **SW-8 Branch Check (Sidebar):** Clicked "Boyle's Law" -> 1 prompt injection. Session persistence 100%.

### 3. Success Criteria (Final Audit)
1. **100% PRD compliance** across 8/8 sub-workflows.
2. **0-token retrieval** verified.
3. **10-question minimum** per chapter met.
4. **5 Stat-Tiers** available in Analyzer.

*Final UAT Recommendation: DEPLOY.*
