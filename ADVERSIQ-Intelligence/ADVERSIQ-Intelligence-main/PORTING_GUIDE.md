# BWGA Ai - Step-by-Step Porting Guide for Another System

## Phase 1: Preparation & Planning (2-4 hours)

### Step 1.1: Review & Extract Core IP
- [ ] Read SYSTEM_ARCHITECTURE.md
- [ ] Study ARCHITECTURE_DIAGRAMS.md
- [ ] Review HANDOFF_GUIDE.md
- [ ] Download all source files from this codebase
- [ ] Identify your target tech stack (Vue, Angular, Svelte, backend-driven, etc.)

### Step 1.2: Set Up New Project Structure
```
your-new-project/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ types/              # Copy from types.ts
â”‚   â”‚   â””â”€â”€ index.ts        # All interfaces
â”‚   â”œâ”€â”€ constants/          # Copy from constants.ts
â”‚   â”‚   â””â”€â”€ index.ts        # System defaults
â”‚   â”œâ”€â”€ services/           # Adapt from services/
â”‚   â”‚   â”œâ”€â”€ api.ts          # Replace geminiService
â”‚   â”‚   â”œâ”€â”€ engine.ts       # Copy (platform-agnostic)
â”‚   â”‚   â”œâ”€â”€ ruleEngine.ts   # Copy (platform-agnostic)
â”‚   â”‚   â””â”€â”€ dataService.ts  # Replace mockDataGenerator
â”‚   â”œâ”€â”€ features/           # 16 Feature modules
â”‚   â”‚   â”œâ”€â”€ marketAnalysis/
â”‚   â”‚   â”œâ”€â”€ compatibility/
â”‚   â”‚   â”œâ”€â”€ dealMarketplace/
â”‚   â”‚   â”œâ”€â”€ ... (13 more)
â”‚   â”œâ”€â”€ components/         # UI Components
â”‚   â”‚   â”œâ”€â”€ CommandCenter
â”‚   â”‚   â”œâ”€â”€ EntityDefinition
â”‚   â”‚   â”œâ”€â”€ Layouts/
â”‚   â”‚   â””â”€â”€ Common/
â”‚   â”œâ”€â”€ store/              # State management
â”‚   â”‚   â”œâ”€â”€ reportStore.ts  # ReportParameters state
â”‚   â”‚   â””â”€â”€ uiStore.ts      # ViewMode routing
â”‚   â”œâ”€â”€ utils/              # Helpers & utilities
â”‚   â”œâ”€â”€ App.tsx             # Root component
â”‚   â””â”€â”€ index.tsx           # Entry point
â”œâ”€â”€ public/
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â””â”€â”€ README.md
```

---

## Phase 2: Core Infrastructure (4-6 hours)

### Step 2.1: Port Types & Interfaces
**Source**: `types.ts`

```typescript
// your-new-project/src/types/index.ts

// CRITICAL: Copy exactly as-is
export interface ReportParameters {
  id: string;
  createdAt: string;
  organizationName: string;
  userName: string;
  userDepartment: string;
  country: string;
  strategicIntent: string[];  // IMPORTANT: Array
  problemStatement: string;
  industry: string[];
  region: string;
  
  // ... all 70+ fields ...
  
  stage: number;              // 0-7: Workflow position
  viewMode: string;           // Route to which component
  neuroSymbolicState?: NeuroSymbolicState;
}

// Port ALL secondary interfaces too:
export interface Partnership { ... }
export interface MarketData { ... }
export interface DealOpportunity { ... }
export interface ScenarioData { ... }
export interface SupportProgram { ... }
export interface RecommendationData { ... }
// ... and 20+ more
```

**Validation**:
- [ ] All 70+ fields present
- [ ] No fields renamed or removed
- [ ] Optional fields marked with `?`
- [ ] No modifications to structure

### Step 2.2: Port Constants
**Source**: `constants.ts`

