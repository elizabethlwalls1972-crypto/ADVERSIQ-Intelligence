# Quick Reference: Research Agents & Formulas

## API Quick Start

### List Available Domains
```bash
curl http://localhost:3004/api/research/domains
```

### Conduct Research
```bash
curl -X POST http://localhost:3004/api/research/conduct \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Your research question here",
    "domains": ["economics", "logistics"],
    "context": {"sector": "mining"}
  }'
```

### Render Formula
```bash
curl -X POST http://localhost:3004/api/research/formula-render \
  -H "Content-Type: application/json" \
  -d '{"latex": "\\frac{2DS}{H}"}'
```

---

## Available Research Domains

| Domain | Focus | Key Formulas |
|--------|-------|--------------|
| **economics** | Market dynamics, production, elasticity | Cobb-Douglas, Supply Elasticity |
| **logistics** | Supply chain, inventory, routing | EOQ, Reorder Point |
| **policy** | Regulations, taxes, governance | Tax Incidence, Regulatory Cost |
| **environment** | Carbon, resources, sustainability | Carbon Footprint, Depletion Rate |
| **geopolitics** | Risk, stability, conflict | Risk Severity Index |

---

## Formula Reference

### Economics Formulas

**Production Function**
```
Q = A · K^α · L^(1-α)
Q = output, A = productivity, K = capital, L = labor
Typical: α ≈ 0.3-0.35 (capital elasticity)
```

**Supply Elasticity**
```
ε = (dQ/dP) · (P/Q)
ε = elasticity coefficient
ε > 1 = elastic supply, ε < 1 = inelastic
```

### Logistics Formulas

**Economic Order Quantity**
```
EOQ = √(2DS/H)
D = annual demand, S = order cost, H = holding cost
Minimizes: Order cost + Holding cost
```

**Reorder Point**
```
ROP = d·L + z·σ·√L
d = daily demand, L = lead time, z = service factor
σ = demand std dev
z values: 1.65 (95%), 1.96 (97.5%), 2.33 (99%)
```

### Policy Formulas

**Tax Burden**
```
Incidence_consumer = E_s / (E_s + |E_d|)
E_s = supply elasticity, E_d = demand elasticity
Higher E_s → consumer bears more tax
```

**Regulatory Compliance Cost**
```
RC = (ρ·M·n^β) / (1 + γ·t)
ρ = cost/regulation, M = market size, n = firms
β = economies of scale, γ = amortization, t = years
```

### Environmental Formulas

**Carbon Footprint**
```
CF = Σ(A_i · EF_i · GWP_i)
A_i = activity level (energy, transport, etc)
EF_i = emission factor per activity
GWP_i = global warming potential
Returns: tonnes CO2-equivalent
```

**Resource Depletion**
```
DR = (R/E) / r
R = known reserves, E = annual extraction
r = exponential growth rate (% per year)
Returns: years until depletion at current growth
```

### Geopolitical Formulas

**Risk Index**
```
RSI = (P·I·M) / (R + C)
P = probability (0-1), I = impact (1-10)
M = market exposure, R = resilience, C = capital buffer
Higher RSI = higher risk
```

---

## Integration Examples

### Example 1: Mining Economics
```json
{
  "query": "Economic viability of copper mining in Peru",
  "domains": ["economics", "logistics", "environment"],
  "context": {
    "ore_grade": "0.8%",
    "elevation": "4000m",
    "annual_target": "50000_tons"
  }
}
```

**Expected Findings:**
- Cobb-Douglas production function with capital/labor ratios
- EOQ for concentrate transport
- Carbon footprint per ton ore
- Depletion timeline for known reserves

### Example 2: Supply Chain Risk
```json
{
  "query": "Supply chain resilience under geopolitical stress",
  "domains": ["logistics", "geopolitics", "policy"],
  "context": {
    "region": "Indo-Pacific",
    "critical_materials": "rare_earths"
  }
}
```

**Expected Findings:**
- Reorder point adjustments for instability
- Risk severity index for critical routes
- Regulatory impact on sourcing alternatives

### Example 3: Climate Scenario
```json
{
  "query": "Carbon accounting and climate commitments",
  "domains": ["environment", "policy", "economics"],
  "context": {
    "scope": "scope_1_2_3",
    "target_year": 2030
  }
}
```

**Expected Findings:**
- Carbon footprint breakdown by source
- Cost of emission reduction (formula-based)
- Regulatory compliance cost trajectory

---

## Frontend Integration (React/TypeScript)

### Using KaTeX for Formula Rendering

```typescript
import React, { useEffect } from 'react';

const FormulaDisplay: React.FC<{ latex: string }> = ({ latex }) => {
  useEffect(() => {
    if (window.katex) {
      window.katex.render(latex, document.getElementById('formula'), {
        displayMode: true,
        throwOnError: false
      });
    }
  }, [latex]);

  return <div id="formula"></div>;
};

// Usage:
<FormulaDisplay latex="EOQ = \\sqrt{\\frac{2DS}{H}}" />
```

### Fetching Research

```typescript
const response = await fetch('/api/research/conduct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Mining impact analysis',
    domains: ['economics', 'environment'],
    context: { region: 'Andes' }
  })
});

const findings = await response.json();
// findings.findings[0].formulas = [{ latex: '...', description: '...' }]
```

---

## Confidence Levels

| Score | Interpretation |
|-------|-----------------|
| 0.90+ | Very High confidence - primary analysis |
| 0.80-0.89 | High confidence - validated findings |
| 0.70-0.79 | Moderate confidence - use with context |
| 0.60-0.69 | Lower confidence - supplementary only |
| <0.60 | Insufficient - requires additional research |

---

## Variable Definitions

### Universal
- `t` = time (usually years)
- `r` = rate (growth, discount, return)
- `i`, `j`, `n` = indices or counts
- `σ` = standard deviation
- `Σ` = summation
- `∂` = partial derivative

### Economics
- `Q` = quantity, `P` = price
- `E` = elasticity
- `K` = capital, `L` = labor
- `A` = total factor productivity

### Logistics
- `D` = demand, `S` = setup/order cost
- `H` = holding cost
- `L` = lead time
- `EOQ` = economic order quantity

### Finance
- `NPV` = net present value
- `IRR` = internal rate of return
- `WACC` = weighted average cost of capital

---

## Troubleshooting

**Q: Research taking too long?**
- Reduce number of domains
- Use specific context to narrow search
- Check system uptime: `/api/omni/status`

**Q: Formulas not rendering in frontend?**
- Verify KaTeX script loaded: `window.katex` in console
- Check LaTeX syntax in response
- Use LaTeX validator: `https://www.latexbase.com/`

**Q: Getting inconsistent results?**
- Research cache is cleared on server restart
- Results vary based on LLM backend
- Run same query twice to verify consistency

**Q: How do I use formulas in calculations?**
- Extract variable definitions from response
- Implement formula in your code/tool
- KaTeX is for display only; use math library for computation

---

## Performance Tips

1. **Cache results** - Same query returns same findings
2. **Batch queries** - Request multiple domains at once
3. **Limit depth** - Research agents have MAX_DEPTH=3 recursion
4. **Context matters** - Specific context narrows analysis faster

---

## Links

- Dashboard: http://localhost:3002/ (after `npm run dev`)
- API Docs: `/api/research/domains`
- Research Framework: `server/ai/ResearchAgentFramework.ts`
- Dashboard Code: `components/AdvancedOmniNodeDashboard.tsx`
- Full Guide: `RESEARCH_AGENTS_AND_MATHEMATICAL_TYPESETTING_GUIDE.md`
