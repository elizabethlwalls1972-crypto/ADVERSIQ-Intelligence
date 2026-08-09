# NSIL Formula Suite â€” Full Reference

Clear, standalone reference for the NSIL/Agentic Brain formula family. Each method lists intent, inputs, core equation, and outputs. Confidence and data-quality gating apply to all (low Evidence Confidence Score clamps assertions and adds caution language).

## Primary Engines (The Core 5)

### 1) Strategic Partnership Index (SPI)
<a id="spi"></a>
- **Intent:** Partner fit for joint execution.
- **Inputs:** Reach, credibility, incentives, ops capacity, compliance stance; weights sum to 1.
- **Formula:** $SPI = \sum_i w_i s_i$.
- **Outputs:** 0â€“100 score; top drivers; confidence band.

### 2) Regional Return on Investment (RROI)
<a id="rroi"></a>
- **Intent:** Regional ROI with downside adjustment.
- **Inputs:** Risk-adjusted cash flows (upside/base), CapEx, sector hazard multipliers.
- **Formula:** $RROI = \frac{(CF_{upside} - CF_{base}) - CapEx}{CapEx}$.
- **Outputs:** % return; sensitivities; downside case.

### 3) Symbiotic Ecosystem Assessment & Matching (SEAM)
<a id="seam"></a>
- **Intent:** Partner ecosystem alignment.
- **Inputs:** Complementarity, non-overlap, governance fit; weights $w_c, w_n, w_g$.
- **Formula:** $SEAM = (\text{Complementarity} \times w_c) + (\text{Non-Overlap} \times w_n) + (\text{Governance Fit} \times w_g)$.
- **Outputs:** 0â€“100 alignment; fit notes; gaps.

### 4) Investment Viability Assessment Score (IVAS)
<a id="ivas"></a>
- **Intent:** Probability of positive NPV under uncertainty.
- **Inputs:** Monte Carlo across demand, cost, FX, delays; correlations.
- **Formula:** $IVAS = 100 \times P(NPV>0)$.
- **Outputs:** Score; P10/P50/P90 NPV; top risk factors.

### 5) Strategic Cash Flow Impact (SCF)
- **Intent:** Value uplift vs. baseline.
- **Inputs:** Period cash flows, probabilities, discount rate.
- **Formula:** $SCF = \sum_t \frac{(Rev_t - Cost_t) p_t}{(1+r)^t}$.
- **Outputs:** NPV uplift; payback delta; sector benchmarks.

---
## Derivative Indices (The Other 16)

### 6) Counterfactual Robustness Index (CRI)
<a id="cri"></a>
- **Intent:** Fragility to adverse scenarios.
- **Inputs:** Top-k counterfactual losses.
- **Formula:** $CRI = 100 - (\text{worst\_delta% among top } k)$.
- **Outputs:** 0â€“100 robustness; weakest scenarios.

### 7) Opportunity Velocity Score (OVS)
- **Intent:** Execution pace vs. plan.
- **Inputs:** Milestones cleared, elapsed weeks, complexity factor.
- **Formula:** $OVS = \frac{milestones}{weeks} \times adj_{complexity}$ (capped 100).
- **Outputs:** Velocity; bottlenecks; gate forecast.

### 8) Partner Readiness Index (PRI)
- **Intent:** Counterparty readiness.
- **Inputs:** Team, approvals, funding, tech, compliance; evidence flags.
- **Formula:** $PRI = \sum_j w_j r_j$.
- **Outputs:** 0â€“100; missing evidence penalties.

### 9) Risk Concentration Index (RCI)
- **Intent:** Concentration of exposure.
- **Inputs:** Normalized exposure buckets.
- **Formula:** $RCI = \sum_k p_k^2$ (Herfindahl-like; target < 0.25).
- **Outputs:** Concentration score; diversification suggestions.

### 10) Compliance Friction Index (CFI)
- **Intent:** Regulatory/AML/sanctions friction.
- **Inputs:** Sector base, licensing, data, sanctions/AML, export controls.
- **Formula:** Sector base + weighted factors scaled 0â€“100.
- **Outputs:** Friction score; critical approvals list.

### 11) Trust & Integrity Score (TIS)
- **Intent:** Integrity of flows and controls.
- **Inputs:** Smuggling/anomaly rate (S), audit exceptions (A), fraud flags (F).
- **Formula:** $TIS = 100 - (w_s S + w_a A + w_f F)$; telemetry lowers S.
- **Outputs:** Integrity score; control gaps.

### 12) Supply Dependency Index (SDI)
- **Intent:** Exposure to supplier/geo concentration.
- **Inputs:** Supplier shares, geo risk, political risk.
- **Formula:** $SDI = \sum_i share_i \times risk_i$.
- **Outputs:** Dependency %; alternate supplier set.

### 13) Logistics Resilience Score (LRS)
- **Intent:** Resilience of routes and cold chain.
- **Inputs:** Route redundancy (R), dwell stability (D), condition integrity (C).
- **Formula:** $LRS = w_r R + w_d D + w_c C$.
- **Outputs:** Resilience score; route/condition fixes.

### 14) Execution Confidence Index (ECI)
- **Intent:** Schedule/cost reliability.
- **Inputs:** P50 delay, P50 overrun from analogues.
- **Formula:** $ECI = 100 - (delay_{p50} w_d + overrun_{p50} w_o)$.
- **Outputs:** Confidence; expected slippage.

