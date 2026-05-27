
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Cpu, Globe, Target, ShieldCheck, 
  Activity, Lock, Briefcase, 
  Layers, Sparkles, ArrowRight,
  BrainCircuit, LayoutGrid, Zap, CheckCircle2,
  ChevronRight, AlertCircle, Building2, Scale
} from 'lucide-react';
import { 
  INITIAL_PARAMETERS, 
  COUNTRIES, 
  SECTORS_LIST,
  MANDATE_TYPES,
  RISK_APPETITE_LEVELS,
  TIME_HORIZONS
} from '../constants';
import { ReportParameters } from '../types';

interface SystemInterfaceProps {
  onClose: () => void;
}

// --- MOCKED AI INSIGHTS GENERATOR ---
const getContextualInsight = (field: string, value: string) => {
    if (!value) return null;
    
    const insights: Record<string, any> = {
        organizationName: {
            type: 'identity',
            title: 'Entity Verification',
            text: `Scanning global registries for "${value}"... Please ensure legal entity suffix (Ltd, Inc, PLC) is included for accurate compliance mapping.`
        },
        country: {
            type: 'risk',
            title: 'Jurisdiction Analysis',
            text: `Analyzing regulatory friction in ${value}. \n* Political Stability: ${value === 'Vietnam' ? 'High' : 'Moderate'}\n* FDI Incentives: Active\n* Currency Risk: Hedging Recommended`
        },
        industry: {
            type: 'opportunity',
            title: 'Sector Alpha',
            text: `The ${value} sector is currently experiencing a 12% YoY growth in emerging markets. Key competitor activity detected in DACH region.`
        },
        strategicIntent: {
            type: 'strategy',
            title: 'Mission Alignment',
            text: `Executing a "${value}" strategy requires high capital efficiency. Have you considered a Joint Venture to lower initial CAPEX?`
        },
        revenueBand: {
            type: 'financial',
            title: 'Capital Deployment',
            text: `For an entity in the ${value} range, typical R&D allocation is 15-20%. Ensure budget cap reflects this.`
        }
    };
    return insights[field];
};

type Tab = 'identity' | 'strategy' | 'calibration';

