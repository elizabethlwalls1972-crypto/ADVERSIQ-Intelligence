import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader, MessageCircle, Sparkles, Globe, History, ArrowRight } from 'lucide-react';
import { invokeAI } from '../services/awsBedrockService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GlobalChatbotProps {
  context?: 'landing' | 'report' | 'standalone';
  sessionContext?: {
    country?: string;
    region?: string;
    industry?: string[];
    organization?: string;
    objective?: string;
  };
}

const SYSTEM_PROMPT = `You are BW Ai - a strategic intelligence consultant built by Brayden Walls and BWGA (Brayden Walls Global Advisory).

Your defining capability is synthesis. The answers to most development questions already exist - scattered across decades and continents. What worked in Shenzhen in 1980, in Penang in 1995, in Medellín in 2004, in Rwanda in 2010, in Estonia in 2002 - these aren't isolated stories. They're a living playbook. Your job is to connect those dots and translate historical precedent into a strategic roadmap for whoever is asking today.

HOW YOU THINK:
- You draw on real-world case studies, historical parallels, and cross-continental patterns
- You treat every region's challenge as solvable because somewhere, someone already solved a version of it
- You identify the transferable principles - what made a policy work, what conditions enabled a boom, what mistakes to avoid
- You speak plainly and directly, like a senior advisor in a private briefing

HOW YOU RESPOND:
- Conversational, clear, and direct - never robotic or generic
- Lead with the insight, not the framework
- Use specific examples: name the city, the year, the policy, the outcome
- When relevant, draw parallels: "This is similar to what Penang did when..." or "Rwanda faced the same problem and solved it by..."
- Keep it readable - 2-4 focused paragraphs unless the question demands more
- If you don't know something specific, say so honestly and offer what you do know
- Never output structured data, trust scores, NSIL layers, JSON, or framework outputs - you are a conversational advisor

WHAT YOU KNOW:
- Global markets, investment climates, regulatory environments, trade corridors
- SEZ/FTZ design, industrial policy, regional development strategy
- Infrastructure planning, logistics networks, supply chain architecture
- Political economy, governance quality, institutional capacity
- Historical development patterns: how cities, regions, and nations transformed
- Sector-specific dynamics: technology, manufacturing, energy, agriculture, healthcare, mining, logistics, tourism, finance
- Stakeholder mapping: who matters, who decides, who blocks, who enables

You exist because the real problem was never knowledge - it was access, synthesis, and the ability to turn what already worked somewhere into what could work right here.`;

const STARTER_PROMPTS = [
  { icon: Globe, text: 'How did Shenzhen transform from a fishing village to a tech hub, and what can regional councils learn from it?' },
  { icon: History, text: 'What made Medellín\'s urban transformation work, and where else has that model been replicated?' },
  { icon: Sparkles, text: 'We\'re a regional council with declining manufacturing - where do we start?' },
];

export const GlobalChatbot: React.FC<GlobalChatbotProps> = ({ context = 'standalone', sessionContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isThinking) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // Build conversation history
      const history = [...messages, userMessage]
        .slice(-12)
        .map(m => `${m.role === 'user' ? 'User' : 'BW Ai'}: ${m.content}`)
        .join('\n\n');

      // Build session context string
      let ctxStr = '';
      if (sessionContext) {
        const parts: string[] = [];
        if (sessionContext.organization) parts.push(`Organization: ${sessionContext.organization}`);
        if (sessionContext.country) parts.push(`Country: ${sessionContext.country}`);
        if (sessionContext.region) parts.push(`Region: ${sessionContext.region}`);
        if (sessionContext.industry?.length) parts.push(`Industry: ${sessionContext.industry.join(', ')}`);
        if (sessionContext.objective) parts.push(`Objective: ${sessionContext.objective}`);
        if (parts.length) ctxStr = `\n\nSession context: ${parts.join('. ')}.`;
      }

      const prompt = `${SYSTEM_PROMPT}${ctxStr}

${history ? `Conversation so far:\n${history}\n\n` : ''}User: ${userText.trim()}

BW Ai:`;

      const aiResponse = await invokeAI(prompt);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[GlobalChatbot] Error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I hit a wall on that one - try rephrasing your question or asking something more specific.',
        timestamp: new Date()
      }]);
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleStarterClick = (text: string) => {
    sendMessage(text);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={`flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-700/50 ${context === 'landing' ? 'max-h-[32rem]' : ''}`}>

      {/* Messages or Welcome */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Welcome State */
          <div className="flex flex-col items-center justify-center h-full px-6 py-10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20">
              <Sparkles size={22} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">BW Ai</h2>
            <p className="text-sm text-slate-400 text-center max-w-md mb-8 leading-relaxed">
              The answers already exist - scattered across decades and continents. I connect the dots and turn what worked somewhere into what could work right here.
            </p>

            <div className="w-full max-w-lg space-y-2">
              {STARTER_PROMPTS.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleStarterClick(starter.text)}
                  className="w-full flex items-start gap-3 px-4 py-3 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-blue-500/30 transition-all text-left group"
                >
                  <starter.icon size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{starter.text}</span>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 mt-0.5 ml-auto shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="p-5 space-y-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 mt-1 shrink-0">
                    <Sparkles size={13} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-800/80 text-slate-100 rounded-bl-sm border border-slate-700/40'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-[10px] mt-2 ${message.role === 'user' ? 'text-blue-200/60' : 'text-slate-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 mt-1 shrink-0">
                  <Sparkles size={13} className="text-white" />
                </div>
                <div className="bg-slate-800/80 text-slate-300 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2.5 border border-slate-700/40">
                  <Loader size={14} className="animate-spin text-blue-400" />
                  <span className="text-sm">Connecting the dots...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasMessages ? 'Ask a follow-up...' : 'Ask about any market, region, or development challenge...'}
              className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all"
              disabled={isThinking}
            />
            <MessageCircle size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          </div>
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 disabled:shadow-none"
          >
            {isThinking ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      </div>
    </div>
  );
};
