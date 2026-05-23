# WEEK 1 ACTION PLAN: Start with Ollama Integration
## Get Free, Private LLM Running in 8 Hours

**Goal**: Integrate Ollama so system costs $0 per analysis  
**Timeline**: 8 hours (can be completed in 1-2 work sessions)  
**Output**: One API call running through local Ollama, cost tracking showing "$0"

---

## STEP 1: Install Ollama Locally (30 min)

### On Mac
```bash
# Download Ollama from https://ollama.ai/download/mac
# Or use Homebrew
brew install ollama

# Start Ollama daemon
ollama serve
# Leaves running on http://localhost:11434
```

### On Linux (Ubuntu/Debian)
```bash
curl -fsSL https://ollama.ai/install.sh | sh

# Start as service
systemctl start ollama
# Or manually
ollama serve
```

### On Windows
```bash
# Download installer from https://ollama.ai/download/windows
# Run the .exe installer
# This installs Ollama service

# Verify it's running
# Open http://localhost:11434 in browser
# Should see "Ollama is running"
```

### Verify Installation
```bash
# In new terminal:
ollama list
# Should output installed models (none yet)

# Test the connection
curl http://localhost:11434/api/tags
# Should return JSON: {"models":[]}
```

---

## STEP 2: Pull Base Models (15 min)

```bash
# Pull mistral:7b (recommended - good balance of speed and quality)
# ~4GB download, takes 5-10 minutes on good internet
ollama pull mistral:7b

# Pull neural-chat:7b (ultra-fast for streaming responses)
# ~4GB, good for real-time UI updates
ollama pull neural-chat:7b

# Optional: pull faster model for quick tasks
ollama pull orca-mini:3b  # Only 2GB, very fast

# Verify models are ready
ollama list
# Should show:
# NAME               ID              SIZE      MODIFIED
# mistral:7b         12345678...     4.0 GB    5 minutes ago
# neural-chat:7b     87654321...     4.0 GB    4 minutes ago
# orca-mini:3b       abcdef...       2.1 GB    3 minutes ago
```

**Note**: These models run on CPU by default. If you have:
- **NVIDIA GPU**: Ollama will auto-detect CUDA and use it (100x faster)
- **Apple Silicon (M1/M2/M3)**: Ollama will auto-detect and use Metal acceleration (10x faster)

---

## STEP 3: Create OllamaBackendOrchestrator.ts (2 hours)

**File**: `services/OllamaBackendOrchestrator.ts`

