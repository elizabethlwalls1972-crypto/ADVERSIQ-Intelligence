# Continual Harness Production Audit

Run: continual-harness-audit-2026-05-23T09-56-43-196Z
Generated: 2026-05-23T09:56:52.247Z
Files scanned: 790
Text files scanned: 745
Skipped binary/generated files: 45
Production status: needs-work

## Capability Checks
- PASS Trajectory window persistence: services/nsil/trajectory_logger.ts
- PASS Failure signature detector: services/nsil/failure_detector.ts
- PASS Reset-free refiner over formulas/layers/debate/memory: Refiner probe changes: 0
- PASS Prompt/subagent/skill/memory CRUD state: Harness adaptation changes: 8
- PASS Live global regional matter discovery: Live probe accepted 2/24 matters
- PASS Local terminal harness entrypoint: package.json scripts
- PASS Local server route exposes harness audit/live matters: server/routes/ai.ts
- PASS Decision Verification System avoids mandatory external approval gate: components/BWConsultantOS.tsx

## Findings
- HIGH placeholder components/AdminDashboard.tsx:78 - const ApiKeyInput = ({ label, value, onChange, placeholder }: any) => (
- HIGH placeholder components/BWConsultantSearchWidget.tsx:16 - placeholder?: string;
- HIGH placeholder components/CommandCenter.tsx:1546 - <p className="text-xs text-slate-500 mt-1">Exact scores and reasoning &mdash; no AI placeholder text</p>
- HIGH placeholder components/Gateway.tsx:91 - placeholder
- HIGH placeholder components/GlobalLocationIntelligence.tsx:217 - // ALWAYS do live research - never use static placeholder data
- HIGH placeholder components/GlobalLocationIntelligence_backup.tsx:244 - // ALWAYS do live research - never use static placeholder data
- HIGH placeholder components/Inquire.tsx:46 - // Add Placeholder for AI Response (Thinking State)
- HIGH placeholder components/Inquire.tsx:103 - newMsgs.pop(); // Remove thinking placeholder
- HIGH placeholder components/ReviewStep.tsx:4 - // Placeholder for services if they don't exist in the context
- HIGH human_loop components/ReviewStep.tsx:196 - Ethical Safeguard Engine: {ethicalData.passed ? 'Pass' : 'Review Required'}
- HIGH placeholder components/Services.tsx:76 - {/* Visual / Portrait Placeholder */}
- HIGH placeholder gemmaService.ts:98 - lower.includes('placeholder')
- HIGH placeholder scripts/comprehensive100Tests.mjs:467 - await this.page.locator('input[placeholder*="organization" i]').first().fill(scenario.org);
- HIGH placeholder scripts/comprehensive100Tests.mjs:510 - const cityInput = this.page.locator('input[placeholder*="city" i]').first();
- HIGH placeholder scripts/fullSystemTest.mjs:88 - const orgNameInput = page.locator('input[placeholder*="organization" i], input[placeholder*="entity" i]').first();
- HIGH placeholder scripts/fullSystemTest.mjs:155 - const cityInputs = page.locator('input[placeholder*="city" i]');
- HIGH placeholder server/index.ts:67 - // bedrock placeholder route removed — inference handled by /api/ai routes
- HIGH placeholder server/index.ts:316 - // bedrock placeholder route removed — all AI inference goes through /api/ai
- HIGH human_loop server/routes/augmentedAISupport.ts:87 - primaryUse: 'Human-in-the-loop AI workflow orchestration with stateful graph execution.',
- HIGH human_loop server/routes/strategicIntelligencePipeline.ts:87 - stage: 'Stage 5 — Human-in-the-loop Assurance',
- HIGH placeholder services/AIEmbeddingService.ts:35 - if (!key || key.length < 20 || lower.includes('your-') || lower.includes('placeholder')) {
- HIGH human_loop services/BWConsultantAgenticAI.ts:626 - const concerns = eng.nsilTopConcerns?.slice(0, 3).join('; ') || 'Review required';
- HIGH placeholder services/ComprehensiveIndicesEngine.ts:4 - * Implements ALL documented indices that were previously marked as "not implemented":
- HIGH human_loop services/algorithms/IntelligentDocumentGenerator.ts:882 - | Ethics Compliance | 15% | ${confidence >= 40 ? 'Within compliance bounds' : 'Review required'} |
- HIGH placeholder services/algorithms/IntelligentDocumentGenerator.ts:934 - > All formulas use CompositeScoreService real component data. No Math.random() or placeholder scoring.`;
- HIGH placeholder services/geminiService.ts:46 - if (lower.includes('your-') || lower.includes('your_') || lower.includes('placeholder') || lower.includes('key-here')) return false;
- HIGH placeholder services/groqService.ts:75 - lower.includes('placeholder')
- HIGH placeholder services/groqService.ts:100 - lower.includes('placeholder')
- HIGH placeholder services/multiSourceResearchService_v2.ts:185 - - Any placeholder or vague text
- HIGH human_loop services/openSanctionsService.ts:32 - clearanceLevel: 'Clear' | 'Review Required' | 'High Risk' | 'Blocked';
- HIGH human_loop services/openSanctionsService.ts:53 - if (hits.some(h => h.isPEP)) return 'Review Required';
- HIGH placeholder services/togetherAIService.ts:77 - lower.includes('placeholder')
- HIGH placeholder services/togetherAIService.ts:101 - if (!key || key.length < 20 || lower.includes('your-') || lower.includes('your_') || lower.includes('key-here') || lower.includes('placeholder')) {
- MEDIUM demo_path components/AttractWorkspace.tsx:24 - View Demo
- MEDIUM demo_path components/AttractWorkspace.tsx:314 - No onboarding required. Try a live demo or contact us for a pilot.
- MEDIUM claim_risk components/BWConsultantOS.tsx:6653 - table { width: 100%; border-collapse: collapse; margin-top: 8px; }
- MEDIUM claim_risk components/BWConsultantSearchWidget.tsx:129 - backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(15, 23, 42, 0.7) 100%), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop&q=80')`,
- MEDIUM claim_risk components/CommandCenter.tsx:336 - style={{ filter: 'grayscale(100%)' }}
- MEDIUM claim_risk components/CommandCenter.tsx:340 - @keyframes heroColor { 0%,100%{color:#ff3366} 25%{color:#00d4ff} 50%{color:#facc15} 75%{color:#a855f7} }
- MEDIUM claim_risk components/CommandCenter.tsx:381 - @keyframes colorCycle1 { 0%,100%{color:#ff3366} 20%{color:#ff9500} 40%{color:#00d4ff} 60%{color:#a855f7} 80%{color:#22d3ee} }
- MEDIUM claim_risk components/CommandCenter.tsx:382 - @keyframes colorCycle2 { 0%,100%{color:#00d4ff} 20%{color:#ff3366} 40%{color:#facc15} 60%{color:#22d3ee} 80%{color:#a855f7} }
- MEDIUM claim_risk components/CommandCenter.tsx:383 - @keyframes colorCycle3 { 0%,100%{color:#facc15} 20%{color:#22d3ee} 40%{color:#ff3366} 60%{color:#ff9500} 80%{color:#a855f7} }
- MEDIUM claim_risk components/CommandCenter.tsx:384 - @keyframes colorCycle4 { 0%,100%{color:#a855f7} 20%{color:#facc15} 40%{color:#22d3ee} 60%{color:#ff3366} 80%{color:#00d4ff} }
- MEDIUM claim_risk components/CommandCenter.tsx:385 - @keyframes colorCycle5 { 0%,100%{color:#22d3ee} 20%{color:#a855f7} 40%{color:#ff9500} 60%{color:#facc15} 80%{color:#ff3366} }
- MEDIUM claim_risk components/CommandCenter.tsx:1544 - <p className="text-3xl font-bold text-emerald-700 mb-1">100%</p>
- MEDIUM claim_risk components/DealMarketplace.tsx:52 - title: 'UAE 100% Foreign Ownership',
- MEDIUM claim_risk components/DealMarketplace.tsx:57 - description: 'Free Zone Authority program allowing 100% foreign ownership in UAE Free Zones with zero corporate tax',
- MEDIUM demo_path components/DealMarketplace.tsx:150 - terms: ['3-month program', 'Mentorship', 'Demo day + investor connections', 'Tech talent sponsorship'],
- MEDIUM claim_risk components/GlobalLocationIntelligence.tsx:661 - table { width: 100%; border-collapse: collapse; margin: 12px 0; }
- MEDIUM claim_risk components/GlobalLocationIntelligence_backup.tsx:437 - table { width: 100%; border-collapse: collapse; margin: 12px 0; }
- MEDIUM claim_risk components/GlobalMarketComparison.tsx:109 - availableIncentives: ['100% Ownership', 'No Corporate Tax', 'Visa Incentives'],
- MEDIUM demo_path components/HistoricalContextComponent.tsx:18 - // Lower threshold slightly to ensure matches appear in demo
- MEDIUM demo_path components/IntegrationExportFramework.tsx:187 - --- Sample Data ---
- MEDIUM demo_path components/LegalDocuments.tsx:770 - <p>3.4. <strong>Code Integrity:</strong> The platform includes continual harness audit tooling that scans for unfinished runtime paths, demo data paths, human-loop gates, and unsupported capability claims. Key verified components include: t
- MEDIUM claim_risk components/MarketDiversificationDashboard.tsx:126 - <ResponsiveContainer width="100%" height="100%">
- MEDIUM claim_risk components/MasterAutonomousOrchestrator.tsx:144 - <h3 className="text-lg font-semibold mb-2">100% Performance Mode</h3>
- MEDIUM claim_risk components/MasterAutonomousOrchestrator.tsx:258 - 🚀 Start 100% Orchestration
- MEDIUM claim_risk components/PartnershipRepository.tsx:193 - frequency: '100%',
- MEDIUM claim_risk components/PartnershipRepository.tsx:198 - frequency: '100%',
- MEDIUM claim_risk components/PartnershipRepository.tsx:203 - frequency: '100%',
- MEDIUM claim_risk components/PartnershipRepository.tsx:221 - frequency: '100%',
- MEDIUM claim_risk components/PartnershipRepository.tsx:226 - frequency: '100%',
- MEDIUM claim_risk components/PartnershipRepository.tsx:231 - frequency: '100%',
- MEDIUM demo_path components/ProfileStep.tsx:64 - // Mock file upload handling
- MEDIUM demo_path components/QualityAnalysis.tsx:43 - // Mock data if no API key
- MEDIUM claim_risk components/QualityAnalysis.tsx:146 - <ResponsiveContainer width="100%" height="100%">
- MEDIUM claim_risk components/QualityAnalysis.tsx:149 - outerRadius="100%"
- MEDIUM demo_path components/ReviewStep.tsx:106 - // Mock speech generation
- MEDIUM demo_path components/ReviewStep.tsx:111 - setIsPlaying(false); // Reset immediately for demo as we don't have real audio
- MEDIUM demo_path components/RocketEngineModule.tsx:38 - population: 10000000, // Mock default
- MEDIUM demo_path components/RocketEngineModule.tsx:39 - gdp: 50000000000, // Mock default
- MEDIUM claim_risk components/ScenarioSimulator.tsx:149 - <ResponsiveContainer width="100%" height="100%" minHeight={250}>
- MEDIUM claim_risk components/SupportProgramsDatabase.tsx:69 - { id: 'innovate-uk', name: 'Innovate UK EDGE', provider: 'Innovate UK', country: 'Poland', type: 'Grant', industry: ['All'], stage: 'Growth', fundingAmount: 500000, fundingType: '100% grant', requirements: ['UK-based', 'Innovation project']
- MEDIUM claim_risk components/UserManual.tsx:616 - ADVERSIQ is 100% dedicated to regional growth. During this beta phase and in future subscriptions, we commit that <strong className="text-white">10% of every paid transaction</strong> will be directed back into initiatives that support regi
- MEDIUM demo_path components/WorkbenchFeature.tsx:137 - {/* The Visual Demo (Split Screen) */}
- MEDIUM claim_risk constants/commandCenterData.ts:130 - financialStructure: "100% equity raise at $40M pre-money valuation. Revenue model: $15,000/month base license + $0.02 per transaction for volumes above 100K/month. 47 banks in pilot, 12 signed LOIs.",
- MEDIUM demo_path constants/letterLibrary.ts:319 - // LETTER TEMPLATES LIBRARY (Subset for demonstration)
- MEDIUM claim_risk constants/systemMetadata.ts:106 - detailed: 'Total Addressable Market is the maximum potential revenue for your business if you captured 100% of your target market.',
- MEDIUM demo_path demonstrate_nsil_learning.py:365 - # Initialize demo
- MEDIUM demo_path demonstrate_nsil_learning.py:366 - demo = SimpleNSILDemo()

## Live Probe
Accepted matters: 2/24
- 68/100 Da Nang Manufacturing: FDI capital gap
- 69/100 Coimbatore Manufacturing: FDI capital gap