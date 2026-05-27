# Developer Quick Reference - BWGA Ai v2.0

## ðŸ”§ Service Architecture Quick Start

### 1. Validation Engine (`services/validationEngine.ts`)

```typescript
// Import
import { validateField, validateStep, calculateStepCompletion, validateCrossDependencies } from '../services/validationEngine'

// Usage Examples
validateField('organizationName', 'Acme Corp', '1.1')  // Returns error or null
validateStep('1.1', params)  // Returns { field: error } dict
calculateStepCompletion('1.1', params)  // Returns 0-100
calculateOverallReadiness(params)  // Returns 0-100
validateCrossDependencies(params)  // Returns cross-errors dict
```

**Key Validation Functions:**
- `validationRules.required(value)` - Check not empty
- `validationRules.email(value)` - Email format
- `validationRules.currency(value)` - Positive numbers
- `validationRules.percentage(value)` - 0-100 range
- `validationRules.phone(value)` - Phone format
- Custom: `validationRules.minLength(10)(value)`, `validationRules.max(100)(value)`

---

### 2. Maturity Engine (`services/maturityEngine.ts`)

```typescript
// Import
import { calculateMaturityScores, generateAIInsights, generateOpportunities } from '../services/maturityEngine'

// Usage Examples
const scores = calculateMaturityScores(params, 'Technology')  // Returns 8 dimension scores
const insights = generateAIInsights(params)  // Returns array of alerts
const opps = generateOpportunities(params)  // Returns opportunity strings

// Score structure
{
  dimension: 'Market Positioning',
  score: 3.5,  // 1-5
  benchmarkAverage: 4.2,
  status: 'Strong',
  recommendations: ['Clarify UVP', 'Define customer personas']
}

// Insight structure
{
  severity: 'warning',  // 'critical' | 'warning' | 'info'
  title: 'Low Market Growth',
  message: 'Target market is growing slower...',
  affectedStep: '2.1'
}
```

**Industry Benchmarks Available:**
- Technology
- Manufacturing
- Retail
- Finance
- Healthcare

**8 Maturity Dimensions:**
1. Market Positioning
2. Financial Planning
3. Operational Strategy
4. Partnership Ecosystem
5. Compliance & Governance
6. Performance Metrics
7. Innovation Capacity
8. Team Capability

---

### 3. Persistence Engine (`services/persistenceEngine.ts`)

```typescript
// Import
import {
  saveData, loadData, autoSaveDraft, loadDraft,
  saveReportVersion, getReportVersions, compareReportVersions,
  applyTemplate, industryTemplates,
  exportDataAsJSON, exportDataAsCSV,
  importDataFromJSON, getWorkspaceSummary, clearAllData
} from '../services/persistenceEngine'

// Data Management
saveData(params)  // Save to localStorage
loadData()  // Retrieve from localStorage
autoSaveDraft(params)  // Auto-save with timestamp
loadDraft()  // Load auto-saved draft

// Versioning
saveReportVersion(params, 'Version Name')  // Returns versionId
getReportVersions()  // Returns all versions
getReportVersion(versionId)  // Get specific version
compareReportVersions(v1, v2)  // Returns change array

// Templates
applyTemplate('Tech Startup')  // Returns pre-filled params
industryTemplates  // Object with all 5 templates

// Export/Import
exportDataAsJSON(params, 'filename')  // Download JSON
exportDataAsCSV(params, 'filename')  // Download CSV
importDataFromJSON(file)  // Returns Promise<params>

// Workspace
getWorkspaceSummary(params)  // Returns stats object
clearAllData()  // Reset everything
```

**Available Templates:**
- 'Tech Startup'
- 'Manufacturing'
- 'Retail'
- 'Financial Services'
- 'Healthcare'

**Storage Keys:**
- `bw-nexus-workspace` - Main data
- `bw-nexus-workspace-draft` - Auto-save
- `bw-nexus-workspace-versions` - All versions

---

## ðŸŽ¯ Integration in MainCanvas

### Import Services
```typescript
import { validateField, calculateStepCompletion, calculateOverallReadiness, validateCrossDependencies, validateStep } from '../services/validationEngine';
import { calculateMaturityScores, generateAIInsights, generateOpportunities } from '../services/maturityEngine';
import { saveData, loadData, autoSaveDraft, loadDraft, saveReportVersion, getReportVersions, getReportVersion, compareReportVersions, applyTemplate, industryTemplates, exportDataAsJSON, exportDataAsCSV, importDataFromJSON } from '../services/persistenceEngine';
```