```typescript
import axios from 'axios';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface GenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  temperature?: number;
  num_predict?: number; // token limit
}

interface GenerateResponse {
  response: string;
  done: boolean;
  model: string;
  created_at: string;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  eval_count: number;
}

export class OllamaBackendOrchestrator {
  private baseUrl = 'http://localhost:11434';
  private isAvailable = false;
  private availableModels: OllamaModel[] = [];
  private selectedModel = 'mistral:7b'; // Default
  
  private modelPool = {
    reasoning: 'mistral:7b',      // Complex analysis
    fast: 'neural-chat:7b',        // Fast responses
    ultrafast: 'orca-mini:3b',     // Mobile/constrained
    coding: 'deepseek-coder:6.7b', // Code generation (if pulled)
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Ollama connection
   */
  async initialize(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 3000,
      });

      this.availableModels = response.data.models || [];
      this.isAvailable = this.availableModels.length > 0;

      if (this.isAvailable) {
        console.log(`✅ Ollama available with ${this.availableModels.length} models`);
        
        // Select best available model from pool
        for (const [poolName, modelName] of Object.entries(this.modelPool)) {
          if (this.availableModels.some(m => m.name === modelName)) {
            this.selectedModel = modelName;
            console.log(`Using ${poolName} model: ${modelName}`);
            break;
          }
        }
      } else {
        console.log('⚠️  Ollama connected but no models available. Run: ollama pull mistral:7b');
      }
    } catch (error) {
      this.isAvailable = false;
      console.log('⚠️  Ollama not available. Will fall back to cloud APIs.');
      console.log('    To enable: ollama serve (in separate terminal)');
    }
  }

  /**
   * Check if Ollama is available and ready
   */
  isOllamaReady(): boolean {
    return this.isAvailable;
  }

  /**
   * Get status information
   */
  getStatus(): {
    available: boolean;
    models: OllamaModel[];
    selectedModel: string;
  } {
    return {
      available: this.isAvailable,
      models: this.availableModels,
      selectedModel: this.selectedModel,
    };
  }

  /**
   * Generate text using Ollama
   */
  async generate(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Ollama not available. Fall back to cloud API.');
    }

    const model = options?.model || this.selectedModel;

    try {
      const response = await axios.post<GenerateResponse>(
        `${this.baseUrl}/api/generate`,
        {
          model,
          prompt,
          stream: options?.stream ?? false,
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 1000,
        } as GenerateRequest,
        {
          timeout: 120000, // 2 minute timeout for long analyses
        }
      );

      return response.data.response;
    } catch (error) {
      console.error(`Ollama generation failed:`, error);
      throw new Error(`Ollama generation failed: ${error}`);
    }
  }

  /**
   * Stream text generation (for real-time UI updates)
   */
  async generateStream(
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Ollama not available. Fall back to cloud API.');
    }

    const model = options?.model || this.selectedModel;
    let fullResponse = '';

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model,
          prompt,
          stream: true,
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 1000,
        } as GenerateRequest,
        {
          responseType: 'stream',
          timeout: 120000,
        }
      );

      // Handle streaming response
      return new Promise((resolve, reject) => {
        let buffer = '';

        response.data.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          
          // Process complete JSON lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsed = JSON.parse(line) as GenerateResponse;
                if (parsed.response) {
                  onChunk(parsed.response);
                  fullResponse += parsed.response;
                }
              } catch (e) {
                // Skip parsing errors
              }
            }
          }
        });

        response.data.on('end', () => {
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer) as GenerateResponse;
              if (parsed.response) {
                onChunk(parsed.response);
                fullResponse += parsed.response;
              }
            } catch (e) {
              // Ignore
            }
          }
          resolve(fullResponse);
        });

        response.data.on('error', reject);
      });
    } catch (error) {
      console.error(`Ollama streaming failed:`, error);
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }

  /**
   * Pull a model (download from registry)
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      console.log(`Pulling model: ${modelName}...`);
      await axios.post(
        `${this.baseUrl}/api/pull`,
        { name: modelName },
        { timeout: 600000 } // 10 minute timeout for download
      );
      console.log(`✅ Model pulled: ${modelName}`);
      this.availableModels = await this.listModels();
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Get cost estimate for this call (always $0 for Ollama)
   */
  getEstimatedCost(): {
    cost: number;
    provider: string;
    details: string;
  } {
    return {
      cost: 0,
      provider: 'Ollama (Local)',
      details: 'Running on local machine, no cloud costs',
    };
  }
}

// Singleton instance
export const ollamaOrchestrator = new OllamaBackendOrchestrator();
```

---

## STEP 4: Create LLMProviderUnifier.ts (1 hour)

**File**: `services/LLMProviderUnifier.ts`

