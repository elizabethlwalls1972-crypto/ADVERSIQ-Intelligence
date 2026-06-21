# BWGA Ai - Architecture Diagrams & Data Flow

## System Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    BWGA Ai PLATFORM v4.2                        â”‚
â”‚             React + TypeScript + Vite + TailwindCSS                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚  User Browser    â”‚
                         â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚      App.tsx (Root)        â”‚
                    â”‚  State: ReportParameters   â”‚
                    â”‚  Routes: 23 ViewModes      â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                         â”‚                          â”‚
        â–¼                         â–¼                          â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚ Navbar â”‚          â”‚ Main Content â”‚        â”‚ CopilotSidebar
    â”‚ Footer â”‚          â”‚  (ViewMode)  â”‚        â”‚ MonitorDash   â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                      â”‚                      â”‚
        â–¼                      â–¼                      â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚Gatewayâ”‚         â”‚CommandCenterâ”‚        â”‚Entity Definitionâ”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚(Landing)    â”‚        â”‚Builder (Step 1) â”‚
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                            â”‚ "Begin Entity Definition"
                            â”‚
                            â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚   6-STAGE WORKFLOW ENTRY     â”‚
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                   â”‚                   â”‚
        â–¼                   â–¼                   â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚Stage 1:     â”‚   â”‚Stage 2:        â”‚  â”‚Stage 3:      â”‚
   â”‚Market       â”‚â”€â”€â”€â–¶Partnership    â”‚â”€â–¶â”‚Intelligence  â”‚
   â”‚Analysis     â”‚   â”‚Compatibility   â”‚  â”‚Gathering     â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚                   â”‚                   â”‚
        â–¼                   â–¼                   â–¼
    Global Market    Partnership      Deal         Business       Partnership
    Comparison       Compatibility    Marketplace  Intelligence   Analyzer
        â”‚                   â”‚              â”‚            â”‚            â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                   â”‚                       â”‚
        â–¼                   â–¼                       â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚Stage 4:     â”‚   â”‚Stage 5:        â”‚  â”‚Stage 6:          â”‚
   â”‚Strategic    â”‚â”€â”€â”€â–¶Expansion       â”‚â”€â–¶â”‚Report Output     â”‚
   â”‚Planning     â”‚   â”‚Design          â”‚  â”‚& Export          â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚                   â”‚                    â”‚
        â–¼                   â–¼                    â–¼
    Relationship      Advanced         Executive      Document      Integration
    Planner          Expansion        Summary        Generation    & Export
    â”‚               System            Generator      Suite         â”‚
    â”‚               â”‚                 â”‚              â”‚            â”‚
    Multi-Scenario  Partnership       Workbench      Low-Cost     (CSV, PDF,
    Planner         Repository        Provisioning   Tools        DOCX, JSON)
    â”‚               â”‚                 â”‚
    Support         AI                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    Programs        Recommendations          â”‚
    Database                          Save/Load Reports

                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   ReportParameters Object   â”‚
                    â”‚  (Flows Through All Stages) â”‚
                    â”‚ id, params, results,        â”‚
                    â”‚ savedAt, stage, viewMode    â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Data Flow: How Information Moves

