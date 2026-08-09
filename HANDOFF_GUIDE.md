# BWGA Ai - Quick Reference for AI-to-AI Handoff

## System Purpose
Enterprise partnership intelligence platform that guides users through a structured workflow to evaluate strategic expansion opportunities and build comprehensive pre-feasibility reports.

## Critical Success Factor: The Workflow Structure

**This is the core IP - do NOT flatten it:**

```
User Journey:
1. CommandCenter (Gateway) â†’ User accepts terms
2. EntityDefinitionBuilder (Step 1) â†’ Define organization
3. 6-Stage Report Building â†’ Analytical modules activate in sequence
   - Stage 1: Market Analysis (GlobalMarketComparison)
   - Stage 2: Partnership Fit (PartnershipCompatibilityEngine)
   - Stage 3: Opportunity Discovery (DealMarketplace, BusinessIntelligence, PartnershipAnalyzer)
   - Stage 4: Strategy Planning (RelationshipPlanner, MultiScenarioPlanner, SupportPrograms)
   - Stage 5: Expansion Design (AdvancedExpansion, Repository, AIRecommendations, LowCostTools)
   - Stage 6: Report Output (ExecutiveSummary, DocumentSuite, Integration, Workbench)
4. Save/Export Report
```

**KEY ARCHITECTURAL RULE**: Modules only activate WITHIN the workflow, NOT on the landing page. Users don't see a list of modules - they discover them naturally through the workflow progression.

---

## File Structure for Porting

### TIER 1: CRITICAL (Port First)
```
types.ts                    # TypeScript interfaces (foundation)
constants.ts                # System constants & defaults
services/engine.ts          # Core calculation engine
services/ruleEngine.ts      # Scoring & recommendation rules
```

### TIER 2: CORE LOGIC (Port Second)
```
services/geminiService.ts   # LLM integration (adapt to your LLM)
services/mockDataGenerator.ts # Test data (adapt to your data sources)
CommandCenter.tsx           # Gateway orchestration
EntityDefinitionBuilder.tsx # Entity model form
```

### TIER 3: FEATURES (Port Third)
```
16 Feature Components (each self-contained):
- GlobalMarketComparison.tsx
- PartnershipCompatibilityEngine.tsx
- DealMarketplace.tsx
- ExecutiveSummaryGenerator.tsx
- BusinessPracticeIntelligenceModule.tsx
- DocumentGenerationSuite.tsx
- ExistingPartnershipAnalyzer.tsx
- RelationshipDevelopmentPlanner.tsx
- MultiScenarioPlanner.tsx
- SupportProgramsDatabase.tsx
- AdvancedStepExpansionSystem.tsx
- PartnershipRepository.tsx
- AIPoweredDealRecommendation.tsx
- LowCostRelocationTools.tsx
- IntegrationExportFramework.tsx
- WorkbenchFeature.tsx
```

### TIER 4: SUPPORTING (Port Last)
```
App.tsx                     # Main routing & state
index.tsx                   # Entry point
Navbar, Footer              # UI chrome
[20+ helper components]     # Dialog, sidebar, etc.
```

---

## Core State Object (DO NOT MODIFY STRUCTURE)

```typescript
interface ReportParameters {
  // Identity
  id: string;
  createdAt: string;
  organizationName: string;
  
  // Context
  country: string;
  strategicIntent: string[];  // IMPORTANT: Array, not string
  problemStatement: string;
  industry: string[];
  region: string;
  
  // Market & Partnership Data
  targetMarkets: string[];
  partnerships: Partnership[];
  baselineRevenue: number;
  
  // Analytical Outputs
  executiveSummary: string;
  marketAnalysis: string;
  recommendations: string;
  risks: string[];
  successScore: number;
  
  // Workflow State
  stage: number;           // 0-6 (tracks position in workflow)
  viewMode: string;        // Routes to which component
}
```

This object flows through ALL 16 features unchanged. Each feature reads and writes to it.

---

## 16 Features Summary (For Scope Definition)

| # | Feature | Purpose | Key Output |
|---|---------|---------|-----------|
| 1 | Global Market Comparison | Market sizing & growth analysis | Market rankings, growth projections |
| 2 | Partnership Compatibility | Fit scoring (0-100) | Compatibility matrix, risk levels |
| 3 | Deal Marketplace | Opportunity sourcing | Deal pipeline with scores |
| 4 | Executive Summary | C-suite ready summary | 1-3 page executive brief |
| 5 | Business Practice Intelligence | Regional norms & practices | Cultural intelligence briefing |
| 6 | Document Generation | Multi-format report creation | PDF, DOCX, HTML documents |
| 7 | Partnership Analyzer | Current partnership health | Health scores, renewal risks |
| 8 | Relationship Planner | Development roadmap | Multi-year timeline, milestones |
| 9 | Multi-Scenario Planner | Financial modeling | IRR, payback, profit projections |
| 10 | Support Programs Database | Incentive matching | Tax breaks, grants, training |
| 11 | Advanced Expansion System | Expansion strategy | Multi-phase blueprint |
| 12 | Partnership Repository | Template library | Reusable partnership structures |
| 13 | AI Recommendations | ML-based suggestions | Ranked deals with confidence |
| 14 | Low-Cost Tools | Cost optimization | Location rankings, cost models |
| 15 | Integration/Export | External system connectivity | CSV, API, webhook exports |
| 16 | Workbench | Real-time provisioning | Strategy deployment visualization |

