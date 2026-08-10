# Regional Investment Decision Framework (Evidence-First)

## 1) What this framework does

This framework converts regional development strategy into a repeatable decision system for attracting and growing private investment.

It is designed to avoid common failure modes (incentive-only logic, weak feasibility checks, forced recommendations) by requiring:
- objective clarity,
- evidence gates,
- transparent scoring,
- explicit no-go/not-yet outcomes,
- and monitoring loops.

---

## 2) Two decision tracks

## Track A: Known Target
Use when you already have a specific firm, investor, or project in scope.

Primary question:
- Can this target be won and retained with acceptable cost, risk, and local spillover?

## Track B: Discovery Target
Use when you need to identify best-fit sectors, value chains, or firm archetypes first.

Primary question:
- Which opportunities best fit regional capabilities and constraints, and are realistically executable within the planning horizon?

---

## 3) Objective schema (required intake fields)

Use this as the mandatory schema before any recommendation is generated.

| Field | Type | Required | Description |
|---|---|---|---|
| objective_id | string | yes | Unique objective identifier |
| objective_name | string | yes | Short decision objective title |
| decision_track | enum(`known_target`,`discovery_target`) | yes | Select Track A or B |
| region_scope | object | yes | Geography, administrative level, population/economic profile |
| planning_horizon | object | yes | Near term (0-24m), medium (2-5y), long (5y+) |
| target_profile | object | conditional | Required for known target: firm, sector, project type, expected footprint |
| sector_focus | array | conditional | Required for discovery target: candidate sectors/value chains |
| strategic_outcomes | array | yes | Jobs, productivity, exports, inclusion, resilience goals |
| constraints | object | yes | Fiscal, legal, land, utilities, workforce, political constraints |
| policy_tools_in_scope | array | yes | What tools are allowed (permits, training, infra, incentives, etc.) |
| evidence_base | object | yes | Data sources, baseline metrics, quality level |
| comparator_set | array | yes | Peer regions and benchmark cases |
| stakeholder_map | array | yes | Delivery owners across agencies and partners |
| risk_appetite | enum(`low`,`moderate`,`high`) | yes | Risk tolerance for fiscal/operational exposure |
| hard_stops | array | yes | Non-negotiable legal/fiscal/environmental conditions |
| success_kpis | array | yes | KPI definitions and target values |

---

## 4) Evidence gates (must pass before scoring)

If any mandatory gate fails, status is `NOT_READY` and recommendation generation is blocked.

### Gate 1: Capability baseline complete
Minimum evidence:
- labor and skills baseline,
- infrastructure and utilities reliability,
- land/site readiness,
- logistics/market access,
- institutional delivery capacity.

### Gate 2: Constraint realism validated
Minimum evidence:
- fiscal envelope,
- legal/regulatory constraints,
- timing and sequencing constraints,
- implementation bottlenecks.

### Gate 3: Comparator analysis complete
Minimum evidence:
- at least 3 comparable regions/cases,
- what worked, what failed, why,
- transferability test to local context.

### Gate 4: Additionality and spillover test
Minimum evidence:
- expected local supply-chain effects,
- workforce/SME spillovers,
- attribution logic (would investment happen anyway?).

### Gate 5: Delivery ownership assigned
Minimum evidence:
- named agency owners,
- milestones,
- budget source,
- accountability cadence.

---

## 5) Weighted scoring rubric (100 points)

Score only after all evidence gates pass.

| Dimension | Weight | Scoring guide (0-5) |
|---|---:|---|
| Strategic fit | 20 | Alignment with region’s capability path and long-term outcomes |
| Execution readiness | 25 | Permits, land, utilities, institutions, timeline realism |
| Investor attractiveness | 20 | Market access, cost-quality mix, policy predictability |
| Local spillover quality | 20 | Jobs quality, SME linkages, innovation/training effects |
| Resilience and risk | 15 | Exposure to shocks, concentration risk, climate/geopolitical robustness |