### State Setup
```typescript
const [maturityScores, setMaturityScores] = useState<any[]>([]);
const [aiInsights, setAiInsights] = useState<InsightAlert[]>([]);
const [opportunities, setOpportunities] = useState<string[]>([]);
const [overallReadiness, setOverallReadiness] = useState<number>(0);
const [showComparison, setShowComparison] = useState(false);
const [selectedVersions, setSelectedVersions] = useState<[string | null, string | null]>([null, null]);
const [comparisonResults, setComparisonResults] = useState<any[]>([]);
```

### Auto-Updates on Params Change
```typescript
useEffect(() => {
  const updatedScores = calculateMaturityScores(params);
  const updatedInsights = generateAIInsights(params);
  const updatedOpportunities = generateOpportunities(params);
  const readiness = calculateOverallReadiness(params);
  
  setMaturityScores(updatedScores);
  setAiInsights(updatedInsights);
  setOpportunities(updatedOpportunities);
  setOverallReadiness(readiness);
}, [params]);
```

### Auto-Save Every 30 Seconds
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    autoSaveDraft(params);
  }, 30000);
  return () => clearInterval(interval);
}, [params]);
```

---

## ðŸ“‹ Handler Functions

### Data Management
```typescript
// Save current data
const handleSaveData = () => {
  saveData(params);
  alert('Data saved successfully!');
};

// Export formats
const handleExportJSON = () => {
  exportDataAsJSON(params, `report-${Date.now()}`);
};

const handleExportCSV = () => {
  exportDataAsCSV(params, `report-${Date.now()}`);
};

// Import
const handleImportJSON = async (file: File) => {
  try {
    const importedData = await importDataFromJSON(file);
    setParams({ ...params, ...importedData });
  } catch (error) {
    alert('Error importing file');
  }
};
```

### Versioning
```typescript
// Save version
const handleSaveVersion = () => {
  const versionId = saveReportVersion(params, params.organizationName || 'Unnamed');
  const versions = getReportVersions();
  setComparisonVersions(versions);
};

// Compare versions
const handleCompareVersions = () => {
  if (selectedVersions[0] && selectedVersions[1]) {
    const v1 = getReportVersion(selectedVersions[0]);
    const v2 = getReportVersion(selectedVersions[1]);
    const changes = compareReportVersions(v1, v2);
    setComparisonResults(changes);
  }
};
```

### Templates
```typescript
// Apply template
const handleApplyTemplate = (templateName: string) => {
  const templateData = applyTemplate(templateName);
  setParams({ ...params, ...templateData });
};
```

---

## ðŸŽ¨ UI Components

### Readiness Progress Bar
```jsx
<div className="flex items-center gap-2">
  <div className="text-xs font-bold text-slate-600">Readiness: {overallReadiness}%</div>
  <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
    <div className="h-full bg-blue-600 transition-all" style={{ width: `${overallReadiness}%` }}></div>
  </div>
</div>
```

### Insights Alert Panel
```jsx
{aiInsights.length > 0 && (
  <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
    {aiInsights.slice(0, 3).map((insight, idx) => (
      <div key={idx} className={`text-xs p-2 rounded flex items-start gap-2 ${
        insight.severity === 'critical' ? 'bg-red-100 text-red-900' :
        insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-900' :
        'bg-blue-100 text-blue-900'
      }`}>
        <span>{insight.title}: {insight.message}</span>
      </div>
    ))}
  </div>
)}
```

### Maturity Grid
```jsx
<div className="grid grid-cols-4 gap-2">
  {maturityScores.slice(0, 4).map((score, idx) => (
    <div key={idx} className="bg-white p-2 rounded border border-purple-200 text-center">
      <div className="text-xs font-bold text-purple-900">{score.dimension.split(' ')[0]}</div>
      <div className="text-lg font-bold text-purple-600">{score.score.toFixed(1)}/5</div>
      <div className="text-[10px] text-purple-700">vs {score.benchmarkAverage.toFixed(1)} avg</div>
    </div>
  ))}