```typescript
// your-new-project/src/constants/index.ts

export const INITIAL_PARAMETERS: ReportParameters = {
  // Copy initial state exactly
  id: '',
  createdAt: '',
  organizationName: '',
  // ... set all fields to defaults ...
};

export const REGIONS = ['Southeast Asia', 'East Africa', ...];
export const INDUSTRIES = ['Manufacturing', 'Technology', ...];
export const ORGANIZATION_TYPES = ['Corporate', 'Government', ...];
```

**Validation**:
- [ ] All constants copied
- [ ] Default values match original
- [ ] Enums/lists complete

### Step 2.3: Set Up State Management
**Adapt based on your target framework**

#### For Vue:
```javascript
// src/store/reportStore.ts
import { reactive, ref } from 'vue';
import { ReportParameters } from '@/types';
import { INITIAL_PARAMETERS } from '@/constants';

export const reportState = reactive<{
  params: ReportParameters;
  savedReports: ReportParameters[];
  viewMode: string;
}> = {
  params: { ...INITIAL_PARAMETERS },
  savedReports: [],
  viewMode: 'command-center'
};

export const updateParams = (newParams: ReportParameters) => {
  reportState.params = newParams;
};

export const setViewMode = (mode: string) => {
  reportState.viewMode = mode;
};
```

#### For Angular:
```typescript
// src/store/report.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ReportService {
  private paramsSubject = new BehaviorSubject<ReportParameters>(INITIAL_PARAMETERS);
  params$ = this.paramsSubject.asObservable();
  
  updateParams(params: ReportParameters) {
    this.paramsSubject.next(params);
  }
}
```

**Validation**:
- [ ] State initialized with INITIAL_PARAMETERS
- [ ] Getter/setter for params
- [ ] Getter/setter for viewMode
- [ ] Getter/setter for savedReports

### Step 2.4: Set Up Routing/Navigation
**The core flow that MUST NOT CHANGE:**

```
'command-center' â†’ CommandCenter component
'entity-definition' â†’ EntityDefinitionBuilder
'global-market-comparison' â†’ Feature 1
'partnership-compatibility' â†’ Feature 2
... (19 more routes)
```

#### For Vue Router:
```typescript
// src/router/index.ts
const routes = [
  { path: '/', redirect: '/command-center' },
  { path: '/command-center', component: CommandCenter },
  { path: '/entity-definition', component: EntityDefinitionBuilder },
  { path: '/global-market-comparison', component: GlobalMarketComparison },
  // ... 19 more
];
```

#### For Angular Router:
```typescript
// src/app/app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: '/command-center', pathMatch: 'full' },
  { path: 'command-center', component: CommandCenterComponent },
  { path: 'entity-definition', component: EntityDefinitionComponent },
  // ... 19 more
];
```

**Validation**:
- [ ] 23 total routes defined
- [ ] Proper redirects
- [ ] Lazy loading for features (optional but recommended)

---

## Phase 3: Services & Business Logic (3-5 hours)

### Step 3.1: Port Core Engine (Unchanged)
**Source**: `services/engine.ts`

âœ… **COPY EXACTLY** - This is platform-agnostic business logic

```typescript
// your-new-project/src/services/engine.ts
// Copy all functions:
export const calculateCompatibilityScore = (entity, partner) => { ... }
export const calculateIRR = (investment, cashFlows) => { ... }
export const evaluateRiskLevel = (metrics) => { ... }
// ... etc
```

### Step 3.2: Port Rule Engine (Unchanged)
**Source**: `services/ruleEngine.ts`

âœ… **COPY EXACTLY** - Platform-agnostic evaluation rules

```typescript
// your-new-project/src/services/ruleEngine.ts
export const applyCompatibilityRules = (scores) => { ... }
export const generateRecommendations = (analysis) => { ... }
export const evaluateExpansionFit = (factors) => { ... }
```

### Step 3.3: Adapt LLM/API Service
**Source**: `services/geminiService.ts`

âš ï¸ **MUST ADAPT** - Replace with your LLM integration

