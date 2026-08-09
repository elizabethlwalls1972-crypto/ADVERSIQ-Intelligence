import React, { useState } from 'react';
import { CopilotInsight } from '../types';
import { Lightbulb, AlertTriangle, Zap, CheckCircle2, Send, MessageSquare, ListTodo } from 'lucide-react';

interface Props {
  insights: CopilotInsight[];
  isCopilotLoading: boolean;
  onAskCopilot: (q: string) => void;
}

export default function RightSidebar({ insights, isCopilotLoading, onAskCopilot }: Props) {
  const [input, setInput] = useState('');

  const getIcon = (type: string) => {
      switch(type) {
          case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
          case 'opportunity': return <Zap className="w-4 h-4 text-green-500" />;
          case 'strategy': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
          default: return <Lightbulb className="w-4 h-4 text-purple-500" />;
      }
  };

  const handleSend = () => {
      if (!input.trim()) return;
      onAskCopilot(input);
      setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  return (
    <div className="w-80 bg-stone-50 border-l border-stone-200 flex flex-col h-full hidden xl:flex shadow-xl z-20">
      <div className="p-6 border-b border-stone-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 uppercase tracking-widest text-xs flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Nexus Copilot
            </h3>
            {isCopilotLoading && <span className="text-[10px] text-blue-600 font-bold animate-pulse">Thinking...</span>}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Gatekeeper Context Awareness */}
        <div className="bg-stone-900 text-stone-300 p-4 rounded-xl text-xs space-y-2 border border-stone-800">
            <div className="flex items-center gap-2 font-bold text-bw-gold uppercase tracking-wider mb-1">
                <ListTodo className="w-3 h-3" /> Gatekeeper Active
            </div>
            <p>I am monitoring the checklist state. Ensure "Organization Name" and "Target Region" are satisfied to proceed.</p>
        </div>

        {insights.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl mt-4">
                <Lightbulb className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-500 leading-relaxed">
                    Awaiting deep data inputs. Complete Step 2 (Strategic Mandate) to trigger autonomous analysis or ask a specific question below.
                </p>
            </div>
        ) : (
            insights.map((insight, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-all animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-2 border-b border-stone-50 pb-2">
                        {getIcon(insight.type)}
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">{insight.type}</span>
                        {insight.confidence && (
                            <span className="ml-auto text-[9px] font-mono text-stone-300">{insight.confidence}% CONF</span>
                        )}
                    </div>
                    <div className="font-bold text-stone-800 text-sm mb-1 leading-tight">{insight.title}</div>
                    <div className="text-xs text-stone-500 leading-relaxed">{insight.description}</div>
                </div>
            ))
        )}
      </div>

      <div className="p-4 border-t border-stone-200 bg-white">
          <div className="relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nexus Copilot..."
                className="w-full p-3 pr-10 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none resize-none min-h-[80px]"
                disabled={isCopilotLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isCopilotLoading}
                className="absolute right-2 bottom-2 p-1.5 bg-stone-900 text-white rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
              >
                  <Send className="w-3 h-3" />
              </button>
          </div>
          
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => onAskCopilot("Analyze supply chain risks")} className="flex-shrink-0 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-full text-[10px] font-bold text-stone-600 transition-colors whitespace-nowrap">
                  Risk Check
              </button>
              <button onClick={() => onAskCopilot("Suggest partner profiles")} className="flex-shrink-0 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-full text-[10px] font-bold text-stone-600 transition-colors whitespace-nowrap">
                  Find Partners
              </button>
              <button onClick={() => onAskCopilot("Regulatory compliance check")} className="flex-shrink-0 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-full text-[10px] font-bold text-stone-600 transition-colors whitespace-nowrap">
                  Compliance
              </button>
          </div>
      </div>
    </div>
  );
}
