# Modeling Plan: NSIL-Driven Live Intelligence (Production Grade)

## Objectives
- Replace mocked logic with calibrated, explainable models powering the Control Matrix and live document preview.
- Support on-demand regional reports using 100-year macro/trade history plus live data; produce defensible outputs (scores, narratives, and NSIL traceability).
- Quantify uncertainty (Monte Carlo bands) and show provenance/confidence per metric.

## Data Backbone (inputs & provenance)
- Macro/trade: IMF WEO, World Bank, UN Comtrade (history + latest); currency via ECB/FX APIs.
- Infra/logistics: WEF GCI pillars, WB LPI, ITU (digital), energy reliability; transport/port stats where available.
- Talent/education: ILO/UNESCO/LinkedIn public stats; wage bands; STEM grads.
- ESG/climate: IEA, NOAA/Copernicus risk layers; ESG country scores (open where possible).
- Governance/regulation: WGI, EODB, tariff/NTB snapshots; local policy/news feeds.
- Sanctions/AML: OFAC/UN/EU consolidated lists; basic KYC flags.
- News/reg feeds: RSS/structured parsers with country/sector filters.
- Provenance: store source, vintage, coverage %, freshness; propagate to confidence scores.

## 12-Component Investment Algorithm (composite)
For each component: normalize 0â€“100, weight, and produce contribution + confidence.
1) Infrastructure (physical/digital): transport, port/airport throughput, grid reliability, broadband.
2) Talent availability: skill depth, wage levels, STEM output, language fit.
3) Cost efficiency: labor, energy, real estate, logistics basket vs. benchmark.
4) Market access: trade agreements, tariff/NTB, proximity/shipping time, market size.
5) Regulatory environment: ease, predictability, permits time/variance, IP enforcement.
6) Political stability: WGI stability, protest/instability indices, election cycle risk.
7) Growth potential: GDP/CAGR, sector CAGR, FDI trends, urbanization, adoption curves.
8) Risk factors: currency vol, corruption indices, security/crime, supply chain fragility.
9) Digital readiness: broadband, cloud adoption, e-government, payments penetration.
10) Sustainability/ESG: emissions intensity, energy mix, climate risk, ESG governance.
11) Innovation index: R&D spend, patents per capita, startup density, university rank.
12) Supply chain efficiency: dwell time, customs, LPI components, trucking costs.
Composite score = weighted sum with calibrated weights; output: score, contributions, top drivers, confidence based on coverage/freshness.

## Core Trinity (production math)
- IVAS (Investment Velocity): models capital deployment time. Inputs: permit lag distro, infra readiness, partner execution capacity, corruption/friction; output P10/P50/P90 timeline, velocity score, sensitivity drivers.
- SCF (Strategic Cash Flow): non-linear cascade with sector multipliers and leakages; phased impact (Year 1-5/10), jobs direct/indirect, fiscal effects; Monte Carlo on adoption/friction.
- SPI (Symbiotic Partnership Index): asymmetry fit, institutional/cultural distance, operational overlap, governance strength; outputs survival probability, symbiosis score, rationale bullets.

## Case/Derivative Engines (implement iteratively)
Strategic: RROI, SEAM, LAI, BARNA, NVI, CRI.
Operational: CAP, AGI, VCI, ATI, ESI, ISI, OSI, TCO.
Risk: PRI, RNI, SRA, IDV.
Each needs: inputs, normalization, weights, equation, confidence, and explainability string.

## Monte Carlo & Uncertainty
- Sample key variables (friction, permit time, adoption, price elasticity, FX) with bounded distributions per region/sector.
- Report P10/P50/P90 for IVAS timelines, SCF impacts, risk indices; include tornado chart drivers.

## Explainability & Traceability
- Store inputs, weights, and component scores; emit â€œwhyâ€ text per metric.
- Expose NSIL trace: show XML + rendered view; include source links and freshness per data point.

## UI Integration (Control Matrix + Live Doc)
- Pre-flight completeness meter; block/flag missing critical inputs.
- Confidence badges per card; â€œwhy it mattersâ€ tooltips tied to formulas.
- Suggested follow-on docs: strategy brief, risk memo, partner shortlist, implementation plan.

## Milestones
1) Spec + data map (this doc).
2) Implement 12-component composite + RROI; hook to data mock + unit tests.
3) Implement IVAS + SCF + SPI with Monte Carlo and explainers.
4) Implement remaining derivative indices with tests.
5) Integrate into Control Matrix + live preview; surface confidence/provenance.
6) Wire data backbone (ETL) and refresh schedules; turn on live provenance in UI.