```typescript
// your-new-project/src/services/aiService.ts

// Option 1: OpenAI
export const generateInsights = async (query: string, context: ReportParameters) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: buildPrompt(query, context) }],
    })
  });
  return response.json();
};

// Option 2: Anthropic Claude
export const generateInsights = async (query: string, context: ReportParameters) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 2048,
    messages: [{ role: 'user', content: buildPrompt(query, context) }],
  });
  return message.content[0];
};

// Option 3: Your custom backend
export const generateInsights = async (query: string, context: ReportParameters) => {
  const response = await fetch('/api/insights', {
    method: 'POST',
    body: JSON.stringify({ query, context }),
  });
  return response.json();
};
```

### Step 3.4: Adapt Data Service
**Source**: `services/mockDataGenerator.ts`

âš ï¸ **MUST ADAPT** - Connect to real data sources

```typescript
// your-new-project/src/services/dataService.ts

export const fetchMarketData = async (country: string) => {
  // Replace with real API calls
  const response = await fetch(`/api/markets/${country}`);
  return response.json();
};

export const fetchPartnershipDatabase = async (filters: any) => {
  // Connect to your partnership database
  const response = await fetch('/api/partnerships', { body: JSON.stringify(filters) });
  return response.json();
};

export const fetchSupportPrograms = async (country: string, industry: string) => {
  // Connect to your incentive/support database
  const response = await fetch(`/api/programs?country=${country}&industry=${industry}`);
  return response.json();
};
```

**Validation**:
- [ ] Engine.ts copied without modification
- [ ] RuleEngine.ts copied without modification
- [ ] AI service adapted to your LLM
- [ ] Data service connected to real data sources

---

## Phase 4: Feature Components (8-12 hours)

### Step 4.1: Port CommandCenter (Gateway)
**Source**: `CommandCenter.tsx` (161 lines)

**What to change**:
- Framework-specific syntax (useEffect â†’ lifecycle)
- Import paths
- State management calls (useState â†’ your store)
- Class names if using different CSS framework

**What NOT to change**:
- UI text ("Nexus Intelligence OS v4.2")
- 3-step process explanation
- 7 compliance terms
- Button labels ("Begin Entity Definition")
- Layout structure

```
If using Vue:
- Replace useState with reactive/ref
- Replace useEffect with onMounted
- Replace className with :class
- Import from your router for navigation

If using Angular:
- Replace React component with Angular component
- Add OnInit, OnDestroy lifecycle
- Use *ngFor/*ngIf for conditionals
- Use [ngClass] for dynamic classes
- Inject Router for navigation
```

### Step 4.2: Port EntityDefinitionBuilder
**Source**: `EntityDefinitionBuilder.tsx` (549 lines)

**Keep Exactly**:
- All form fields (20+)
- Section expandability
- Data structure (EntityProfile interface)
- Validation logic

**Adapt**:
- Form input components (your framework)
- State management (your store)
- Styling/theme

### Step 4.3: Port Feature Components (1-16)
**Source**: Individual feature files (16 components)

Each feature follows same pattern:
1. Read from ReportParameters
2. Analyze data
3. Update ReportParameters
4. Display results

**For each feature**:
```typescript
// Pseudo-code (your-framework syntax)

component FeatureName {
  // 1. Read params from store
  const params = useStore().params;
  
  // 2. Compute results
  const analysis = analyzeData(params);
  
  // 3. Define update handler
  const handleSave = () => {
    const updated = { ...params, results: analysis };
    store.updateParams(updated);
    router.push(nextRoute);
  };
  
  // 4. Render UI
  return <FeatureUI data={analysis} onSave={handleSave} />;
}
```

**Port Order (Complexity ascending)**:
1. âœ… GlobalMarketComparison (simple table/charts)
2. âœ… PartnershipCompatibilityEngine (scoring algorithm)
3. âœ… DealMarketplace (list + filtering)
4. âœ… ExecutiveSummaryGenerator (text generation)
5. âœ… BusinessPracticeIntelligenceModule (analysis display)
6. âœ… DocumentGenerationSuite (export logic)
7. âœ… ExistingPartnershipAnalyzer (data analysis)
8. âœ… RelationshipDevelopmentPlanner (timeline UI)
9. âœ… MultiScenarioPlanner (financial modeling)
10. âœ… SupportProgramsDatabase (matching algorithm)
11. âœ… AdvancedStepExpansionSystem (complex form)
12. âœ… PartnershipRepository (template system)
13. âœ… AIPoweredDealRecommendation (ML integration)
14. âœ… LowCostRelocationTools (cost modeling)
15. âœ… IntegrationExportFramework (API/export)
16. âœ… WorkbenchFeature (real-time visualization)