export const SystemInterface: React.FC<SystemInterfaceProps> = ({ onClose }) => {
  const [params, setParams] = useState<ReportParameters>(INITIAL_PARAMETERS);
  const [activeTab, setActiveTab] = useState<Tab>('identity');
  const [activeField, setActiveField] = useState<string | null>(null);
  const [aiState, setAiState] = useState<'idle' | 'thinking' | 'insight'>('idle');
  const [aiMessage, setAiMessage] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  // Auto-scroll AI panel on new messages
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, aiMessage]);

  const updateParam = (key: keyof ReportParameters, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
    
    // Trigger AI Reaction
    if (value && value !== 'Select...') {
        setAiState('thinking');
        setTimeout(() => {
            const insight = getContextualInsight(key, Array.isArray(value) ? value[0] : value);
            if (insight) {
                setAiMessage(insight);
                setAiState('insight');
            } else {
                setAiState('idle');
            }
        }, 800);
    }
  };

  const handleFieldFocus = (field: string) => {
      setActiveField(field);
      // Reset AI state to idle or specific prompt when entering a field
      if (aiState !== 'insight') setAiState('idle');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg = chatInput;
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setChatInput('');
      setAiState('thinking');

      // Simulated AI Response
      setTimeout(() => {
          setChatHistory(prev => [...prev, { 
              role: 'ai', 
              text: `Acknowledged. I have updated the risk parameters based on your input: "${userMsg}". I recommend reviewing the Compliance section next.` 
          }]);
          setAiState('idle');
      }, 1200);
  };

  const renderInputField = (label: string, key: keyof ReportParameters, type: 'text' | 'select' | 'textarea', options: string[] = [], placeholder: string = '') => {
      const isFocused = activeField === key;
      
      return (
          <div 
            className={`group transition-all duration-300 rounded-lg border p-4 mb-4 relative overflow-hidden ${isFocused ? 'bg-white border-bw-navy shadow-md' : 'bg-white border-stone-200 hover:border-stone-300'}`}
            onClick={() => handleFieldFocus(key)}
          >
              {isFocused && <div className="absolute left-0 top-0 bottom-0 w-1 bg-bw-navy"></div>}
              
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 transition-colors ${isFocused ? 'text-bw-navy' : 'text-stone-400 group-hover:text-stone-600'}`}>
                  {label}
              </label>
              
              {type === 'select' ? (
                  <select
                      value={params[key] as string}
                      onChange={(e) => updateParam(key, e.target.value)}
                      onFocus={() => handleFieldFocus(key)}
                      className="w-full bg-transparent border-b border-stone-200 py-2 text-sm font-medium text-stone-800 focus:border-bw-gold outline-none transition-all cursor-pointer"
                  >
                      <option>Select...</option>
                      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
              ) : type === 'textarea' ? (
                  <textarea
                      value={params[key] as string}
                      onChange={(e) => updateParam(key, e.target.value)}
                      onFocus={() => handleFieldFocus(key)}
                      placeholder={placeholder}
                      rows={3}
                      className="w-full bg-stone-50/50 border border-stone-200 rounded-md p-3 text-sm font-medium text-stone-800 focus:ring-1 focus:ring-bw-gold focus:border-bw-gold outline-none transition-all resize-none placeholder:text-stone-300"
                  />
              ) : (
                  <input
                      type="text"
                      value={params[key] as string}
                      onChange={(e) => updateParam(key, e.target.value)}
                      onFocus={() => handleFieldFocus(key)}
                      placeholder={placeholder}
                      className="w-full bg-transparent border-b border-stone-200 py-2 text-sm font-medium text-stone-800 focus:border-bw-gold outline-none transition-all placeholder:text-stone-300"
                  />
              )}
          </div>
      );
  };

  const navItems = [
      { id: 'identity', label: 'Identity', icon: Building2, desc: 'Org DNA' },
      { id: 'strategy', label: 'Strategy', icon: Target, desc: 'Mission Mandate' },
      { id: 'calibration', label: 'Calibration', icon: Scale, desc: 'Risk & Ops' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-stone-100 flex flex-col font-sans overflow-hidden animate-in fade-in duration-300">
        
        {/* HEADER */}
        <div className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-bw-navy rounded-lg flex items-center justify-center shadow-lg">
                    <Cpu className="w-6 h-6 text-bw-gold" />
                </div>
                <div>
                    <h2 className="text-lg font-serif font-bold text-bw-navy leading-none">Nexus Configuration</h2>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">Control Matrix v4.2</p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Process Steps Indicator */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${activeTab === item.id ? 'bg-bw-gold' : 'bg-stone-300'}`}></div>
                            {idx < navItems.length - 1 && <div className="w-8 h-px bg-stone-200 mx-1"></div>}
                        </div>
                    ))}
                </div>

                <div className="h-8 w-px bg-stone-200 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wider transition-colors">
                        Cancel
                    </button>
                    <button onClick={onClose} className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* 1. NAVIGATION RAIL (LEFT) */}
            <div className="w-20 bg-stone-900 flex flex-col items-center py-8 gap-8 shrink-0 z-10 shadow-xl">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as Tab)}
                        className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${activeTab === item.id ? 'bg-white/10 text-bw-gold shadow-lg ring-1 ring-white/20' : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'}`}
                    >
                        <item.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-bw-gold' : 'text-stone-500 group-hover:text-stone-300'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                        {activeTab === item.id && (
                            <motion.div 
                                layoutId="activeTabIndicator"
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-bw-gold rounded-l-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* 2. CONFIGURATION MATRIX (CENTER) */}
            <div className="flex-1 bg-stone-50 overflow-y-auto custom-scrollbar p-8 md:p-12 relative">
                <div className="max-w-3xl mx-auto">
                    
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Header for current tab */}
                            <div className="mb-10">
                                <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
                                    {navItems.find(n => n.id === activeTab)?.desc}
                                </h1>
                                <p className="text-stone-500 text-sm max-w-xl leading-relaxed">
                                    {activeTab === 'identity' && "Define the legal entity and operational scale. This establishes the baseline for all financial modeling."}
                                    {activeTab === 'strategy' && "Articulate the mission objectives. The system uses this to filter 100+ years of historical precedent."}
                                    {activeTab === 'calibration' && "Set the risk boundaries and success metrics. These constraints guide the autonomous agent swarm."}
                                </p>
                            </div>

                            {/* Form Content */}
                            {activeTab === 'identity' && (
                                <div className="space-y-6">
                                    {renderInputField("Organization Name", "organizationName", "text", [], "e.g. Acme Industries Global")}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInputField("Primary Sector", "industry", "select", SECTORS_LIST)}
                                        {renderInputField("Annual Revenue", "revenueBand", "select", ["Under $1M", "$1M - $10M", "$10M - $50M", "$50M - $250M", "Over $250M"])}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button onClick={() => setActiveTab('strategy')} className="px-6 py-3 bg-stone-900 text-white font-bold rounded-lg hover:bg-black transition-all flex items-center gap-2">
                                            Continue to Strategy <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'strategy' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInputField("Target Jurisdiction", "country", "select", COUNTRIES)}
                                        {renderInputField("Primary Intent", "strategicIntent", "select", MANDATE_TYPES.map(m => m.label))}
                                    </div>
                                    {renderInputField("Mission Context / Problem Statement", "problemStatement", "textarea", [], "Describe specific challenges, goals, or constraints the AI should solve for...")}
                                    <div className="flex justify-between pt-4">
                                        <button onClick={() => setActiveTab('identity')} className="text-stone-500 font-bold text-sm hover:text-stone-800">Back</button>
                                        <button onClick={() => setActiveTab('calibration')} className="px-6 py-3 bg-stone-900 text-white font-bold rounded-lg hover:bg-black transition-all flex items-center gap-2">
                                            Continue to Calibration <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'calibration' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInputField("Risk Tolerance", "riskTolerance", "select", RISK_APPETITE_LEVELS.map(r => r.label))}
                                        {renderInputField("Time Horizon", "analysisTimeframe", "select", TIME_HORIZONS.map(t => t.label))}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {renderInputField("Operating Model", "operationalPriority", "select", ["Centralized", "Decentralized", "Hybrid", "Franchise"])}
                                        {renderInputField("Success Metric", "successMetrics", "select", ["ROI", "Market Share", "Brand Equity", "Operational Efficiency"])}
                                    </div>
                                    
                                    <div className="pt-8 border-t border-stone-200 mt-8 flex justify-between items-center">
                                        <button onClick={() => setActiveTab('strategy')} className="text-stone-500 font-bold text-sm hover:text-stone-800">Back</button>
                                        <button className="px-8 py-4 bg-bw-navy text-white text-lg font-bold rounded-xl shadow-xl hover:bg-bw-gold hover:text-bw-navy transition-all transform hover:-translate-y-1 flex items-center gap-3">
                                            <Cpu className="w-5 h-5" /> Initialize Analysis Engine
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>

            {/* 3. NEURAL TWIN (RIGHT) */}
            <div className="hidden lg:flex w-[400px] bg-white border-l border-stone-200 flex-col shadow-2xl relative overflow-hidden shrink-0 z-20">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* AI Header */}
                <div className="p-6 border-b border-stone-100 bg-stone-50/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="relative">
                            <BrainCircuit className="w-6 h-6 text-bw-navy" />
                            {aiState === 'thinking' && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bw-gold opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-bw-gold"></span>
                                </span>
                            )}
                        </div>
                        <h3 className="text-stone-900 font-bold text-sm tracking-wide">Live Consultant</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${aiState === 'thinking' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <p className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                            {aiState === 'thinking' ? 'PROCESSING CONTEXT...' : 'MONITORING INPUT STREAM'}
                        </p>
                    </div>
                </div>

                {/* AI Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar bg-stone-50/30">
                    
                    {/* Welcome Message if empty */}
                    {chatHistory.length === 0 && !aiMessage && (
                        <div className="text-center py-10 opacity-50">
                            <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                            <p className="text-xs text-stone-500">
                                As you configure the matrix, I will analyze your inputs in real-time to detect risks and opportunities.
                            </p>
                        </div>
                    )}

                    {/* 1. Contextual Insight Card (Dynamic) */}
                    <AnimatePresence mode='wait'>
                        {aiState === 'insight' && aiMessage && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-white border-l-4 border-bw-gold rounded-r-lg p-5 shadow-sm"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-bw-gold" />
                                    <span className="text-xs font-bold text-stone-900 uppercase tracking-widest">{aiMessage.title}</span>
                                </div>
                                <p className="text-sm text-stone-600 leading-relaxed font-medium">
                                    {aiMessage.text}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 2. Chat History */}
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-stone-800 text-white rounded-tr-none' : 'bg-white border border-stone-200 text-stone-600 rounded-tl-none shadow-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    
                    {/* 3. Thinking Indicator */}
                    {aiState === 'thinking' && (
                        <div className="flex items-center gap-2 text-stone-400 text-xs font-mono animate-pulse pl-2">
                            <Activity className="w-3 h-3" /> Analyzing strategic vectors...
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Collaborative Notepad Input */}
                <div className="p-4 bg-white border-t border-stone-200 z-10">
                    <form onSubmit={handleChatSubmit} className="relative">
                        <input 
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask Copilot a question..."
                            className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-lg p-3 pl-4 pr-10 focus:bg-white focus:border-bw-navy focus:ring-1 focus:ring-bw-navy outline-none transition-all placeholder:text-stone-400"
                        />
                        <button 
                            type="submit"
                            disabled={!chatInput.trim()}
                            className="absolute right-2 top-2 p-1.5 bg-bw-navy text-white rounded-md hover:bg-bw-gold hover:text-bw-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </form>
                    
                    {/* Quick Prompts */}
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <button onClick={() => setChatInput("Check regulatory risks")} className="whitespace-nowrap px-3 py-1 bg-stone-50 border border-stone-200 rounded-full text-[10px] font-bold text-stone-500 hover:text-bw-navy hover:border-bw-navy transition-colors">
                            🛡 Risks?
                        </button>
                        <button onClick={() => setChatInput("Suggest partner profiles")} className="whitespace-nowrap px-3 py-1 bg-stone-50 border border-stone-200 rounded-full text-[10px] font-bold text-stone-500 hover:text-bw-navy hover:border-bw-navy transition-colors">
                            🤝 Partners?
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

