/**
 * LettersCatalogModal — Full document & letter generation catalog.
 * Displays all available document types for a given case context and
 * allows the user to generate any document via the AI pipeline.
 */

import React, { useState } from 'react';
import { X, FileText, Mail, Briefcase, Scale, Globe, Shield, BarChart3, ChevronRight, Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatalogParams {
  organizationName?: string;
  country?: string;
  organizationType?: string;
  strategicIntent?: string[];
}

interface LettersCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: CatalogParams;
  brainBlock?: unknown;
  generateFn: (prompt: string) => Promise<string>;
}

// ─── Document catalog ─────────────────────────────────────────────────────────

const CATALOG_CATEGORIES = [
  {
    id: 'strategic',
    label: 'Strategic Intelligence',
    icon: BarChart3,
    color: '#3b82f6',
    documents: [
      { id: 'spi', title: 'Strategic Partnership Intelligence Report', desc: 'Full NSIL-scored analysis with adversarial debate, Monte Carlo simulation, and ethics gate.' },
      { id: 'market-entry', title: 'Market Entry Assessment', desc: 'SAT-validated market entry feasibility with causal inference and historical parallel matching.' },
      { id: 'investment-brief', title: 'Investment Intelligence Brief', desc: 'Concise investment case with risk-adjusted projections and compliance pre-check.' },
      { id: 'competitive', title: 'Competitive Landscape Analysis', desc: 'Cross-domain structural analysis mapping competitive dynamics.' },
    ],
  },
  {
    id: 'letters',
    label: 'Professional Letters',
    icon: Mail,
    color: '#10b981',
    documents: [
      { id: 'intro-letter', title: 'Executive Introduction Letter', desc: 'Formal introduction to a strategic partner or government body.' },
      { id: 'mou', title: 'MOU Intent Letter', desc: 'Letter expressing intent to enter a Memorandum of Understanding.' },
      { id: 'inquiry', title: 'Strategic Inquiry Letter', desc: 'Structured inquiry to explore partnership or investment opportunity.' },
      { id: 'follow-up', title: 'Post-Meeting Follow-Up', desc: 'Professional follow-up summarising next steps and commitments.' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance & Compliance',
    icon: Shield,
    color: '#f59e0b',
    documents: [
      { id: 'ethics-report', title: 'Ethics & Compliance Assessment', desc: 'Full UN/OFAC/GDPR/FATF compliance gate report with bias detection.' },
      { id: 'due-diligence', title: 'Due Diligence Summary', desc: 'Entity verification, sanctions check, ESG assessment, and governance review.' },
      { id: 'risk-register', title: 'Risk Register', desc: '5-dimension risk matrix with Monte Carlo-derived probability scores.' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal & Agreements',
    icon: Scale,
    color: '#8b5cf6',
    documents: [
      { id: 'term-sheet', title: 'Term Sheet Framework', desc: 'Key commercial terms framework for a proposed transaction.' },
      { id: 'nda-brief', title: 'NDA Briefing Note', desc: 'Summary of recommended NDA scope for a strategic engagement.' },
    ],
  },
  {
    id: 'geo',
    label: 'Geopolitical Intelligence',
    icon: Globe,
    color: '#06b6d4',
    documents: [
      { id: 'geo-brief', title: 'Geopolitical Risk Brief', desc: 'Cross-domain geopolitical risk assessment using causal inference and historical parallels.' },
      { id: 'country-profile', title: 'Country Intelligence Profile', desc: 'Economic, regulatory, cultural, and risk profile for target market.' },
    ],
  },
  {
    id: 'proposals',
    label: 'Proposals & Pitches',
    icon: Briefcase,
    color: '#ef4444',
    documents: [
      { id: 'proposal', title: 'Strategic Partnership Proposal', desc: 'Full proposal document with symbiotic benefit analysis and recommended deal structure.' },
      { id: 'exec-summary', title: 'Executive Summary', desc: 'One-page executive summary for C-suite or board presentation.' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const LettersCatalogModal: React.FC<LettersCatalogModalProps> = ({
  isOpen,
  onClose,
  params,
  generateFn,
}) => {
  const [activeCategory, setActiveCategory] = useState('strategic');
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const category = CATALOG_CATEGORIES.find(c => c.id === activeCategory) || CATALOG_CATEGORIES[0];
  const org = params.organizationName || 'your organisation';
  const country = params.country || 'target market';

  const handleGenerate = async (docId: string, docTitle: string) => {
    setGenerating(docId);
    try {
      const prompt = `Generate a professional ${docTitle} for ${org} targeting ${country}. ${params.strategicIntent?.join('. ') || ''}. Be concise, analytical, and grounded in the ADVERSIQ intelligence framework.`;
      const result = await generateFn(prompt);
      setGenerated(prev => ({ ...prev, [docId]: result }));
    } catch {
      setGenerated(prev => ({ ...prev, [docId]: 'Generation failed. Please add an AI provider key to .env to enable document synthesis.' }));
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Document & Letter Catalog</h2>
              <p className="text-xs text-slate-500">{org} · {country}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar — categories */}
          <div className="w-52 flex-none border-r border-slate-200 bg-slate-50 overflow-y-auto">
            {CATALOG_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${activeCategory === cat.id ? 'bg-white border-r-2 border-blue-500' : 'hover:bg-white/70'}`}
                >
                  <Icon size={14} style={{ color: cat.color }} />
                  <span className="text-xs font-medium text-slate-700">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main — document list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <category.icon size={16} style={{ color: category.color }} />
              <h3 className="text-sm font-bold text-slate-800">{category.label}</h3>
              <span className="text-xs text-slate-400">({category.documents.length} documents)</span>
            </div>

            {category.documents.map(doc => (
              <div key={doc.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
                  </div>
                  <button
                    onClick={() => handleGenerate(doc.id, doc.title)}
                    disabled={generating === doc.id}
                    className="flex-none flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {generating === doc.id ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} />}
                    {generating === doc.id ? 'Generating…' : 'Generate'}
                  </button>
                </div>

                {generated[doc.id] && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                      {generated[doc.id]}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LettersCatalogModal;