**Validation per Feature**:
- [ ] Reads from ReportParameters correctly
- [ ] Performs analysis/computation
- [ ] Updates ReportParameters
- [ ] Routes to next stage
- [ ] Displays results clearly

---

## Phase 5: UI Framework & Styling (4-6 hours)

### Step 5.1: Choose CSS Framework
**Original**: TailwindCSS

**Your options**:
- âœ… Keep TailwindCSS (recommended - easy port)
- âœ… Migrate to Bootstrap
- âœ… Migrate to Material Design
- âœ… Migrate to custom CSS

If keeping TailwindCSS:
- Copy all tailwind.config.js settings
- Import Tailwind in CSS
- Copy color palette (bw-navy, bw-gold)
- Reuse utility classes

If migrating:
- Map color classes
- Update component layouts
- Adapt responsive breakpoints
- Test on mobile devices

### Step 5.2: Theme & Branding
**Key colors**:
- `bw-navy`: #1a1a1a
- `bw-gold`: #d4af37
- Stone palette: stone-50 to stone-900
- Status colors: green, blue, red, orange

Map to your framework:
```scss
// your-new-project/src/styles/theme.scss

$primary: #1a1a1a;      // navy
$accent: #d4af37;       // gold
$success: #22c55e;      // green
$warning: #f97316;      // orange
$danger: #ef4444;       // red
```

### Step 5.3: Layout Components
Minimal set to build:
- [ ] Navbar (top navigation)
- [ ] Footer (bottom info)
- [ ] Sidebar (navigation panel)
- [ ] Modal/Dialog (for user flows)
- [ ] Card (content container)
- [ ] Button (action triggers)
- [ ] Form Input (text, select, checkbox)
- [ ] Table (data display)

---

## Phase 6: Integration & Testing (4-8 hours)

### Step 6.1: Wire Everything Together

**Test the flow**:
```
1. Load app â†’ CommandCenter displays
2. Click "Begin Entity Definition" â†’ Router navigates
3. Fill organization form â†’ State updates
4. Submit â†’ Route to Stage 1
5. Each feature reads params â†’ calculates â†’ updates params
6. Progress through all 6 stages
7. Export report â†’ Download/Save succeeds
8. Can load saved report â†’ State restores
```

### Step 6.2: Test Each Feature

For each of 16 features:
- [ ] Renders without errors
- [ ] Reads ReportParameters correctly
- [ ] Performs calculations
- [ ] Updates ReportParameters
- [ ] Routes to next feature
- [ ] Data persists across back/forward navigation

### Step 6.3: Test Workflow

- [ ] Start â†’ CommandCenter
- [ ] Stage 1 â†’ Feature 1 completes â†’ Stage 2
- [ ] Stage 2 â†’ Feature 2 completes â†’ Stage 3
- [ ] Stage 3 â†’ Features 3,4,5 can run â†’ Stage 4
- [ ] Stage 4 â†’ Features 6,7,8 can run â†’ Stage 5
- [ ] Stage 5 â†’ Features 9,10,11,12 can run â†’ Stage 6
- [ ] Stage 6 â†’ Features 13,14,15,16 can run â†’ Export
- [ ] Save report to storage
- [ ] Load saved report â†’ Restores all data
- [ ] Export to multiple formats

### Step 6.4: Performance Testing

**Benchmarks to match**:
- Build time: < 10 seconds
- Bundle size: < 1 MB gzipped (preferably < 400 KB)
- First paint: < 2 seconds
- Interactive: < 3 seconds
- Feature rendering: < 500ms per component

---

