/**
 * AdversIQ Intelligence API Worker
 * Provides REST and WebSocket endpoints for AI, chat, and data management
 * 
 * Deploy with: npx wrangler publish workers/adversiq-api.js
 */

export default {
  async fetch(request, env, ctx) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...cors },
      });

    try {
      // ============ HEALTH CHECK ============
      if (path === '/api/health') {
        return json({
          status: 'live',
          service: 'adversiq-api',
          time: new Date().toISOString(),
          version: '1.0.0',
        });
      }

      // ============ AI GENERATION ============
      if (path === '/api/ai/generate' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        if (!body.prompt) return json({ error: 'Prompt required' }, 400);

        try {
          const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              {
                role: 'system',
                content:
                  'You are AdversIQ, an advanced intelligence and decision verification assistant. Provide clear, structured insights.',
              },
              { role: 'user', content: body.prompt },
            ],
          });

          return json({
            response: response.response,
            model: '@cf/meta/llama-3.1-8b-instruct',
            prompt: body.prompt,
          });
        } catch (aiError) {
          return json({ error: 'AI service error: ' + aiError.message }, 500);
        }
      }

      // ============ CHAT WITH MEMORY ============
      if (path === '/api/chat' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const { message, sessionId = 'default' } = body;
        if (!message) return json({ error: 'Message required' }, 400);

        try {
          const key = 'chat:' + sessionId;
          const historyData = await env.ADVERSIQ_DATA.get(key);
          const history = historyData ? JSON.parse(historyData) : [];

          history.push({
            role: 'user',
            content: message,
            time: new Date().toISOString(),
          });

          const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              {
                role: 'system',
                content: 'You are AdversIQ. Be concise and direct.',
              },
              ...history.slice(-10),
            ],
          });

          const reply = response.response || JSON.stringify(response);
          history.push({
            role: 'assistant',
            content: reply,
            time: new Date().toISOString(),
          });

          await env.ADVERSIQ_DATA.put(key, JSON.stringify(history.slice(-50)));

          return json({
            message: reply,
            sessionId,
            historyLength: history.length,
          });
        } catch (chatError) {
          return json({ error: 'Chat error: ' + chatError.message }, 500);
        }
      }

      // ============ GET CHAT HISTORY ============
      if (path === '/api/chat/history' && request.method === 'GET') {
        const sessionId = url.searchParams.get('session') || 'default';

        try {
          const historyData = await env.ADVERSIQ_DATA.get('chat:' + sessionId);
          const history = historyData ? JSON.parse(historyData) : [];
          return json({
            sessionId,
            history,
            count: history.length,
          });
        } catch (historyError) {
          return json({ error: historyError.message }, 500);
        }
      }

      // ============ DATA STORE CRUD ============
      // GET all data
      if (path === '/api/data' && request.method === 'GET') {
        try {
          const prefix = url.searchParams.get('prefix') || '';
          const list = await env.ADVERSIQ_DATA.list({ prefix });
          const items = await Promise.all(
            list.keys.map(async (k) => {
              const v = await env.ADVERSIQ_DATA.get(k.name);
              return {
                key: k.name,
                value: v ? JSON.parse(v) : null,
              };
            })
          );
          return json({ items, count: items.length });
        } catch (error) {
          return json({ error: error.message }, 500);
        }
      }

      // POST (store) data
      if (path === '/api/data' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        if (!body.key) return json({ error: 'Key required' }, 400);

        try {
          await env.ADVERSIQ_DATA.put(body.key, JSON.stringify(body.value));
          return json({ stored: true, key: body.key });
        } catch (error) {
          return json({ error: error.message }, 500);
        }
      }

      // DELETE data
      if (path === '/api/data' && request.method === 'DELETE') {
        const key = url.searchParams.get('key');
        if (!key) return json({ error: 'Key required' }, 400);

        try {
          await env.ADVERSIQ_DATA.delete(key);
          return json({ deleted: true, key });
        } catch (error) {
          return json({ error: error.message }, 500);
        }
      }

      // ============ WEBSOCKET REAL-TIME ============
      if (path === '/api/ws/connect') {
        const upgrade = request.headers.get('Upgrade');
        if (upgrade !== 'websocket') {
          return json({ error: 'Expected websocket' }, 426);
        }

        try {
          const [client, server] = Object.values(new WebSocketPair());
          server.accept();

          server.addEventListener('message', async (event) => {
            try {
              const data = JSON.parse(event.data);

              // Ping/Pong
              if (data.type === 'ping') {
                server.send(
                  JSON.stringify({
                    type: 'pong',
                    time: new Date().toISOString(),
                  })
                );
                return;
              }

              // AI inference
              if (data.type === 'ai') {
                const response = await env.AI.run(
                  '@cf/meta/llama-3.1-8b-instruct',
                  {
                    messages: [{ role: 'user', content: data.prompt }],
                  }
                );
                server.send(
                  JSON.stringify({
                    type: 'ai_response',
                    response: response.response,
                    id: data.id,
                    time: new Date().toISOString(),
                  })
                );
                return;
              }

              // Echo for testing
              server.send(
                JSON.stringify({
                  type: 'echo',
                  received: data,
                  time: new Date().toISOString(),
                })
              );
            } catch (err) {
              server.send(
                JSON.stringify({
                  type: 'error',
                  message: err.message,
                })
              );
            }
          });

          return new Response(null, { status: 101, webSocket: client });
        } catch (wsError) {
          return json({ error: 'WebSocket error: ' + wsError.message }, 500);
        }
      }

      // ============ ANALYTICS ============
      if (path === '/api/analytics') {
        try {
          const allData = await env.ADVERSIQ_DATA.list();
          const chatSessions = await env.ADVERSIQ_DATA.list({
            prefix: 'chat:',
          });
          return json({
            totalKeys: allData.keys.length,
            chatSessions: chatSessions.keys.length,
            region: request.cf?.colo || 'unknown',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return json({ error: error.message }, 500);
        }
      }

      // ============ 404 ============
      return json({ error: 'Endpoint not found', path }, 404);
    } catch (err) {
      return json(
        {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
        },
        500
      );
    }
  },
};
