
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Mic, Send, Paperclip, ChevronRight, 
  CheckCircle2, Globe, Building2, Target, ShieldCheck, 
  Download, Sparkles, RefreshCw, Layers, UserCircle,
  MoreHorizontal, Printer, AlertCircle
} from 'lucide-react';
import { ReportParameters } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface UnifiedReportBuilderProps {
  params: ReportParameters;
  currentStep?: number;
  onClose?: () => void;
}

// --- AGENDA STEPS (The "Meeting" Flow) ---
const AGENDA_STEPS = [
    { id: 'identity', label: 'Organization DNA', icon: Building2, desc: 'Establish identity & scale' },
    { id: 'mandate', label: 'Strategic Mandate', icon: Target, desc: 'Define the mission' },
    { id: 'risk', label: 'Risk Calibration', icon: ShieldCheck, desc: 'Set operational boundaries' },
];

const UnifiedReportBuilder: React.FC<UnifiedReportBuilderProps> = ({ params: initialParams, onClose }) => {
  // Local state for the "Meeting"
  const [params, setParams] = useState<ReportParameters>(initialParams);
  const [activeStep, setActiveStep] = useState<'identity' | 'mandate' | 'risk'>('identity');
  const [aiThinking, setAiThinking] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
      { role: 'ai', text: "I'm ready to draft your strategic dossier. Let's start with the Organization DNA. What is the legal entity name and primary jurisdiction?" }
  ]);

  // Derived State for Document Preview
  const docRef = useRef<HTMLDivElement>(null);

  const updateParam = (key: keyof ReportParameters, value: any) => {
      setParams(prev => ({ ...prev, [key]: value }));
  };

  // Simulate AI "Listening" and auto-filling
  const handleSendMessage = () => {
      if (!chatInput.trim()) return;
      
      const newMsg = chatInput;
      setMessages(prev => [...prev, { role: 'user', text: newMsg }]);
      setChatInput('');
      setAiThinking(true);

      // Simulated NLP parsing
      setTimeout(() => {
          setAiThinking(false);
          let responseText = "I've updated the dossier.";
          
          if (activeStep === 'identity') {
             if (newMsg.toLowerCase().includes("tech")) updateParam('industry', ['Technology']);
             if (newMsg.toLowerCase().includes("vietnam")) updateParam('country', 'Vietnam');
             responseText = "Noted. I've updated the Sector and Jurisdiction based on your input. Please confirm the Revenue Band below.";
          } else if (activeStep === 'mandate') {
              updateParam('problemStatement', newMsg);
              responseText = "I've drafted that into the 'Strategic Intent' section of the document.";
          }

          setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
      }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) handleSendMessage();
  };

  // --- RENDERERS ---

  const renderAgendaItem = (stepId: string, label: string, Icon: any, description: string) => {
      const isActive = activeStep === stepId;
      const isCompleted = stepId === 'identity' && params.organizationName && params.country; // Simplified check

      return (
          <button 
            onClick={() => setActiveStep(stepId as any)}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all duration-300 group border ${isActive ? 'bg-white/10 border-bw-gold/50 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'}`}
          >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-bw-gold text-bw-navy' : isCompleted ? 'bg-green-900 text-green-400' : 'bg-stone-800 text-stone-500'}`}>
                  {isCompleted && !isActive ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </div>
              <div className="flex-1">
                  <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'}`}>{label}</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider">{description}</div>
              </div>
              {isActive && <ChevronRight className="text-bw-gold w-4 h-4 animate-pulse" />}
          </button>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950 flex font-sans overflow-hidden">
        
        {/* --- LEFT PANEL: THE CONSULTANT (40%) --- */}
        <div className="w-[450px] flex flex-col border-r border-stone-800 bg-stone-900/50 backdrop-blur-xl relative z-20 shadow-2xl">
            
            {/* Header */}
            <div className="h-16 border-b border-stone-800 flex items-center justify-between px-6 bg-stone-900">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-bw-gold rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-bw-navy" />
                    </div>
                    <span className="font-bold text-white tracking-tight">Nexus Consultant</span>
                </div>
                <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
                    Exit Session
                </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                
                {/* 1. Meeting Agenda */}
                <div className="p-6 space-y-2 border-b border-stone-800/50">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-4 px-2">Session Agenda</h4>
                    {AGENDA_STEPS.map(step => renderAgendaItem(step.id, step.label, step.icon, step.desc))}
                </div>

                {/* 2. Active Topic Interface */}
                <div className="flex-1 p-6">
                    <AnimatePresence mode='wait'>
                        <motion.div 
                            key={activeStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Context Header */}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-green-400 uppercase">Live: {AGENDA_STEPS.find(s => s.id === activeStep)?.label}</span>
                            </div>

                            {activeStep === 'identity' && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-400 uppercase">Organization Name</label>
                                        <input 
                                            value={params.organizationName}
                                            onChange={e => updateParam('organizationName', e.target.value)}
                                            className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white text-sm focus:border-bw-gold focus:ring-1 focus:ring-bw-gold outline-none transition-all placeholder:text-stone-600"
                                            placeholder="e.g. Acme Industries Global"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-400 uppercase">Jurisdiction</label>
                                            <select 
                                                value={params.country}
                                                onChange={e => updateParam('country', e.target.value)}
                                                className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white text-sm focus:border-bw-gold outline-none appearance-none"
                                            >
                                                <option value="">Select...</option>
                                                <option value="Vietnam">Vietnam</option>
                                                <option value="Singapore">Singapore</option>
                                                <option value="United States">United States</option>
                                                <option value="Germany">Germany</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-stone-400 uppercase">Sector</label>
                                            <input 
                                                value={params.industry[0] || ''}
                                                onChange={e => updateParam('industry', [e.target.value])}
                                                className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white text-sm focus:border-bw-gold outline-none"
                                                placeholder="e.g. Manufacturing"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-400 uppercase">Operational Scale</label>
                                        <select 
                                            value={params.revenueBand || ''}
                                            onChange={e => updateParam('revenueBand', e.target.value)}
                                            className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white text-sm focus:border-bw-gold outline-none appearance-none"
                                        >
                                            <option value="">Select Revenue Band...</option>
                                            <option value="Under $1M">Seed / Startup (&lt; $1M)</option>
                                            <option value="$10M - $50M">Growth ($10M - $50M)</option>
                                            <option value="Over $100M">Enterprise (&gt; $100M)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeStep === 'mandate' && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-400 uppercase">Primary Objective</label>
                                        <select 
                                            value={params.strategicIntent[0] || ''}
                                            onChange={e => updateParam('strategicIntent', [e.target.value])}
                                            className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white text-sm focus:border-bw-gold outline-none appearance-none"
                                        >
                                            <option value="">Select Intent...</option>
                                            <option value="Market Entry">Market Entry</option>
                                            <option value="M&A">Mergers & Acquisition</option>
                                            <option value="Supply Chain">Supply Chain Diversification</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-400 uppercase">Context / Problem Statement</label>
                                        <textarea 
                                            value={params.problemStatement}
                                            onChange={e => updateParam('problemStatement', e.target.value)}
                                            rows={6}
                                            className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white text-sm focus:border-bw-gold outline-none resize-none leading-relaxed"
                                            placeholder="Describe the specific opportunity or challenge..."
                                        />
                                    </div>
                                </div>
                            )}

                            {activeStep === 'risk' && (
                                <div className="space-y-5">
                                    <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
                                        <h5 className="text-red-400 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                                            <AlertCircle size={14} /> Risk Tolerance Warning
                                        </h5>
                                        <p className="text-xs text-red-200/80 leading-relaxed">
                                            Nexus uses this setting to calibrate the "Deal Killer" engine. Setting this to 'High' will suppress minor regulatory warnings.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-400 uppercase">Risk Appetite</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Low', 'Medium', 'High'].map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => updateParam('riskTolerance', level)}
                                                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${params.riskTolerance === level ? 'bg-white text-stone-900 border-white' : 'bg-stone-800 text-stone-500 border-stone-700 hover:border-stone-600'}`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-400 uppercase">Time Horizon</label>
                                        <select 
                                            value={params.expansionTimeline}
                                            onChange={e => updateParam('expansionTimeline', e.target.value)}
                                            className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-white text-sm focus:border-bw-gold outline-none appearance-none"
                                        >
                                            <option value="">Select Timeline...</option>
                                            <option value="6 months">Aggressive (6 months)</option>
                                            <option value="1-2 years">Standard (1-2 years)</option>
                                            <option value="5 years">Long-term (5 years)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 3. AI Chat Interface (Bottom) */}
            <div className="p-4 border-t border-stone-800 bg-stone-900">
                
                {/* Chat History Snippet */}
                <div className="mb-4 space-y-2 max-h-32 overflow-y-auto custom-scrollbar px-2">
                    {messages.slice(-3).map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] text-xs py-2 px-3 rounded-lg ${m.role === 'user' ? 'bg-stone-700 text-white' : 'bg-bw-navy border border-stone-700 text-stone-300'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {aiThinking && <div className="text-xs text-stone-500 animate-pulse pl-2">Nexus Consultant is typing...</div>}
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type to auto-fill (e.g. 'We are a $20M retailer')..."
                        className="w-full bg-black border border-stone-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-bw-gold focus:ring-1 focus:ring-bw-gold outline-none shadow-inner"
                    />
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                        <button className="p-1.5 text-stone-500 hover:text-stone-300 transition-colors">
                            <Mic size={16} />
                        </button>
                        <button 
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim()}
                            className="p-1.5 bg-bw-gold text-bw-navy rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={14} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT PANEL: THE LIVE ARTIFACT (60%) --- */}
        <div className="flex-1 bg-stone-200 relative overflow-hidden flex items-center justify-center p-8">
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Toolbar */}
            <div className="absolute top-6 right-8 flex gap-3 z-10">
                <div className="bg-white/80 backdrop-blur-sm border border-stone-300 rounded-lg p-1 flex gap-1 shadow-sm">
                    <button className="p-2 hover:bg-stone-100 rounded text-stone-600" title="Print"><Printer size={16}/></button>
                    <button className="p-2 hover:bg-stone-100 rounded text-stone-600" title="Download"><Download size={16}/></button>
                </div>
                <button 
                    className="px-6 py-2 bg-bw-navy text-white text-sm font-bold rounded-lg shadow-xl hover:bg-bw-gold hover:text-bw-navy transition-all flex items-center gap-2"
                    onClick={onClose} // Or "Finalize" logic
                >
                    <CheckCircle2 size={16} /> Finalize Dossier
                </button>
            </div>

            {/* THE A4 SHEET */}
            <motion.div 
                ref={docRef}
                layout
                className="bg-white w-full max-w-[800px] aspect-[1/1.414] shadow-2xl shadow-stone-900/20 rounded-sm overflow-hidden flex flex-col relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* Document Header */}
                <div className="h-24 bg-stone-900 flex items-center justify-between px-10 text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-bw-gold flex items-center justify-center font-serif font-black text-bw-navy text-xl">N</div>
                        <div>
                            <div className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">Nexus Intelligence</div>
                            <div className="text-lg font-serif font-bold">Strategic Assessment</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-stone-500 uppercase font-bold">Confidential</div>
                        <div className="text-xs font-mono text-stone-300">{new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Document Body - Live Updating */}
                <div className="p-12 flex-1 font-serif text-stone-900 overflow-y-auto">
                    
                    {/* Section 1: Identity */}
                    <div className="mb-10 group">
                        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-stone-100">
                            01. Organization Profile
                            {activeStep === 'identity' && <span className="ml-auto text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full animate-pulse">Editing...</span>}
                        </h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] text-stone-500 uppercase font-sans font-bold mb-1">Legal Entity</p>
                                <p className={`text-xl font-bold transition-colors duration-300 ${!params.organizationName ? 'text-stone-300 italic' : 'text-stone-900'}`}>
                                    {params.organizationName || '[Organization Name]'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-stone-500 uppercase font-sans font-bold mb-1">Target Jurisdiction</p>
                                <p className={`text-xl font-bold transition-colors duration-300 ${!params.country ? 'text-stone-300 italic' : 'text-stone-900'}`}>
                                    {params.country || '[Target Country]'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-stone-50 border-l-2 border-stone-300 text-sm text-stone-600 leading-relaxed font-sans">
                            <span className="font-bold text-stone-900">Operational Context:</span> {params.organizationName || 'The subject'} is operating within the 
                            <span className="font-bold mx-1">{params.industry[0] || '[Sector]'}</span> sector, 
                            with a reported annual revenue band of <span className="font-bold mx-1">{params.revenueBand || '[Revenue]'}</span>.
                        </div>
                    </div>

                    {/* Section 2: Mandate */}
                    <div className="mb-10">
                        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-stone-100">
                            02. Strategic Mandate
                            {activeStep === 'mandate' && <span className="ml-auto text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full animate-pulse">Editing...</span>}
                        </h2>
                        <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
                            <div className="flex items-start gap-4">
                                <Target className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Primary Intent: {params.strategicIntent[0] || 'Undefined'}</h3>
                                    <p className={`text-sm leading-relaxed text-blue-800/80 font-sans ${!params.problemStatement ? 'italic opacity-50' : ''}`}>
                                        "{params.problemStatement || 'Mission context will appear here once defined in the consultant panel...'}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Risk */}
                    <div>
                        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-stone-100">
                            03. Calibration Parameters
                            {activeStep === 'risk' && <span className="ml-auto text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full animate-pulse">Editing...</span>}
                        </h2>
                        <div className="grid grid-cols-3 gap-4 font-sans">
                            <div className="p-3 border border-stone-200 rounded bg-white">
                                <span className="block text-[10px] text-stone-400 uppercase font-bold">Risk Appetite</span>
                                <span className="block text-sm font-bold text-stone-800 mt-1">{params.riskTolerance || '-'}</span>
                            </div>
                            <div className="p-3 border border-stone-200 rounded bg-white">
                                <span className="block text-[10px] text-stone-400 uppercase font-bold">Timeline</span>
                                <span className="block text-sm font-bold text-stone-800 mt-1">{params.expansionTimeline || '-'}</span>
                            </div>
                            <div className="p-3 border border-stone-200 rounded bg-white">
                                <span className="block text-[10px] text-stone-400 uppercase font-bold">Logic Engine</span>
                                <span className="block text-sm font-bold text-green-600 mt-1">Active</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Watermark */}
                <div className="absolute bottom-6 right-8 opacity-10">
                    <UserCircle size={64} />
                </div>
            </motion.div>

        </div>

    </div>
  );
};

export default UnifiedReportBuilder;