## Phase 7: Deployment (2-4 hours)

### Step 7.1: Build & Optimize

```bash
# Build for production
npm run build

# Check bundle size
npm run analyze  # If you have bundle analyzer

# Test production build locally
npm run preview
```

### Step 7.2: Deploy

Options:
- **Vercel** (recommended for React-like apps)
- **Netlify** (good for static SPAs)
- **AWS S3 + CloudFront**
- **Docker container**
- **Your own server**

### Step 7.3: Environment Variables

```
.env.local (development):
VITE_AI_API_KEY=your_key_here
VITE_API_BASE_URL=http://localhost:3000

.env.production:
VITE_AI_API_KEY=production_key
VITE_API_BASE_URL=https://api.yoursite.com
```

---

## Checklist: Porting Complete

### Infrastructure
- [ ] Project structure created
- [ ] Types.ts ported (all 70+ fields)
- [ ] Constants.ts ported
- [ ] State management configured
- [ ] 23 routes defined

### Services
- [ ] Engine.ts copied (unchanged)
- [ ] RuleEngine.ts copied (unchanged)
- [ ] AI service adapted to your LLM
- [ ] Data service connected to real sources

### Components
- [ ] CommandCenter ported
- [ ] EntityDefinitionBuilder ported
- [ ] All 16 features ported and tested
- [ ] Supporting components (Navbar, Footer, etc.)
- [ ] Styling applied and responsive

### Testing
- [ ] Full workflow tested end-to-end
- [ ] Each feature works independently
- [ ] Data persists across navigation
- [ ] Save/load functionality works
- [ ] Export functionality works

### Deployment
- [ ] Production build successful
- [ ] Bundle size optimized
- [ ] Environment variables configured
- [ ] Deployed to production
- [ ] Tested in production environment

---

## Time Estimate

| Phase | Duration | Critical Path |
|-------|----------|----------------|
| 1. Preparation | 2-4 hours | âœ… |
| 2. Infrastructure | 4-6 hours | âœ… |
| 3. Services | 3-5 hours | âœ… |
| 4. Features | 8-12 hours | âœ… |
| 5. UI/Styling | 4-6 hours | â—‹ |
| 6. Testing | 4-8 hours | âœ… |
| 7. Deployment | 2-4 hours | â—‹ |
| **TOTAL** | **27-45 hours** | **~32 hours min** |

**Team Size Impact**:
- 1 developer: 5-7 weeks part-time, or 2-3 weeks full-time
- 2 developers: 2-3 weeks (one on services, one on features)
- 3+ developers: 1-2 weeks (parallel feature development)

---

## Common Pitfalls to Avoid

âŒ **Don't flatten the workflow** - Keep 6-stage progression
âŒ **Don't skip types** - Full TypeScript coverage is critical
âŒ **Don't combine features** - Keep 16 modules independent
âŒ **Don't hardcode data** - Use data service abstraction
âŒ **Don't lose state** - ReportParameters must flow through all features
âŒ **Don't change the entity model** - KeepEntityProfile structure
âŒ **Don't skip testing** - Each feature needs individual test

âœ… **DO preserve module isolation** - Features don't import each other
âœ… **DO maintain consistent styling** - Use design system
âœ… **DO implement proper error handling** - Try/catch all async operations
âœ… **DO add logging** - Debug difficult issues later
âœ… **DO test incrementally** - Don't build all features before testing
âœ… **DO use feature flags** - Control feature availability
âœ… **DO document your adaptations** - Future maintainers will appreciate it

---

## Getting Help

If porting stalls:

1. **Reference the original** - Compare with original files
2. **Check diagrams** - Understand the flow first
3. **Test components in isolation** - Don't integrate too early
4. **Use mock data** - Don't wait for real APIs
5. **Profile performance** - Identify bottlenecks early
6. **Review state flow** - Ensure ReportParameters updates correctly

---

**Prepared**: December 16, 2025
**System Version**: BWGA Ai v4.2
**Original Build**: 2,099 modules | 188.78 kB gzipped | 5.49s build

Good luck with your port! ðŸš€