</div>
```

### Comparison Results Table
```jsx
{showComparison && comparisonResults.length > 0 && (
  <table className="w-full text-sm">
    <thead className="bg-slate-100">
      <tr>
        <th className="text-left p-3 font-bold">Field</th>
        <th className="text-left p-3 font-bold">Previous</th>
        <th className="text-left p-3 font-bold">New</th>
      </tr>
    </thead>
    <tbody>
      {comparisonResults.map((change, idx) => (
        <tr key={idx} className="border-b">
          <td className="p-3 font-bold">{change.field}</td>
          <td className="p-3">{change.oldValue}</td>
          <td className="p-3 bg-green-50">{change.newValue}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}
```

---

## ðŸš€ Common Development Tasks

### Add New Validation Rule
```typescript
// In validationEngine.ts
export const validationRules: { [key: string]: (value: any) => string | null } = {
  // ... existing rules
  customRule: (value) => {
    if (!value) return null;
    return value.length < 5 ? 'Must be 5+ characters' : null;
  }
};
```

### Add New Maturity Dimension
```typescript
// In maturityEngine.ts
const calculateNewDimensionScore = (params: any): number => {
  let score = 2;
  if (params.someField) score += 1;
  return score;
};

// Add to dimensions array in calculateMaturityScores()
{
  name: 'New Dimension',
  score: calculateNewDimensionScore(params),
  recommendations: getNewDimensionRecommendations(params),
}
```

### Add New Industry Template
```typescript
// In persistenceEngine.ts
export const industryTemplates: { [key: string]: any } = {
  // ... existing templates
  'New Industry': {
    organizationName: 'Template Name',
    entityType: 'C-Corporation',
    // ... pre-filled fields
  }
};
```

### Add New AI Insight
```typescript
// In maturityEngine.ts, generateAIInsights()
if (someCondition) {
  insights.push({
    severity: 'warning',
    title: 'Issue Title',
    message: 'Detailed explanation',
    action: 'Recommended action',
    affectedStep: '1.1'
  });
}
```

---

## ðŸ” Debugging Tips

### Check Auto-Save Status
```typescript
// In browser console
localStorage.getItem('bw-nexus-workspace-draft')  // Shows last draft
localStorage.getItem('bw-nexus-workspace')  // Shows main data
```

### View Maturity Scores
```typescript
// In React DevTools
// Search for `maturityScores` state to see all 8 dimension scores
```

### Test Validation
```typescript
// Directly in console
import { validateField } from './services/validationEngine'
validateField('organizationName', '', '1.1')  // Returns error message
```

### Monitor Auto-Save
```typescript
// Add to useEffect interval
console.log('Auto-saved at', new Date().toLocaleTimeString())
```

---

## ðŸ“Š Data Flow Diagram

```
User Input â†’ onChange â†’ setParams
                â†“
        useEffect triggered
                â†“
    validateCrossDependencies()
    calculateMaturityScores()
    generateAIInsights()
    calculateOverallReadiness()
                â†“
         State Updates
    (scores, insights, readiness)
                â†“
       Re-render Components
    (progress bar, alerts, modal)
                â†“
         autoSaveDraft()
       (every 30 seconds)
                â†“
       localStorage persisted
```

---

## ðŸŽ¯ Testing Checklist

- [ ] Validation catches all required fields
- [ ] Maturity scores range 1-5
- [ ] AI insights appear with correct severity
- [ ] Auto-save updates every 30s
- [ ] Data persists on page refresh
- [ ] Template applies without errors
- [ ] Version comparison shows all changes
- [ ] Export generates valid files
- [ ] Cross-step validation prevents errors
- [ ] UI updates reflect current params
- [ ] No console errors
- [ ] Performance acceptable

---

## ðŸ“ž Quick Fixes

| Problem | Solution |
|---------|----------|
| Data not persisting | Check browser storage disabled, clear cache |
| Maturity scores not updating | Ensure params state updating correctly |
| Templates not available | Check industryTemplates export in persistenceEngine |
| Alerts not showing | Check aiInsights state has items, verify array mapping |
| Comparison empty | Ensure two different versions selected |
| Export not working | Check browser pop-up settings, file permissions |
| Validation not triggering | Verify validateField() called on input change |

---

**Reference Version: 2.0**
**Last Updated: December 17, 2025**
**Status: Production Ready** âœ…