```typescript
import { ollamaOrchestrator, OllamaBackendOrchestrator } from './OllamaBackendOrchestrator';
import { callAI } from './AIProviderOrchestrator'; // Your existing cloud API wrapper

interface LLMResponse {
  text: string;
  cost: number;
  provider: string;
  tokensUsed?: number;
}

export class LLMProviderUnifier {
  /**
   * Try Ollama first, fall back to cloud API
   */
  static async generate(
    prompt: string,
    options?: {
      preferredModel?: 'reasoning' | 'fast' | 'ultrafast' | 'coding';
      maxTokens?: number;
      fallbackToCloud?: boolean;
    }
  ): Promise<LLMResponse> {
    const useCloudFallback = options?.fallbackToCloud !== false;

    // Try Ollama first (free, private)
    if (ollamaOrchestrator.isOllamaReady()) {
      try {
        const response = await ollamaOrchestrator.generate(prompt, {
          maxTokens: options?.maxTokens || 1000,
        });

        return {
          text: response,
          cost: 0,
          provider: 'Ollama (Local)',
        };
      } catch (error) {
        console.log('⚠️  Ollama generation failed, trying cloud fallback...');
        if (!useCloudFallback) {
          throw error;
        }
      }
    }

    // Fall back to cloud API
    if (useCloudFallback) {
      try {
        console.log('Using cloud API (Gemini/Claude)...');
        const response = await callAI(prompt, {
          maxTokens: options?.maxTokens || 1000,
        });

        return {
          text: response.text,
          cost: response.cost || 0.002, // Approximate cost
          provider: 'Gemini Flash / Claude',
        };
      } catch (error) {
        throw new Error(`Both Ollama and cloud API failed: ${error}`);
      }
    }

    throw new Error('Ollama not available and cloud fallback disabled');
  }

  /**
   * Stream response (real-time)
   */
  static async generateStream(
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: {
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    // Try Ollama first
    if (ollamaOrchestrator.isOllamaReady()) {
      try {
        const response = await ollamaOrchestrator.generateStream(prompt, onChunk, {
          maxTokens: options?.maxTokens || 1000,
        });

        return {
          text: response,
          cost: 0,
          provider: 'Ollama (Local)',
        };
      } catch (error) {
        console.log('Ollama streaming failed, falling back to cloud...');
      }
    }

    // Fall back to cloud (no streaming for cost reasons)
    const result = await this.generate(prompt, options);
    onChunk(result.text); // Send entire response as one chunk
    return result;
  }

  /**
   * Get system status (which LLM is available)
   */
  static getSystemStatus(): {
    primaryLLM: string;
    ollamaStatus: {
      available: boolean;
      models: string[];
      selectedModel: string;
    };
    cloudAPIStatus: {
      available: boolean;
      provider: string;
    };
  } {
    const ollamaStatus = ollamaOrchestrator.getStatus();
    const primaryLLM = ollamaStatus.available ? 'Ollama (Local)' : 'Cloud API (Gemini)';

    return {
      primaryLLM,
      ollamaStatus: {
        available: ollamaStatus.available,
        models: ollamaStatus.models.map(m => m.name),
        selectedModel: ollamaStatus.selectedModel,
      },
      cloudAPIStatus: {
        available: true,
        provider: 'Gemini Flash / Claude (Fallback)',
      },
    };
  }

  /**
   * Cost tracking across multiple calls
   */
  static costTracker = {
    totalCost: 0,
    callsFromOllama: 0,
    callsFromCloud: 0,

    addCall(cost: number, provider: string) {
      this.totalCost += cost;
      if (provider.includes('Ollama')) {
        this.callsFromOllama++;
      } else {
        this.callsFromCloud++;
      }
    },

    getStats() {
      return {
        totalCost: this.totalCost.toFixed(4),
        callsFromOllama: this.callsFromOllama,
        callsFromCloud: this.callsFromCloud,
        averageCostPerCall:
          ((this.totalCost /
            (this.callsFromOllama + this.callsFromCloud)) * 1000).toFixed(2) + ' cents',
        savings: `You saved $${((this.callsFromOllama * 0.002).toFixed(4))} by using Ollama`,
      };
    },

    reset() {
      this.totalCost = 0;
      this.callsFromOllama = 0;
      this.callsFromCloud = 0;
    },
  };
}
```

---

## STEP 5: Update API Route (1 hour)

**File**: `server/routes/ai.ts`

Replace existing AI calls with LLMProviderUnifier:

```typescript
import { LLMProviderUnifier } from '../../services/LLMProviderUnifier';

// Example: Replace existing /api/ai/analyze endpoint
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { problem, documents } = req.body;

    // Use unified LLM provider
    const response = await LLMProviderUnifier.generate(
      `Analyze this problem: ${problem}\n\nContext: ${documents}`
    );

    // Track cost
    LLMProviderUnifier.costTracker.addCall(response.cost, response.provider);

    res.json({
      analysis: response.text,
      cost: response.cost,
      provider: response.provider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add status endpoint
app.get('/api/system/llm-status', (req, res) => {
  const status = LLMProviderUnifier.getSystemStatus();
  const costs = LLMProviderUnifier.costTracker.getStats();

  res.json({
    status,
    costs,
  });
});
```

---

## STEP 6: Test the Integration (1 hour)

