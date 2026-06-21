/**
 * Research API Routes
 * 
 * Endpoints for accessing specialized research findings with
 * mathematical formulas in LaTeX format
 */

import { Router, Request, Response } from 'express';
import { AutonomousSwarm } from '../ai/AutonomousSwarm.js';

const router = Router();
const swarm = new AutonomousSwarm();

/**
 * GET /api/research/domains
 * List all available research domains
 */
router.get('/domains', (req: Request, res: Response) => {
  const domains = [
    'economics',
    'logistics',
    'policy',
    'environment',
    'geopolitics'
  ];

  res.json({
    domains,
    description: 'Available research domains with specialized analysis agents',
    domainDetails: {
      economics: {
        focus: 'Market dynamics, production functions, elasticity analysis',
        keyFormulas: ['Cobb-Douglas', 'Supply Elasticity']
      },
      logistics: {
        focus: 'Supply chain optimization, inventory management, routing',
        keyFormulas: ['Economic Order Quantity (EOQ)', 'Reorder Point']
      },
      policy: {
        focus: 'Regulatory impact, tax incidence, governance analysis',
        keyFormulas: ['Tax Incidence', 'Regulatory Cost Impact']
      },
      environment: {
        focus: 'Carbon footprint, resource depletion, sustainability',
        keyFormulas: ['Carbon Footprint', 'Depletion Rate']
      },
      geopolitics: {
        focus: 'Risk assessment, political stability, conflict analysis',
        keyFormulas: ['Risk Severity Index']
      }
    }
  });
});

/**
 * POST /api/research/conduct
 * Execute specialized research across domains
 * 
 * Body: {
 *   query: string (research question),
 *   domains?: string[] (specific domains to research, or all if omitted),
 *   context?: Record<string, any> (contextual information)
 * }
 */
router.post('/conduct', async (req: Request, res: Response) => {
  try {
    const { query, domains, context } = req.body;

    if (!query) {
      res.status(400).json({ error: 'Research query required' });
      return;
    }

    console.log(`[API] Research request: ${query}`);

    const findings = await swarm.conductSpecializedResearch(
      query,
      domains,
      context
    );

    res.json(findings);
  } catch (error) {
    console.error('[API] Research error:', error);
    res.status(500).json({ error: 'Research execution failed' });
  }
});

/**
 * POST /api/research/formula-render
 * Render LaTeX formula to SVG/HTML
 * 
 * Body: {
 *   latex: string (LaTeX formula),
 *   format?: 'svg' | 'html' | 'png' (default: 'html')
 * }
 */
router.post('/formula-render', (req: Request, res: Response) => {
  try {
    const { latex, format = 'html' } = req.body;

    if (!latex) {
      res.status(400).json({ error: 'LaTeX formula required' });
      return;
    }

    // Return formula with rendering instructions for frontend
    const rendered = {
      latex,
      format,
      renderInstructions: {
        frontend: 'Use KaTeX library to render: katex.render(latex, element)',
        html: `<script src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"></script>
               <div id="formula"></div>
               <script>
                 katex.render("${latex}", document.getElementById("formula"))
               </script>`,
        markdown: `$${latex}$`
      },
      variables: extractVariablesFromLatex(latex)
    };

    res.json(rendered);
  } catch (error) {
    console.error('[API] Formula render error:', error);
    res.status(500).json({ error: 'Formula rendering failed' });
  }
});

/**
 * Helper: Extract variables from LaTeX formula
 */
function extractVariablesFromLatex(latex: string): string[] {
  // Simple extraction of single letters and Greek letters
  const matches = latex.match(/\\[a-z]+|[a-zA-Z_]/g) || [];
  return [...new Set(matches)];
}

export default router;