```
USER INPUT
    â”‚
    â”œâ”€ Organization Identity (EntityDefinitionBuilder)
    â”‚  â”œâ”€ Legal name
    â”‚  â”œâ”€ Type, country, headcount
    â”‚  â”œâ”€ Strategic assets
    â”‚  â””â”€ Team expertise
    â”‚
    â–¼
ENTITY DEFINITION COMPLETE
    â”‚
    â”œâ”€â–º ReportParameters.organizationName
    â”œâ”€â–º ReportParameters.country
    â”œâ”€â–º ReportParameters.strategicIntent
    â””â”€â–º ReportParameters.stage = 1
    â”‚
    â–¼
STAGE 1: MARKET ANALYSIS
    â”‚
    â”œâ”€ GlobalMarketComparison reads ReportParameters
    â”‚  â”œâ”€ Input: country, region, industry
    â”‚  â”œâ”€ Analysis: 100+ years of market data
    â”‚  â””â”€ Output: marketAnalysis, targetMarkets
    â”‚
    â”œâ”€â–º ReportParameters.marketAnalysis = result
    â”œâ”€â–º ReportParameters.targetMarkets = markets[]
    â””â”€â–º ReportParameters.stage = 2
    â”‚
    â–¼
STAGE 2: PARTNERSHIP FEASIBILITY
    â”‚
    â”œâ”€ PartnershipCompatibilityEngine reads ReportParameters
    â”‚  â”œâ”€ Input: marketAnalysis, strategicIntent
    â”‚  â”œâ”€ Scoring: 8 dimensions (0-100)
    â”‚  â””â”€ Output: compatibility score, risk level
    â”‚
    â”œâ”€â–º ReportParameters.successScore = 75
    â”œâ”€â–º ReportParameters.risks[] = [risk1, risk2]
    â””â”€â–º ReportParameters.stage = 3
    â”‚
    â–¼
STAGE 3: INTELLIGENCE GATHERING
    â”‚
    â”œâ”€ DealMarketplace reads ReportParameters
    â”‚  â””â”€ Output: ReportParameters.opportunities[] = deals[]
    â”‚
    â”œâ”€ BusinessPracticeIntelligence reads ReportParameters
    â”‚  â””â”€ Output: cultural insights, practice briefings
    â”‚
    â”œâ”€ PartnershipAnalyzer reads ReportParameters
    â”‚  â””â”€ Output: ReportParameters.partnerships[] = analyzed
    â”‚
    â””â”€â–º ReportParameters.stage = 4
    â”‚
    â–¼
STAGE 4: STRATEGIC PLANNING
    â”‚
    â”œâ”€ RelationshipPlanner reads ReportParameters
    â”‚  â”œâ”€ Input: partnerships, opportunities
    â”‚  â””â”€ Output: timeline, milestones, roadmap
    â”‚
    â”œâ”€ MultiScenarioPlanner reads ReportParameters
    â”‚  â”œâ”€ Models: Best, Realistic, Worst cases
    â”‚  â””â”€ Output: Financial projections (IRR, payback)
    â”‚
    â”œâ”€ SupportProgramsDatabase reads ReportParameters
    â”‚  â”œâ”€ Input: country, industry
    â”‚  â””â”€ Output: matched incentives, tax breaks
    â”‚
    â””â”€â–º ReportParameters.stage = 5
    â”‚
    â–¼
STAGE 5: EXPANSION DESIGN
    â”‚
    â”œâ”€ AdvancedExpansionSystem reads ReportParameters
    â”‚  â””â”€ Output: Multi-phase expansion blueprint
    â”‚
    â”œâ”€ PartnershipRepository reads ReportParameters
    â”‚  â””â”€ Output: Reusable templates
    â”‚
    â”œâ”€ AIPoweredDealRecommendation reads ReportParameters
    â”‚  â”œâ”€ ML engine: Scores deals against profile
    â”‚  â””â”€ Output: Ranked recommendations
    â”‚
    â”œâ”€ LowCostRelocationTools reads ReportParameters
    â”‚  â””â”€ Output: Cost models, location rankings
    â”‚
    â””â”€â–º ReportParameters.stage = 6
    â”‚
    â–¼
STAGE 6: REPORT GENERATION
    â”‚
    â”œâ”€ ExecutiveSummaryGenerator reads ReportParameters
    â”‚  â”œâ”€ Combines all previous outputs
    â”‚  â””â”€â–º ReportParameters.executiveSummary = narrative
    â”‚
    â”œâ”€ DocumentGenerationSuite reads ReportParameters
    â”‚  â”œâ”€ Formats: PDF, DOCX, HTML
    â”‚  â””â”€â–º exports to file system
    â”‚
    â”œâ”€ IntegrationExportFramework reads ReportParameters
    â”‚  â”œâ”€ Formats: CSV, JSON, XML, webhooks
    â”‚  â””â”€â–º sends to external systems (Salesforce, etc)
    â”‚
    â”œâ”€ WorkbenchFeature reads ReportParameters
    â”‚  â””â”€â–º Real-time provisioning visualization
    â”‚
    â””â”€â–º ReportParameters.stage = 7 (Complete)
    â”‚
    â–¼
SAVE & EXPORT
    â”‚
    â”œâ”€â–º localStorage: saveReports[] = [ReportParameters]
    â”œâ”€â–º Download: Report as PDF/DOCX
    â”œâ”€â–º Email: Send summary
    â””â”€â–º API: Export to Salesforce, HubSpot, etc.
```

---

## Component Dependency Graph

