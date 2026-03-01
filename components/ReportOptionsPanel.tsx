/**
 * REPORT OPTIONS PANEL
 *
 * Shown in BWConsultantOS after a document is uploaded and analysed.
 * Displays the full options menu from ReportLengthRouter:
 *   - Detected document info
 *   - Primary report tiers (scale up/down)
 *   - Additional complementary reports
 *   - Unconventional ideas the system surfaces
 *   - Letter options
 */

import React, { useState } from 'react';
import {
  FileText,
  Lightbulb,
  Mail,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Zap,
  BookOpen,
  BarChart3,
  Globe,
  Download,
  ArrowRight,
  Layers,
} from 'lucide-react';
import type { ReportOptionsMenu, ReportTierKey } from '../services/ReportLengthRouter';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ReportOptionsPanelProps {
  menu: ReportOptionsMenu;
  documentTitle: string;
  documentType: string;
  /** Called when user selects a tier and clicks Generate */
  onSelectTier: (tierKey: ReportTierKey, includeAnnotation: boolean) => void;
  /** Called when user adds an additional report to the queue */
  onAddReport: (reportId: string, title: string) => void;
  /** Called when user selects a letter to generate */
  onAddLetter: (letterId: string, title: string) => void;
  /** Called when user wants the annotated PDF */
  onGenerateAnnotatedPDF: () => void;
  onDismiss: () => void;
}

// ─── Severity colours ──────────────────────────────────────────────────────────

const IMPACT_COLOURS: Record<string, string> = {
  transformational: 'text-violet-700 bg-violet-50 border-violet-200',
  significant:      'text-blue-700 bg-blue-50 border-blue-200',
  moderate:         'text-stone-600 bg-stone-50 border-stone-200',
};

const BOLDNESS_COLOURS = (score: number): string => {
  if (score >= 9) return 'bg-red-100 text-red-700 border-red-200';
  if (score >= 7) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (score >= 5) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-green-100 text-green-700 border-green-200';
};

const RISK_ICON: Record<string, React.ReactNode> = {
  high:   <AlertTriangle size={12} className="text-red-500" />,
  medium: <AlertTriangle size={12} className="text-amber-500" />,
  low:    <CheckCircle size={12} className="text-green-500" />,
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  analysis:      <BarChart3 size={14} className="text-blue-500" />,
  strategy:      <Globe size={14} className="text-violet-500" />,
  compliance:    <CheckCircle size={14} className="text-green-600" />,
  communication: <Mail size={14} className="text-amber-600" />,
  finance:       <Layers size={14} className="text-emerald-600" />,
};

// ─── Tab bar ───────────────────────────────────────────────────────────────────

type Tab = 'primary' | 'additional' | 'unconventional' | 'letters';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'primary',        label: 'Report Length',    icon: <FileText size={13} /> },
  { key: 'additional',     label: 'More Reports',     icon: <BookOpen size={13} /> },
  { key: 'unconventional', label: 'Bold Ideas',       icon: <Lightbulb size={13} /> },
  { key: 'letters',        label: 'Letters',          icon: <Mail size={13} /> },
];

// ─── Component ─────────────────────────────────────────────────────────────────