### Test 1: Verify Ollama Connection
```bash
# In terminal 1: Start Ollama (if not running)
ollama serve

# In terminal 2: Test the backend
curl http://localhost:3000/api/system/llm-status

# Should return:
# {
#   "status": {
#     "primaryLLM": "Ollama (Local)",
#     "ollamaStatus": {
#       "available": true,
#       "models": ["mistral:7b", "neural-chat:7b"],
#       "selectedModel": "mistral:7b"
#     }
#   },
#   "costs": {
#     "totalCost": "0.0000",
#     "callsFromOllama": 0,
#     "callsFromCloud": 0
#   }
# }
```

### Test 2: Generate Text via Ollama
```bash
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"problem": "How can we improve agriculture in Vietnam?", "documents": "GDP growth 6% annually"}'

# Should return:
# {
#   "analysis": "[Generated analysis from Ollama]",
#   "cost": 0,
#   "provider": "Ollama (Local)"
# }
```

### Test 3: Check Cost Tracking
```bash
# After running a few tests:
curl http://localhost:3000/api/system/llm-status

# Should show:
# "costs": {
#   "totalCost": "0.0000",
#   "callsFromOllama": 3,
#   "callsFromCloud": 0,
#   "savings": "You saved $0.0060 by using Ollama"
# }
```

### Test 4: Performance Benchmark
```bash
# Time how fast Ollama responds
time curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"problem": "Test question", "documents": ""}'

# On CPU: expect 15-45 seconds (depending on system)
# On GPU: expect 2-5 seconds
# On Apple Silicon: expect 3-8 seconds
```

---

## STEP 7: Display Cost Savings in UI (Optional, 30 min)

**File**: Create `components/LLMStatusBar.tsx`

```typescript
import React, { useState, useEffect } from 'react';

export const LLMStatusBar: React.FC = () => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/system/llm-status')
      .then(r => r.json())
      .then(setStatus)
      .catch(console.error);
  }, []);

  if (!status) return null;

  return (
    <div className="bg-green-50 border-b border-green-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold text-green-900">
            💰 Cost: ${status.costs.totalCost}
          </span>
          <span className="text-green-700 ml-4">
            {status.status.primaryLLM}
          </span>
        </div>
        <div className="text-xs text-green-600">
          {status.costs.savings}
        </div>
      </div>
    </div>
  );
};
```

Add to your main layout:
```typescript
<LLMStatusBar />
{/* Rest of your app */}
```

---

## VERIFICATION CHECKLIST

By end of Week 1, you should have:

- ✅ Ollama installed and running locally
- ✅ At least 2 models pulled (mistral:7b, neural-chat:7b)
- ✅ OllamaBackendOrchestrator.ts created and tested
- ✅ LLMProviderUnifier.ts created and integrated
- ✅ At least one API endpoint routed through LLMProviderUnifier
- ✅ Cost tracker showing "$0.00" for Ollama calls
- ✅ Status endpoint working (`/api/system/llm-status`)
- ✅ Optional: LLMStatusBar visible in UI

---

## TROUBLESHOOTING

### Issue: "Ollama is not available"
**Solution**: 
```bash
# Make sure Ollama is running in separate terminal
ollama serve

# If that fails, reinstall:
brew uninstall ollama
brew install ollama
ollama serve
```

### Issue: "models are empty / no models available"
**Solution**:
```bash
# Pull models explicitly
ollama pull mistral:7b
ollama pull neural-chat:7b

# Verify they were pulled
ollama list
```

### Issue: Generation is very slow (30+ seconds)
**Solution**:
- Normal on CPU. Consider upgrading hardware or using cloud fallback.
- Or use orca-mini:3b (much faster but lower quality).
- With GPU, responses should be 2-8 seconds.

### Issue: "Port 11434 already in use"
**Solution**:
```bash
# Kill existing Ollama process
pkill -f ollama

# Or specify different port
OLLAMA_HOST=127.0.0.1:11435 ollama serve

# Update OllamaBackendOrchestrator.ts baseUrl accordingly
```

---

## NEXT STEPS (Week 2)

Once Ollama is integrated:
1. Move to **Document Intake System** (Week 2)
2. Build multi-turn problem definition
3. Accept PDFs/Excel/Word documents
4. Extract and analyze document content

Then (Week 3):
1. Integrate continual-harness evolution passes
2. Build learning loop
3. See system improve from outcomes

**Estimated total time to full integration**: 8 weeks, but you'll see value after Week 1.

---

**Let's go.**