```
                          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                          â”‚   App.tsx    â”‚
                          â”‚   (Root)     â”‚
                          â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â”‚
                ReportParameters (shared state)
                                 â”‚
                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                â”‚                â”‚                â”‚
                â–¼                â–¼                â–¼
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚ CommandCenterâ”‚ â”‚EntityDef       â”‚ â”‚[Feature 1]  â”‚
         â”‚(Gateway)     â”‚ â”‚Builder         â”‚ â”‚GlobalMarket â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚Comparison   â”‚
                                              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                    â”‚
                                                    â–¼
                                              (Updates ReportParameters)
                                                    â”‚
                                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                   â”‚                â”‚                â”‚
                                   â–¼                â–¼                â–¼
                            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                            â”‚[Feature 2]   â”‚ â”‚[Feature 3]   â”‚ â”‚[Feature 4]   â”‚
                            â”‚Partnership   â”‚ â”‚Deal          â”‚ â”‚Executive     â”‚
                            â”‚Compatibility â”‚ â”‚Marketplace   â”‚ â”‚Summary       â”‚
                            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

IMPORTANT: Features DO NOT import each other
           Features only communicate via ReportParameters
           Each feature is independently testable
```

---

## State Machine: Workflow Progression

```
                    START
                      â”‚
                      â–¼
            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚   Command Center    â”‚
            â”‚   (Landing Page)    â”‚
            â”‚  Accept Terms? YES  â”‚
            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                       â”‚
                       â–¼
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚  Entity Definition Step  â”‚
         â”‚   Define Organization   â”‚
         â”‚   (stage: 0 â†’ 1)         â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚
                    â–¼
      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
      â”‚  6-STAGE WORKFLOW PROGRESSION   â”‚
      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                       â”‚           â”‚           â”‚           â”‚
        â–¼                       â–¼           â–¼           â–¼           â–¼
    Stage 1:               Stage 2:    Stage 3:    Stage 4:    Stage 5:
    Market              Partnership  Intelligence Strategic   Expansion
    Analysis            Fit          Gathering    Planning    Design
   (stage: 1â†’2)        (stage: 2â†’3) (stage: 3â†’4) (stage: 4â†’5) (stage: 5â†’6)
        â”‚                   â”‚           â”‚           â”‚           â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                            â–¼
                    Stage 6: Report
                    Generation
                    (stage: 6â†’7)
                            â”‚
                            â–¼
                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                â”‚   EXPORT OPTIONS    â”‚
                â”‚ - PDF Download      â”‚
                â”‚ - Email             â”‚
                â”‚ - API Export        â”‚
                â”‚ - Save to Database  â”‚
                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚
                            â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚ COMPLETE      â”‚
                    â”‚ (stage: 7)    â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

User Navigation: viewMode state drives which component renders
  viewMode: 'command-center'          â†’ CommandCenter
  viewMode: 'entity-definition'       â†’ EntityDefinitionBuilder
  viewMode: 'global-market-comparison'â†’ GlobalMarketComparison
  viewMode: 'partnership-compatibility'â†’ PartnershipCompatibilityEngine
  ... and 19 more routes
```

---

## Information Flow Through Each Feature

```
EVERY FEATURE FOLLOWS THIS PATTERN:

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Feature Component                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                      â”‚
â”‚  const Component: React.FC<{                         â”‚
â”‚    params: ReportParameters;                         â”‚
â”‚    onUpdate: (newParams) => void;                    â”‚
â”‚  }> = ({ params, onUpdate }) => {                    â”‚
â”‚                                                      â”‚
â”‚    // 1. READ from params                            â”‚
â”‚    const { country, strategicIntent, industry } = params
â”‚                                                      â”‚
â”‚    // 2. ANALYSIS/COMPUTATION                        â”‚
â”‚    const results = analyzeMarket(country, industry)  â”‚
â”‚    const newScore = calculateCompatibility(results)  â”‚
â”‚                                                      â”‚
â”‚    // 3. CREATE UPDATED params                       â”‚
â”‚    const updatedParams = {                           â”‚
â”‚      ...params,                                       â”‚
â”‚      marketAnalysis: results,                        â”‚
â”‚      successScore: newScore,                         â”‚
â”‚      recommendations: recommendations               â”‚
â”‚    }                                                 â”‚
â”‚                                                      â”‚
â”‚    // 4. CALL onUpdate                               â”‚
â”‚    onUpdate(updatedParams);                          â”‚
â”‚                                                      â”‚
â”‚    // 5. RENDER UI                                   â”‚
â”‚    return <DisplayResults />;                        â”‚
â”‚  }                                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚
                        â–¼
                App.tsx receives
                updated params
                        â”‚
                        â–¼
        Re-renders with new data
```

