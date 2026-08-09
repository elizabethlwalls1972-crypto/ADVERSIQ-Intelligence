/**
 * Example: Using AdversIQ API in your React component
 * 
 * This demonstrates:
 * - Health check
 * - AI generation
 * - Chat with memory
 * - WebSocket real-time communication
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';

export function AdversIQAPIDemo() {
  const [health, setHealth] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Check API health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    const result = await api.health();
    setHealth(result);
    console.log('API Health:', result);
  };

  // AI Generation
  const generateAI = async (prompt: string) => {
    setLoading(true);
    try {
      const result = await api.aiGenerate(prompt);
      setAiResponse(result.response || result.error);
    } catch (error) {
      setAiResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Chat with memory
  const sendChat = async (message: string) => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const result = await api.chat(message, 'demo-session');
      setChatHistory(prev => [...prev, 
        { role: 'user', content: message },
        { role: 'assistant', content: result.message }
      ]);
      setChatMessage('');
    } catch (error) {
      setChatHistory(prev => [...prev, 
        { role: 'error', content: String(error) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection
  const connectWebSocket = () => {
    try {
      const ws = api.wsConnect();
      
      ws.onopen = () => {
        setWsConnected(true);
        console.log('WebSocket connected');
        // Test connection
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WS Message:', data);
        
        if (data.type === 'pong') {
          setChatHistory(prev => [...prev, 
            { role: 'system', content: '✅ WebSocket connection confirmed' }
          ]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setChatHistory(prev => [...prev, 
          { role: 'error', content: 'WebSocket error' }
        ]);
      };

      ws.onclose = () => {
        setWsConnected(false);
        console.log('WebSocket disconnected');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WS Connection error:', error);
      setChatHistory(prev => [...prev, 
        { role: 'error', content: String(error) }
      ]);
    }
  };

  // Send message via WebSocket
  const sendWebSocketMessage = (prompt: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'ai',
      prompt,
      id: Date.now().toString(),
    }));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🤖 AdversIQ API Demo</h1>

      {/* Health Status */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Health Status</h2>
        {health ? (
          <div style={{ 
            padding: '10px', 
            backgroundColor: health.status === 'live' ? '#90EE90' : '#FFB6C6',
            borderRadius: '4px'
          }}>
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Service:</strong> {health.service}</p>
            <p><strong>Time:</strong> {health.time}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <button onClick={checkHealth}>Refresh Health</button>
      </section>

      {/* AI Generation */}
      <section style={{ marginBottom: '20px' }}>
        <h2>AI Generation</h2>
        <button 
          onClick={() => generateAI('Explain quantum computing in one sentence')}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate AI Response'}
        </button>
        {aiResponse && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: '#F0F0F0',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}>
            {aiResponse}
          </div>
        )}
      </section>

      {/* Chat */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Chat with Memory</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChat(chatMessage)}
            placeholder="Type your message..."
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          <button 
            onClick={() => sendChat(chatMessage)}
            disabled={loading || !chatMessage.trim()}
            style={{ marginTop: '8px', width: '100%' }}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div style={{ 
          height: '300px', 
          overflowY: 'auto', 
          padding: '10px', 
          backgroundColor: '#F9F9F9',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
              <strong style={{ color: msg.role === 'user' ? '#0066CC' : msg.role === 'error' ? '#CC0000' : '#009900' }}>
                {msg.role === 'user' ? '👤 You' : msg.role === 'error' ? '❌ Error' : msg.role === 'system' ? 'ℹ️ System' : '🤖 AI'}:
              </strong>
              <p style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WebSocket */}
      <section>
        <h2>WebSocket Real-Time</h2>
        <button 
          onClick={connectWebSocket}
          disabled={wsConnected}
          style={{ backgroundColor: wsConnected ? '#90EE90' : '#4CAF50', color: 'white', padding: '10px 20px' }}
        >
          {wsConnected ? '✅ Connected' : 'Connect WebSocket'}
        </button>
        {wsConnected && (
          <button 
            onClick={() => sendWebSocketMessage('Hello from WebSocket')}
            style={{ marginLeft: '10px', backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px' }}
          >
            Send Test Message
          </button>
        )}
      </section>
    </div>
  );
}

export default AdversIQAPIDemo;
