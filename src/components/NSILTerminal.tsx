// src/components/NSILTerminal.tsx
// NSIL Multi-Agent Intelligence Terminal
// Real-time chat with 9-agent reasoning, debate, and consensus

import React, { useState, useRef, useEffect, useCallback } from 'react';
import NSILBrain from '../services/NSILBrain';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent' | 'error';
  content: string;
  timestamp: Date;
  agent?: string;
  agentRole?: string;
  thoughts?: string[];
}

const NSILTerminal: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'system',
      content: 'NSIL Intelligence OS initialized. Type a message to begin. SUSAN will think, debate with 9 agents, and solve autonomously.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [proactiveThoughts, setProactiveThoughts] = useState<string[]>([]);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [commandMode, setCommandMode] = useState<string>('standard');
  const susanRef = useRef<NSILBrain | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize SUSAN brain on mount
  useEffect(() => {
    if (!susanRef.current) {
      susanRef.current = new NSILBrain();
      susanRef.current.onThought((thought) => {
        setProactiveThoughts((prev) => [...prev.slice(-4), thought]);
      });
    }
    return () => {
      if (susanRef.current) {
        susanRef.current.destroy();
      }
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = useCallback((role: Message['role'], content: string, agent?: string, thoughts?: string[]) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date(),
      agent,
      thoughts,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    addMessage('user', userMessage);
    setIsThinking(true);
    setProactiveThoughts([]);

    try {
      // Step 1: SUSAN thinks about the query
      addMessage('system', '💭 SUSAN is thinking... analyzing query...');
      const thoughtPrompt = `Given this user query: "${userMessage}", what is the essence of what they're asking for? Think deeply before responding.`;
      
      // Step 2: Get SUSAN's analysis
      const susanResponse = await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          agent: 'SUSAN',
          context: messages.map((m) => `${m.role}: ${m.content}`).join('\n').slice(-2000),
          sessionId: susanRef.current?.sessionId,
        }),
      });

      const susan = await susanResponse.json();
      addMessage('agent', susan.response, 'SUSAN', ['Strategic thinking', 'Decision analysis']);

      // Step 3: Multi-agent debate
      if (userMessage.toLowerCase().includes('debate') || userMessage.toLowerCase().includes('consider')) {
        addMessage('system', '⚔️ Agents debating perspective...');

        const debateResponse = await fetch(`/api/debate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: userMessage,
            rounds: 2,
          }),
        });

        const debate = await debateResponse.json();
        addMessage(
          'agent',
          `**Debate Results:**\n\n${debate.debate
            .map(
              (round: any[], i: number) =>
                `**Round ${i + 1}:**\n${round.map((arg: any) => `- ${arg.agent}: ${arg.argument.slice(0, 200)}...`).join('\n')}`
            )
            .join('\n\n')}\n\n**Conclusion:** ${debate.conclusion.slice(0, 500)}`,
          'Debate Engine',
          ['Argumentation', 'Evidence synthesis']
        );
      }

      // Step 4: Consensus building
      if (userMessage.toLowerCase().includes('consensus') || userMessage.toLowerCase().includes('agree')) {
        addMessage('system', '🤝 Building consensus across agents...');

        const consensusResponse = await fetch(`/api/consensus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: userMessage,
            agents: ['ATLAS', 'SENTINEL', 'ORACLE', 'AEGIS'],
          }),
        });

        const consensus = await consensusResponse.json();
        addMessage(
          'agent',
          `**Expert Opinions:**\n${consensus.opinions.map((o: any) => `- **${o.agent}:** ${o.opinion.slice(0, 150)}...`).join('\n')}\n\n**Consensus:** ${consensus.consensus.slice(0, 500)}`,
          'Consensus Builder',
          ['Agreement synthesis', 'Minority opinions noted']
        );
      }

      // Step 5: Threat/Analysis scan
      if (userMessage.toLowerCase().includes('scan') || userMessage.toLowerCase().includes('threat') || userMessage.toLowerCase().includes('analyze')) {
        addMessage('system', '🔍 Running multi-agent scan...');

        const scanResponse = await fetch(`/api/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: userMessage,
            scan_type: 'comprehensive',
          }),
        });

        const scan = await scanResponse.json();
        addMessage(
          'agent',
          `**Agent Findings:**\n${scan.findings.map((f: any) => `- **${f.agent}:**\n  ${f.findings.slice(0, 200)}...`).join('\n\n')}\n\n**Correlation:** ${scan.correlation.slice(0, 400)}`,
          'Multi-Agent Scanner',
          ['Threat correlation', 'Cross-validation']
        );
      }

      // Step 6: Intelligence briefing
      if (userMessage.toLowerCase().includes('brief') || userMessage.toLowerCase().includes('intelligence') || userMessage.toLowerCase().includes('status')) {
        addMessage('system', '📊 Generating intelligence briefing...');

        const briefResponse = await fetch(`/api/intelligence`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const brief = await briefResponse.json();
        addMessage('agent', `**Intelligence Briefing:**\n${brief.briefing.slice(0, 600)}`, 'Intelligence Analyst', [
          'Threat assessment',
          'Strategic overview',
        ]);
      }

      // Final summary from SUSAN
      addMessage('system', '✅ SUSAN synthesizing all intelligence...');
      const summaryResponse = await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Summarize and synthesize all the intelligence gathered about: "${userMessage}". Provide final actionable recommendations.`,
          agent: 'SUSAN',
          context: messages.map((m) => `${m.role}: ${m.content}`).join('\n').slice(-2000),
        }),
      });

      const summary = await summaryResponse.json();
      addMessage(
        'agent',
        `**SUSAN Summary & Recommendations:**\n${summary.response}`,
        'SUSAN',
        ['Final synthesis', 'Decision verification', 'Recommendations']
      );
    } catch (err: any) {
      addMessage(
        'error',
        `Error: ${err.message || 'Unknown error during multi-agent processing'}`
      );
    } finally {
      setIsThinking(false);
    }
  };

  const handleCommand = (cmd: string) => {
    setCommandMode(cmd);
    setInputValue(`/${cmd} `);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#0a0a0f',
        color: '#e0e0e0',
        fontFamily: 'Courier New, monospace',
        fontSize: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#1a1a2e',
          borderBottom: '1px solid #2a3a4a',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>🧠 NSIL Intelligence OS Terminal v2.0</span>
        <span style={{ fontSize: '11px', color: '#888' }}>
          Session: {susanRef.current?.sessionId?.slice(0, 12)}...
        </span>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background:
                msg.role === 'user'
                  ? '#2a3a4e'
                  : msg.role === 'error'
                  ? '#4a2a2a'
                  : msg.role === 'system'
                  ? '#1a2a3a'
                  : '#1a3a3a',
              border:
                msg.role === 'user'
                  ? '1px solid #3a5a7e'
                  : msg.role === 'error'
                  ? '1px solid #6a3a3a'
                  : msg.role === 'system'
                  ? '1px solid #2a3a4a'
                  : '1px solid #2a5a5a',
              color:
                msg.role === 'user'
                  ? '#87ceeb'
                  : msg.role === 'error'
                  ? '#ff6b6b'
                  : msg.role === 'system'
                  ? '#888888'
                  : msg.agent === 'SUSAN'
                  ? '#00ff00'
                  : '#00cec9',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>
                {msg.role === 'user'
                  ? '👤 You'
                  : msg.role === 'system'
                  ? '⚙️ System'
                  : msg.role === 'error'
                  ? '⚠️ Error'
                  : msg.agent === 'SUSAN'
                  ? '🧠 SUSAN'
                  : `🤖 ${msg.agent || 'Agent'}`}
              </span>
              <span style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}>
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.4',
              }}
            >
              {msg.content}
            </div>
            {msg.thoughts && msg.thoughts.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
                💭 {msg.thoughts.join(' | ')}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Proactive Insights */}
      {proactiveThoughts.length > 0 && !isThinking && (
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid #2a3a4a',
            fontSize: '11px',
            color: '#888',
            background: '#0d0d12',
          }}
        >
          <span style={{ color: '#00ff00' }}>💭 Susan anticipates:</span> {proactiveThoughts[proactiveThoughts.length - 1]}
        </div>
      )}

      {/* Thinking Indicator */}
      {isThinking && (
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid #2a3a4a',
            fontSize: '11px',
            color: '#888',
            background: '#0d0d12',
            animation: 'pulse 1.5s infinite',
          }}
        >
          <span style={{ color: '#00ff00' }}>⚡ Intelligence processing...</span> SUSAN + 9 agents reasoning in parallel
        </div>
      )}

      {/* Command Palette */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid #2a3a4a',
          borderBottom: '1px solid #2a3a4a',
          backgroundColor: '#0d0d12',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          fontSize: '10px',
        }}
      >
        <button onClick={() => handleCommand('debate')} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          ⚔️ Debate
        </button>
        <button onClick={() => handleCommand('consensus')} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          🤝 Consensus
        </button>
        <button onClick={() => handleCommand('scan')} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          🔍 Scan
        </button>
        <button onClick={() => handleCommand('threat')} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          ⚠️ Threats
        </button>
        <button onClick={() => handleCommand('brief')} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          📊 Brief
        </button>
        <button onClick={() => handleCommand('analyze')} style={{ padding: '4px 8px', cursor: 'pointer' }}>
          🔬 Analyze
        </button>
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #2a3a4a',
          backgroundColor: '#0d0d12',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isThinking) {
              handleSendMessage();
            }
          }}
          placeholder="Ask SUSAN & 9 agents anything..."
          style={{
            flex: 1,
            backgroundColor: '#1a1a2e',
            color: '#00cec9',
            border: '1px solid #2a3a4a',
            padding: '8px 12px',
            fontFamily: 'Courier New, monospace',
            fontSize: '12px',
            outline: 'none',
          }}
          disabled={isThinking}
        />
        <button
          onClick={handleSendMessage}
          disabled={isThinking || !inputValue.trim()}
          style={{
            padding: '8px 20px',
            backgroundColor: isThinking ? '#1a1a2e' : '#00cec9',
            color: isThinking ? '#444' : '#0a0a0f',
            border: 'none',
            borderRadius: '4px',
            cursor: isThinking ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '11px',
            textTransform: 'uppercase',
          }}
        >
          {isThinking ? '⚙️ Processing...' : '▶ Send'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        button:hover:not(:disabled) {
          opacity: 0.8;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default NSILTerminal;
