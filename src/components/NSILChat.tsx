// src/components/NSILChat.tsx
// Real-time multi-agent intelligence chat interface

import React, { useState, useEffect, useRef, useCallback } from 'react';
import NSILBrain from '../services/NSILBrain';

interface Message {
  role: 'user' | 'nsil' | 'error' | 'system';
  content: string;
  agents?: string[];
  timestamp?: string;
}

const NSILChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: '🧠 NSIL Intelligence Operating System Online\n[SUSAN Self-Thinking Engine Active]\n[9 Intelligence Agents Ready]\n[Multi-Agent Deliberation Enabled]',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [proactiveThoughts, setProactiveThoughts] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const brainRef = useRef<NSILBrain | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const brain = new NSILBrain('/api');
    brainRef.current = brain;

    brain.onThought((thought) => {
      setProactiveThoughts(prev => [...prev.slice(-4), thought]);
    });

    return () => brain.destroy();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.length > 10) {
        brainRef.current?.onInput(value);
      }
    }, 500);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !brainRef.current) return;

    const userMessage = input;
    setInput('');
    setIsThinking(true);
    setProactiveThoughts([]);

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }]);

    try {
      const result = await brainRef.current.chat(userMessage);
      
      setMessages(prev => [...prev, {
        role: 'nsil',
        content: result.response,
        agents: result.agents_activated,
        timestamp: result.timestamp,
      }]);
      
      if (result.agents_activated) {
        setActiveAgents(result.agents_activated);
        setTimeout(() => setActiveAgents([]), 3000);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: `⚠️ Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      color: '#0f0',
      background: '#0a0a0a',
      fontFamily: 'monospace',
      fontSize: '13px',
    }}>
      {/* Agent Status Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px',
        borderBottom: '1px solid #1a3a1a',
        background: '#0f0f0f',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ATLAS', 'CIPHER', 'SENTINEL', 'ORACLE', 'NEXUS', 'AEGIS', 'PHANTOM', 'REDTEAM', 'SUSAN'].map(agent => (
            <span key={agent} style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: activeAgents.includes(agent) ? '#0f0' : '#1a1a1a',
              color: activeAgents.includes(agent) ? '#000' : '#666',
              transition: 'all 0.3s',
              fontSize: '10px',
              fontWeight: 'bold',
            }}>
              {agent}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '10px', color: '#0af' }}>
          {brainRef.current?.getStatus().contextSize || 0} context entries
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            padding: '10px 12px',
            borderRadius: '6px',
            background: msg.role === 'user'
              ? '#1a2a1a'
              : msg.role === 'error'
              ? '#2a1a1a'
              : msg.role === 'system'
              ? '#1a1a2a'
              : '#1a1a1a',
            border: `1px solid ${
              msg.role === 'user' ? '#0f033'
              : msg.role === 'error' ? '#f0033'
              : msg.role === 'system' ? '#00f3'
              : '#0af3'
            }`,
            lineHeight: '1.6',
          }}>
            <div style={{
              fontSize: '10px',
              color: msg.role === 'system' ? '#0af' : '#0f0',
              marginBottom: '4px',
              fontWeight: 'bold',
            }}>
              {msg.role === 'user' ? '👤 YOU' : msg.role === 'error' ? '⚠️ ERROR' : msg.role === 'system' ? '🔧 SYSTEM' : '🧠 NSIL'}
              {msg.agents && ` → [${msg.agents.join(', ')}]`}
              {msg.timestamp && ` @ ${new Date(msg.timestamp).toLocaleTimeString()}`}
            </div>
            <div style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: msg.role === 'error' ? '#f00' : '#0f0',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div style={{
            padding: '10px 12px',
            color: '#0af',
            fontStyle: 'italic',
            animation: 'pulse 1s infinite',
          }}>
            🧠 NSIL deliberating... agents analyzing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Proactive Thoughts */}
      {proactiveThoughts.length > 0 && (
        <div style={{
          padding: '8px 12px',
          borderTop: '1px solid #1a1a1a',
          background: '#0f0f1a',
          fontSize: '11px',
          color: '#0af',
          maxHeight: '60px',
          overflow: 'hidden',
        }}>
          💭 Anticipating: <em>{proactiveThoughts[proactiveThoughts.length - 1]?.substring(0, 120)}...</em>
        </div>
      )}

      {/* Input Section */}
      <div style={{
        display: 'flex',
        padding: '12px',
        borderTop: '1px solid #1a3a1a',
        background: '#0f0f0f',
        gap: '8px',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="[NSIL Listening] Type your intelligence request..."
          style={{
            flex: 1,
            background: '#111',
            color: '#0f0',
            border: '1px solid #0f0',
            borderRadius: '4px',
            padding: '10px 12px',
            resize: 'none',
            fontFamily: 'monospace',
            fontSize: '13px',
            minHeight: '40px',
            maxHeight: '100px',
            outline: 'none',
          }}
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={isThinking || !input.trim()}
          style={{
            padding: '10px 16px',
            background: isThinking ? '#333' : '#0f0',
            color: isThinking ? '#666' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: isThinking ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            fontSize: '12px',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap',
          }}
        >
          {isThinking ? '⏳ PROCESSING...' : '► SEND'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default NSILChat;