const ReportOptionsPanel: React.FC<ReportOptionsPanelProps> = ({
  menu,
  documentTitle,
  documentType,
  onSelectTier,
  onAddReport,
  onAddLetter,
  onGenerateAnnotatedPDF,
  onDismiss,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('primary');
  const [selectedTier, setSelectedTier] = useState<ReportTierKey>(menu.recommendedTier);
  const [includeAnnotation, setIncludeAnnotation] = useState(true);
  const [addedReports, setAddedReports] = useState<Set<string>>(new Set());
  const [addedLetters, setAddedLetters] = useState<Set<string>>(new Set());
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const { diagnostics } = menu;

  const handleAddReport = (id: string, title: string) => {
    setAddedReports(prev => new Set([...prev, id]));
    onAddReport(id, title);
  };

  const handleAddLetter = (id: string, title: string) => {
    setAddedLetters(prev => new Set([...prev, id]));
    onAddLetter(id, title);
  };

  // ── Render: header diagnostic strip ─────────────────────────────────────────

  const renderDiagnosticStrip = () => (
    <div className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-amber-600" />
        <span className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Document Detected</span>
      </div>
      <div className="text-sm font-semibold text-stone-900 mb-1 truncate">{documentTitle}</div>
      <div className="text-xs text-stone-500 mb-3">{documentType}</div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Est. pages', value: `~${diagnostics.sourcePageEstimate}` },
          { label: 'Words', value: diagnostics.sourceWordCount.toLocaleString() },
          { label: 'Complexity', value: `${diagnostics.complexityScore}/100` },
          { label: 'Engines', value: `${diagnostics.enginesActivated} active` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center bg-white border border-stone-200 rounded-md py-1.5 px-2">
            <div className="text-xs font-bold text-stone-900">{value}</div>
            <div className="text-[10px] text-stone-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Render: primary report tier selection ───────────────────────────────────

  const renderPrimaryTab = () => (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 mb-2">
        System recommends <strong className="text-amber-700">{menu.tiers.find(t => t.recommended)?.label}</strong> based on
        your document ({diagnostics.sourcePageEstimate} pages estimated) and case complexity score of {diagnostics.complexityScore}/100.
      </p>
      {menu.tiers.map(tier => {
        const isSelected = selectedTier === tier.key;
        return (
          <button
            key={tier.key}
            className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
              isSelected
                ? 'border-amber-500 bg-amber-50'
                : tier.recommended
                  ? 'border-amber-200 bg-white hover:border-amber-300'
                  : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
            onClick={() => setSelectedTier(tier.key)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-900">{tier.label}</span>
                  {tier.recommended && (
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                  <span>{tier.pageRange} page{tier.pageRange !== '1' ? 's' : ''}</span>
                  <span>·</span>
                  <span>{tier.wordRange} words</span>
                  <span>·</span>
                  <span>{tier.sectionCount} sections</span>
                  <span>·</span>
                  <span className="text-blue-600">{tier.turnaround}</span>
                </div>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">{tier.description}</p>
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-stone-200">
                    <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Sections included:</div>
                    <div className="flex flex-wrap gap-1">
                      {tier.sections.map(s => (
                        <span key={s} className="text-[10px] bg-white border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1.5 text-[10px] text-stone-400 italic">Best for: {tier.bestFor}</div>
                  </div>
                )}
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                isSelected ? 'border-amber-500 bg-amber-500' : 'border-stone-300'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          </button>
        );
      })}

      {/* Annotated PDF toggle */}
      <div className="flex items-center gap-3 mt-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
        <button
          className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
            includeAnnotation ? 'bg-blue-600 border-blue-600' : 'border-stone-400 bg-white'
          }`}
          onClick={() => setIncludeAnnotation(v => !v)}
        >
          {includeAnnotation && <CheckCircle size={10} className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-blue-800">Also generate Annotated Source PDF</div>
          <div className="text-[10px] text-blue-600 mt-0.5">
            Source passages highlighted with red border → connector line → OS analysis callout box. Exported as BWGA-Annotated-[title].pdf
          </div>
        </div>
      </div>

      {/* Generate button */}
      <button
        className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        onClick={() => onSelectTier(selectedTier, includeAnnotation)}
      >
        <Zap size={15} />
        Generate {menu.tiers.find(t => t.key === selectedTier)?.label}
        <ArrowRight size={14} />
      </button>
    </div>
  );

  // ── Render: additional reports ────────────────────────────────────────────────

  const renderAdditionalTab = () => (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 mb-2">
        These complementary documents strengthen your primary report and address specific gaps identified in the source material.
      </p>
      {menu.additionalReports.map(report => {
        const isAdded = addedReports.has(report.id);
        const isExpanded = expandedReport === report.id;
        return (
          <div key={report.id} className={`rounded-lg border bg-white overflow-hidden transition-colors ${isAdded ? 'border-green-300' : 'border-stone-200'}`}>
            <button
              className="w-full text-left p-3 flex items-start gap-3"
              onClick={() => setExpandedReport(isExpanded ? null : report.id)}
            >
              <div className="flex-shrink-0 mt-0.5">{CATEGORY_ICON[report.category]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-900">{report.title}</span>
                  {isAdded && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">
                      Added
                    </span>
                  )}
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded ml-auto">{report.pages}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{report.description}</p>
              </div>
              {isExpanded ? <ChevronDown size={14} className="text-stone-400 flex-shrink-0 mt-0.5" /> : <ChevronRight size={14} className="text-stone-400 flex-shrink-0 mt-0.5" />}
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 border-t border-stone-100 bg-stone-50">
                <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mt-2 mb-1">Why this matters:</div>
                <p className="text-xs text-stone-700 leading-relaxed mb-3">{report.rationale}</p>
                {!isAdded && (
                  <button
                    className="text-xs font-semibold bg-stone-900 text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors flex items-center gap-1.5"
                    onClick={() => handleAddReport(report.id, report.title)}
                  >
                    <Download size={11} />
                    Add to document package
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Render: unconventional ideas ──────────────────────────────────────────────

  const renderUnconventionalTab = () => (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-2">
        <Lightbulb size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          These are ideas the OS has surfaced through CounterfactualEngine and MotivationDetector that
          would <strong>not normally be considered</strong> in mainstream policy discussions.
          They can be included as a speculative appendix or developed into standalone options papers.
        </p>
      </div>
      {menu.unconventionalIdeas.map(idea => {
        const isExpanded = expandedIdea === idea.id;
        return (
          <div
            key={idea.id}
            className="rounded-lg border border-stone-200 bg-white overflow-hidden"
          >
            <button
              className="w-full text-left p-3 flex items-start gap-3"
              onClick={() => setExpandedIdea(isExpanded ? null : idea.id)}
            >
              <Lightbulb size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-900">{idea.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${BOLDNESS_COLOURS(idea.boldnesScore)}`}>
                    Boldness {idea.boldnesScore}/10
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${IMPACT_COLOURS[idea.potentialImpact]}`}>
                    {idea.potentialImpact}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-stone-500">
                    {RISK_ICON[idea.risk]} {idea.risk} risk
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed line-clamp-2">{idea.concept}</p>
              </div>
              {isExpanded ? <ChevronDown size={14} className="text-stone-400 flex-shrink-0 mt-0.5" /> : <ChevronRight size={14} className="text-stone-400 flex-shrink-0 mt-0.5" />}
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 border-t border-stone-100 space-y-2">
                <div>
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mt-2 mb-1">The Concept:</div>
                  <p className="text-xs text-stone-800 leading-relaxed">{idea.concept}</p>
                </div>
                {idea.precedent && (
                  <div>
                    <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Historical Precedent:</div>
                    <p className="text-xs text-blue-700 italic">{idea.precedent}</p>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Why It's Not Being Considered:</div>
                  <p className="text-xs text-stone-600 leading-relaxed">{idea.whyNotConsidered}</p>
                </div>
                <button
                  className="text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-md hover:bg-amber-700 transition-colors flex items-center gap-1.5 mt-1"
                  onClick={() => handleAddReport(idea.id, idea.title)}
                >
                  <Lightbulb size={11} />
                  Include in final document as speculative appendix
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Render: letters ───────────────────────────────────────────────────────────

  const renderLettersTab = () => (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 mb-2">
        These letters accompany your primary report. Each addresses a different stakeholder and is
        formatted to the appropriate tone (ministerial, multilateral, executive).
      </p>
      {menu.letters.map(letter => {
        const isAdded = addedLetters.has(letter.id);
        return (
          <div
            key={letter.id}
            className={`rounded-lg border p-3 bg-white transition-colors ${isAdded ? 'border-green-300 bg-green-50' : letter.recommended ? 'border-amber-200' : 'border-stone-200'}`}
          >
            <div className="flex items-start gap-3">
              <Mail size={14} className={letter.recommended ? 'text-amber-600' : 'text-stone-400'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-900">{letter.title}</span>
                  {letter.recommended && !isAdded && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  {isAdded && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">
                      Added
                    </span>
                  )}
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded ml-auto">{letter.pages}</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 italic">To: {letter.addressedTo}</div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{letter.purpose}</p>
                {!isAdded && (
                  <button
                    className="mt-2 text-xs font-semibold bg-stone-900 text-white px-2.5 py-1 rounded hover:bg-stone-700 transition-colors flex items-center gap-1"
                    onClick={() => handleAddLetter(letter.id, letter.title)}
                  >
                    <Mail size={10} />
                    Add letter
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Root render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-stone-900 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-0.5">NEXUS AI — DOCUMENT RESPONSE OPTIONS</div>
          <div className="text-white text-sm font-semibold truncate max-w-xs">{documentTitle}</div>
        </div>
        <button
          className="text-stone-400 hover:text-white text-xs border border-stone-600 rounded px-2 py-1 transition-colors"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>

      <div className="p-4">
        {/* Diagnostic strip */}
        {renderDiagnosticStrip()}

        {/* Annotated PDF quick action */}
        <button
          className="w-full mb-4 flex items-center gap-3 p-3 rounded-lg border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
          onClick={onGenerateAnnotatedPDF}
        >
          <Download size={16} className="text-blue-600 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-blue-800">Generate Annotated Source PDF</div>
            <div className="text-[10px] text-blue-600 mt-0.5">
              Source passages circled → line → OS analysis callout. Download immediately as .pdf
            </div>
          </div>
          <ArrowRight size={14} className="text-blue-500 ml-auto flex-shrink-0" />
        </button>

        {/* Tab bar */}
        <div className="flex border-b border-stone-200 mb-4 -mx-0 gap-0.5">
          {TABS.map(tab => {
            const count =
              tab.key === 'additional' ? menu.additionalReports.length :
              tab.key === 'unconventional' ? menu.unconventionalIdeas.length :
              tab.key === 'letters' ? menu.letters.length :
              menu.tiers.length;
            return (
              <button
                key={tab.key}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {tab.label}
                <span className="bg-stone-100 text-stone-600 text-[10px] px-1 rounded-full">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="max-h-96 overflow-y-auto pr-1">
          {activeTab === 'primary'        && renderPrimaryTab()}
          {activeTab === 'additional'     && renderAdditionalTab()}
          {activeTab === 'unconventional' && renderUnconventionalTab()}
          {activeTab === 'letters'        && renderLettersTab()}
        </div>
      </div>
    </div>
  );
};

export default ReportOptionsPanel;