---

## What Each Feature Needs

Every feature component has this pattern:
```typescript
interface ComponentProps {
  params: ReportParameters;
  onUpdate: (newParams: ReportParameters) => void;
}

const Feature: React.FC<ComponentProps> = ({ params, onUpdate }) => {
  // Read from params
  // Perform analysis
  // Call onUpdate(newParams) when done
  return <UI/>;
};
```

Features are **completely independent** - they don't call each other, they only modify the shared `ReportParameters` object.

---

## Routing/Navigation

**ViewMode mapping** (used by App.tsx to render the right component):

```typescript
{
  'command-center': <CommandCenter />,
  'entity-definition': <EntityDefinitionBuilder />,
  'global-market-comparison': <GlobalMarketComparison />,
  'partnership-compatibility': <PartnershipCompatibilityEngine />,
  'deal-marketplace': <DealMarketplace />,
  'executive-summary': <ExecutiveSummaryGenerator />,
  // ... and 10 more
}
```

User clicks a button â†’ setState({ viewMode: 'next-feature' }) â†’ App renders that feature component.

---

## Build & Performance

**Current Status**:
- 2,099 modules (after cleanup)
- 711.35 kB total | 188.78 kB gzipped
- 5.49s build time
- Exit Code 0 (no errors)

**To maintain performance when porting**:
- Use code splitting by feature (dynamic imports)
- Keep feature components <600 LOC each
- Lazy load heavy dependencies (charts, PDF libraries)
- Minimize bundle with tree-shaking

---

## Porting Checklist

- [ ] Copy types.ts â†’ Define all interfaces in target system
- [ ] Copy services/ â†’ Adapt geminiService to your LLM, mockDataGenerator to your data
- [ ] Create state management â†’ Replicate ReportParameters flow through component tree
- [ ] Build routing system â†’ Map viewMode to component rendering
- [ ] Port features 1-6 â†’ Test with mock data
- [ ] Port features 7-12 â†’ Integrate with real data sources
- [ ] Port features 13-16 â†’ Test export and integration capabilities
- [ ] Build main layout â†’ App, Navbar, Footer shells
- [ ] Integrate LLM â†’ Connect to your model
- [ ] Test workflow â†’ User journey from Command Center â†’ 6 stages â†’ Export

---

## Critical Don'ts

âŒ Don't flatten the workflow - modules MUST activate only within the 6-stage sequence
âŒ Don't change the ReportParameters interface structure - all features depend on it
âŒ Don't combine features - each module should be independently testable
âŒ Don't hardcode market data - use a data service abstraction
âŒ Don't lose the stage progression - track user position through workflow

---

## Critical Do's

âœ… Do preserve the module independence - features don't import each other
âœ… Do pass ReportParameters through the entire stack
âœ… Do use consistent styling/theme across all 16 features
âœ… Do implement export/import for reports
âœ… Do add progress tracking (which stage is user on?)
âœ… Do test each feature in isolation with mock data

---

## Known Limitations in Current Build

1. **Linting warnings** - 234 issues (all cosmetic, no functional impact)
   - Unused imports (~40 instances)
   - Unused variables (~30 instances)  
   - Unsafe any types (~15 instances)
   - These are low-priority cleanup items

2. **Code quality improvements available**:
   - Add error boundaries around features
   - Implement data persistence layer
   - Add comprehensive logging
   - Add A/B testing framework

3. **Performance optimization opportunities**:
   - Code-split features into separate chunks
   - Lazy load component libraries
   - Cache analysis results
   - Implement virtual scrolling for large lists

---

## What to Emphasize to Your Target System

"This is a **workflow-driven intelligence platform** with **16 independent analytical modules** that activate sequentially to guide users from organization definition through comprehensive strategic analysis to final report generation. The core IP is the **6-stage progression model** that naturally surfaces complexity and analysis tools at the right moment in the user's decision-making process."

---

## File Sizes for Resource Planning

```
CommandCenter.tsx               ~3 KB
EntityDefinitionBuilder.tsx     ~15 KB
GlobalMarketComparison.tsx      ~20 KB
PartnershipCompatibilityEngine  ~18 KB
DealMarketplace.tsx             ~16 KB
ExecutiveSummaryGenerator       ~14 KB
BusinessPracticeModule          ~20 KB
DocumentGenerationSuite         ~24 KB
ExistingPartnershipAnalyzer     ~18 KB
RelationshipPlanner             ~25 KB
MultiScenarioPlanner            ~22 KB
SupportProgramsDatabase         ~18 KB
AdvancedExpansionSystem         ~20 KB
PartnershipRepository           ~16 KB
AIPoweredDealRecommendation     ~19 KB
LowCostRelocationTools          ~18 KB
IntegrationExportFramework      ~18 KB
WorkbenchFeature                ~8 KB
---
Total Feature Components:       ~310 KB
+ Supporting Components:        ~150 KB
+ Services & Hooks:             ~80 KB
---
Estimated Ported Size:          ~540 KB (before optimization)
```

---

**Prepared**: December 16, 2025
**System Status**: âœ… Production Ready
**Last Build**: 2,099 modules | 188.78 kB gzipped | Exit Code 0