### 15) Governance Maturity Score (GMS)
- **Intent:** Strength of governance model.
- **Inputs:** Policies (P), roles (R), telemetry (T), auditability (A).
- **Formula:** $GMS = w_p P + w_r R + w_t T + w_a A$.
- **Outputs:** Maturity score; required controls.

### 16) Evidence Confidence Score (ECS)
<a id="ecs"></a>
- **Intent:** Data quality gate.
- **Inputs:** Coverage, freshness, diversity (0â€“1 each).
- **Formula:** $ECS = coverage \times freshness \times diversity$.
- **Outputs:** 0â€“1; clamps assertions if < 0.4.

### 17) Perception Gap Index (PGI)
- **Intent:** Narrative vs. observed risk gap.
- **Inputs:** Narrative risk (media/advisories), observed risk (incidents/time-series).
- **Formula:** $PGI = \frac{Narrative - Observed}{\max(Observed, \epsilon)}$.
- **Outputs:** Gap magnitude; corrective note; alternate sites if needed.

### 18) Location Composite Risk (LCR)
- **Intent:** Holistic location risk.
- **Inputs:** Corruption (C), terrorism (T), organized crime/illicit trade (O), crime (P), stability (S), bias/perception (B).
- **Formula:** $LCR = w_c C + w_t T + w_o O + w_p P + w_s S + w_b B$; banded with ECS.
- **Outputs:** Risk score + confidence band; mitigation and safer alternates.

### 19) Capital Efficiency Score (CES)
- **Intent:** Value per unit capital.
- **Inputs:** Risk-adjusted NPV, CapEx.
- **Formula:** $CES = \frac{NPV_{risk\text{-}adj}}{CapEx}$ normalized 0â€“100.
- **Outputs:** Efficiency score; compare to hurdle.

### 20) Activation Velocity (AV)
- **Intent:** Progress on critical gates.
- **Inputs:** Critical gates cleared/total; delay adjustment.
- **Formula:** $AV = \frac{gates_{cleared}}{gates_{critical}} \times \frac{1}{1+delay_{adj}}$.
- **Outputs:** Velocity; gate unblocks.

### 21) Transparency & Traceability Index (TTI)
<a id="tti"></a>
- **Intent:** Provenance readiness for sharing/export.
- **Inputs:** Ledger quality (L), sensor/telemetry coverage (S), provenance completeness (P).
- **Formula:** $TTI = w_l L + w_s S + w_p P$.
- **Outputs:** TTI; export/share gating and required evidence.

---
## Additional Specialized Methods

### Location Advisory Integrity (LAI)
- **Intent:** Detect overstated/understated travel advisories.
- **Inputs:** Advisory level, incident rates, recency, source diversity.
- **Formula:** $LAI = advisory\_index - observed\_index$; sign flags direction of bias.
- **Outputs:** Aligns / Overstated / Understated with corrective note.

### Sanctions & AML Exposure (SAE)
- **Intent:** Quantify sanctions/AML risk.
- **Inputs:** Entity lists, ownership graph, trade lanes, counterparties.
- **Formula:** Weighted exposure over links; high-risk link multiplier.
- **Outputs:** Exposure band; required controls/clearing steps.

### Permit Probability & Lead-Time (PPL)
- **Intent:** Odds and timing of approvals.
- **Inputs:** Sector, jurisdiction history, past cycle times, agency count.
- **Formula:** $P(approve)$ from logistic regression; $P50/P90$ lead from empirical priors.
- **Outputs:** P(approve), P50/P90 days, critical agency list.

### Community License to Operate (CLO)
- **Intent:** Local acceptance risk.
- **Inputs:** Grievance history, land issues, employment share, benefits.
- **Formula:** $CLO = w_g G + w_l L + w_e E + w_b B$ (lower = riskier).
- **Outputs:** Risk band; engagement actions.

---
## Further Extensions

### Deal Valuation Sensitivity (DVS)
- **Intent:** Show which drivers move valuation most.
- **Inputs:** Key drivers (volume, price, cost, FX), base valuation.
- **Formula:** $DVS = \Delta Val / \Delta driver$ (per driver).
- **Outputs:** Ranked sensitivities; top 3 levers.

### Capital Stack Resilience (CSR)
- **Intent:** Stress capital structure under shocks.
- **Inputs:** DSCR/ICR under rate/FX/spread shocks; covenant levels.
- **Formula:** Stress-test DSCR/ICR at P50/P90 shocks; flag breaches.
- **Outputs:** Resilience band; covenant headroom.

### Talent Availability & Wage Pressure (TAW)
- **Intent:** Labor market fit.
- **Inputs:** Skill match, labor depth, wage trend.
- **Formula:** Weighted score; wage CAGR applied to cost base.
- **Outputs:** 0â€“100 score; cost headroom/shortfall.

---
## Usage Notes
- All scores output (value, confidence, rationale, sources). ECS < 0.4 forces a â€œlow-confidenceâ€ flag and softens language in letters/reports.
- PGI and LCR include a perception-vs-observed callout to avoid overstating regional risk; safer alternates can be proposed when LCR is high.
- Counterfactual/Monte Carlo modules feed IVAS, CRI, ECI; telemetry feeds TIS, LRS, TTI.