---

## Services Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Services Layer                         â”‚
â”‚              (Business Logic & Integrations)              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚               â”‚               â”‚
        â–¼               â–¼               â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚Gemini      â”‚ â”‚Mock Data    â”‚ â”‚Rule Engine  â”‚
    â”‚Service     â”‚ â”‚Generator    â”‚ â”‚Scoring      â”‚
    â”‚(AI/LLM)    â”‚ â”‚(Test Data)  â”‚ â”‚Recommend    â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚               â”‚               â”‚
         â”œâ”€ API Key      â”œâ”€ Market Data  â”œâ”€ Scoring Rules
         â”œâ”€ Prompts      â”œâ”€ Partnerships â”œâ”€ Risk Calculation
         â”œâ”€ Streaming    â””â”€ Scenarios    â””â”€ Decision Logic
         â””â”€ Error Handling
                â”‚
                â””â”€â”€â†’ Used by Feature Components
                    (Called from within feature code)
```

---

## File Organization & Imports

```
App.tsx (Root)
  â”‚
  â”œâ”€ imports { ReportParameters } from types.ts
  â”œâ”€ imports { INITIAL_PARAMETERS } from constants.ts
  â”œâ”€ imports { generateCopilotInsights } from services/geminiService.ts
  â”œâ”€ imports { calculateSPI } from services/engine.ts
  â”‚
  â””â”€ imports [16 Feature Components]
     â”‚
     â”œâ”€ GlobalMarketComparison.tsx
     â”‚   â””â”€ No imports from other features
     â”‚   â””â”€ imports { formatCurrency, constants }
     â”‚
     â”œâ”€ PartnershipCompatibilityEngine.tsx
     â”‚   â””â”€ No imports from other features
     â”‚   â””â”€ imports { calculateScore, constants }
     â”‚
     â”œâ”€ ... [14 more features, each independent]
     â”‚
     â””â”€ Each feature reads/writes ReportParameters
        (Communication only through App.tsx)

CRITICAL RULE: Features don't import each other
               They only import types, utils, services
               All communication via ReportParameters
```

---

## Build Process

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     npm run build                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                  â”‚
â”‚  1. TSC validates types          â”‚
â”‚  2. esbuild transpiles JSX/TS    â”‚
â”‚  3. Vite bundles modules         â”‚
â”‚  4. Tree-shaking removes dead    â”‚
â”‚  5. Minification & compression   â”‚
â”‚                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                 â”‚
                 â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚  dist/             â”‚
        â”‚  â”œâ”€ index.html     â”‚
        â”‚  â””â”€ assets/        â”‚
        â”‚     â”œâ”€ index-XX.js â”‚ (711.35 KB raw)
        â”‚     â””â”€ ...         â”‚ (188.78 KB gzip)
        â”‚                    â”‚
        â”‚  Production Ready  â”‚
        â”‚  âœ“ Code split      â”‚
        â”‚  âœ“ Minified        â”‚
        â”‚  âœ“ Optimized       â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Error Handling & Validation Flow

```
USER ACTION
    â”‚
    â–¼
Component receives input
    â”‚
    â”œâ”€ Input validation
    â”‚  â”œâ”€ Required fields check
    â”‚  â”œâ”€ Type checking
    â”‚  â””â”€ Range validation
    â”‚
    â–¼
Analysis/Calculation
    â”‚
    â”œâ”€ Error caught
    â”‚  â”œâ”€ Log error
    â”‚  â”œâ”€ Show user message
    â”‚  â””â”€ Keep previous state
    â”‚
    â–¼
Update ReportParameters
    â”‚
    â”œâ”€ Validation passes
    â”‚  â”œâ”€ Call onUpdate()
    â”‚  â”œâ”€ UI reflects new state
    â”‚  â””â”€ Progress to next stage
    â”‚
    â–¼
UI Renders
    â”‚
    â”œâ”€ Success state
    â”œâ”€ Results displayed
    â””â”€ Next action available
```

---

**Diagrams Generated**: December 16, 2025
**System Version**: BWGA Ai v4.2
**Architecture Pattern**: React Component State Machine
**Data Flow Model**: Unidirectional (ReportParameters)