### Score formula
- For each dimension: `weighted_score = (raw_score / 5) * weight`
- Total score is sum of all weighted scores (0 to 100).

### Decision thresholds
- **GO**: score >= 75 and no hard-stop violations.
- **CONDITIONAL GO**: score 60-74 with clearly costed remediation plan.
- **NOT YET**: score 45-59 (insufficient readiness; remediation required).
- **NO GO**: score < 45 or any hard-stop violated.

### Confidence rating (required)
- `high`: strong, current, triangulated data.
- `medium`: partial triangulation or moderate data age.
- `low`: limited evidence; decision provisional only.

---

## 6) Report template (step-by-step)

Use this 10-section structure for every decision report.

1. **Objective and decision question**
   - Track type, core question, target horizon.

2. **Regional baseline and constraints**
   - Current conditions and hard constraints.

3. **Opportunity definition**
   - Known target profile or discovery short-list.

4. **Comparator evidence**
   - What similar regions tried; outcomes and relevance.

5. **Capability-gap diagnosis**
   - Gaps in skills, infrastructure, governance, finance, data.

6. **Intervention options**
   - Non-incentive and incentive measures; sequencing options.

7. **Scoring and recommendation**
   - 5-dimension scorecard + confidence rating + threshold result.

8. **Implementation plan**
   - Owners, budget, timeline, dependencies, procurement needs.

9. **Risk and mitigation register**
   - Delivery, fiscal, political, social, environmental, legal risks.

10. **Monitoring and trigger logic**
    - 90/180/365-day KPIs, red flags, pivot/exit rules.

---

## 7) KPI set for 90/180/365-day monitoring

### Pipeline KPIs
- qualified investor leads,
- conversion rate by stage,
- median days for approval/onboarding,
- share of delayed cases by bottleneck type.

### Quality KPIs
- projected vs committed jobs,
- local procurement share,
- training placements,
- SME participation count.

### Sustainability and resilience KPIs
- infrastructure reliability for target sites,
- permit and compliance timeliness,
- concentration risk by sector/firm,
- project continuation probability under stress scenarios.

### Trigger rules
- If >=2 critical KPIs miss target for 2 consecutive periods: automatic corrective action review.
- If hard-stop risk materializes: escalate to no-go or redesign decision.

---

## 8) Failure-prevention rules (non-negotiable)

- No recommendation without comparator analysis.
- No incentive package without capability-gap and additionality assessment.
- No “single-score only” outputs; confidence and assumptions must be explicit.
- Always allow **NO GO** and **NOT YET** outcomes.
- Always include ownership, budget source, and delivery timeline.

---

## 9) Minimal output objects (for system integration)

### A) Intake object
```json
{
  "objective_id": "REG-2026-001",
  "decision_track": "discovery_target",
  "region_scope": {"name": "Example Region"},
  "planning_horizon": {"near_term_months": 24},
  "strategic_outcomes": ["quality_jobs", "export_growth"],
  "constraints": {"fiscal": "moderate"},
  "success_kpis": ["lead_conversion", "approval_days"]
}
```

### B) Decision object
```json
{
  "objective_id": "REG-2026-001",
  "gates_passed": true,
  "dimension_scores": {
    "strategic_fit": 4,
    "execution_readiness": 3,
    "investor_attractiveness": 4,
    "local_spillover_quality": 3,
    "resilience_and_risk": 3
  },
  "total_score": 69,
  "confidence": "medium",
  "decision": "CONDITIONAL_GO",
  "required_remediations": ["utilities_upgrade", "permit_streamlining"]
}
```

---

## 10) Recommended operating cadence

- Weekly: delivery stand-up on bottlenecks and approvals.
- Monthly: KPI dashboard + corrective actions.
- Quarterly: strategy refresh using comparator updates and new evidence.
- Biannual: full model recalibration (weights, thresholds, risk assumptions).

---

## 11) Practical usage rule

If the user objective is vague, default to Discovery Track and force objective refinement before generating target recommendations.

If the user objective is specific, run Known Target Track and force feasibility/additionality before presenting any deal strategy.
