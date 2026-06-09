/**
 * AdversIQ Intelligence API Client
 * Connects React frontend to Cloudflare Worker backend
 */

const API_BASE = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' 
    ? 'http://localhost:8787'
    : `https://adversiq-api.${import.meta.env.VITE_WORKER_SUBDOMAIN || 'YOUR_SUBDOMAIN'}.workers.dev`)
  : '';

export const api = {
  /**
   * Check if API is live
   */
  health: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      return await response.json();
    } catch (error) {
      return { status: 'error', message: String(error) };
    }
  },

  /**
   * Generate AI response using Llama model
   */
  aiGenerate: async (prompt: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      return await response.json();
    } catch (error) {
      return { error: String(error) };
    }
  },

  /**
   * Send chat message with persistent memory
   */
  chat: async (message: string, sessionId: string = 'default') => {
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
      });
      return await response.json();
    } catch (error) {
      return { error: String(error) };
    }
  },

  /**
   * Retrieve chat history for session
   */
  getHistory: async (sessionId: string = 'default') => {
    try {
      const response = await fetch(
        `${API_BASE}/api/chat/history?session=${encodeURIComponent(sessionId)}`
      );
      return await response.json();
    } catch (error) {
      return { error: String(error), history: [] };
    }
  },

  /**
   * Store data in KV namespace
   */
  storeData: async (key: string, value: unknown) => {
    try {
      const response = await fetch(`${API_BASE}/api/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      return await response.json();
    } catch (error) {
      return { error: String(error) };
    }
  },

  /**
   * Retrieve all stored data
   */
  getData: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/data`);
      return await response.json();
    } catch (error) {
      return { error: String(error), items: [] };
    }
  },

  /**
   * Delete data by key
   */
  deleteData: async (key: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/data?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return { error: String(error) };
    }
  },

  /**
   * Get analytics
   */
  getAnalytics: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/analytics`);
      return await response.json();
    } catch (error) {
      return { error: String(error) };
    }
  },

  /**
   * Connect to WebSocket for real-time communication
   */
  wsConnect: (): WebSocket => {
    const wsBase = API_BASE.replace('https://', 'wss://').replace('http://', 'ws://');
    return new WebSocket(`${wsBase}/api/ws/connect`);
  },

  /**
   * Set the API base URL dynamically
   */
  setBase: (url: string) => {
    Object.defineProperty(api, '_base', {
      value: url,
      writable: true,
    });
  },
};

export type APIClient = typeof api;
