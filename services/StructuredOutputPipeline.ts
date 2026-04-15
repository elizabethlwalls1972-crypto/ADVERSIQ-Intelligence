/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 1: STRUCTURED OUTPUT — JSON Schema Enforcement + Validation
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Guarantees valid structured output from LLM calls.
 * Uses schema-in-prompt, robust extraction, validation, and retry-with-correction.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JSONSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, JSONSchema & { description?: string; enum?: string[] }>;
  items?: JSONSchema;
  required?: string[];
  description?: string;
}

export interface StructuredOutputResult<T> {
  data: T;
  raw: string;
  attempts: number;
  validationErrors: string[];
}

// ─── Schema Validator ───────────────────────────────────────────────────────

export function validateAgainstSchema(data: unknown, schema: JSONSchema, path = ''): string[] {
  const errors: string[] = [];
  if (data === null || data === undefined) {
    errors.push(`${path || 'root'}: value is null/undefined`);
    return errors;
  }

  if (schema.type === 'object') {
    if (typeof data !== 'object' || Array.isArray(data)) {
      errors.push(`${path || 'root'}: expected object, got ${Array.isArray(data) ? 'array' : typeof data}`);
      return errors;
    }
    const obj = data as Record<string, unknown>;
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj) || obj[key] === undefined) errors.push(`${path}.${key}: required field missing`);
      }
    }
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) errors.push(...validateAgainstSchema(obj[key], propSchema, `${path}.${key}`));
      }
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(data)) { errors.push(`${path || 'root'}: expected array`); return errors; }
    if (schema.items) {
      for (let i = 0; i < (data as unknown[]).length; i++) {
        errors.push(...validateAgainstSchema((data as unknown[])[i], schema.items, `${path}[${i}]`));
      }
    }
  } else if (schema.type === 'string') {
    if (typeof data !== 'string') errors.push(`${path || 'root'}: expected string`);
    const s = schema as JSONSchema & { enum?: string[] };
    if (s.enum && typeof data === 'string' && !s.enum.includes(data)) {
      errors.push(`${path || 'root'}: "${data}" not in [${s.enum.join(', ')}]`);
    }
  } else if (schema.type === 'number') {
    if (typeof data !== 'number' || isNaN(data as number)) errors.push(`${path || 'root'}: expected number`);
  } else if (schema.type === 'boolean') {
    if (typeof data !== 'boolean') errors.push(`${path || 'root'}: expected boolean`);
  }
  return errors;
}

// ─── JSON Extraction ────────────────────────────────────────────────────────

export function extractJSON(text: string): unknown | null {
  try { return JSON.parse(text); } catch { /* continue */ }

  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) { try { return JSON.parse(fenceMatch[1]); } catch { /* continue */ } }

  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const startIdx = firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket) ? firstBrace : firstBracket;
  if (startIdx >= 0) {
    const openChar = text[startIdx];
    const closeChar = openChar === '{' ? '}' : ']';
    let depth = 0; let inStr = false; let escaped = false;
    for (let i = startIdx; i < text.length; i++) {
      const ch = text[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === openChar) depth++;
      if (ch === closeChar) depth--;
      if (depth === 0) { try { return JSON.parse(text.slice(startIdx, i + 1)); } catch { break; } }
    }
  }
  return null;
}

// ─── Schema → Prompt ────────────────────────────────────────────────────────

function schemaToPrompt(schema: JSONSchema, indent = 0): string {
  const pad = '  '.repeat(indent);
  const lines: string[] = [];
  if (schema.type === 'object' && schema.properties) {
    lines.push(`${pad}{`);
    for (const [key, val] of Object.entries(schema.properties)) {
      const req = schema.required?.includes(key) ? ' (REQUIRED)' : '';
      const enumStr = val.enum ? ` — one of: ${val.enum.join(', ')}` : '';
      const desc = val.description ? ` — ${val.description}` : '';
      if (val.type === 'object') {
        lines.push(`${pad}  "${key}":${desc}${req}`);
        lines.push(schemaToPrompt(val, indent + 2));
      } else {
        lines.push(`${pad}  "${key}": ${val.type}${enumStr}${desc}${req}`);
      }
    }
    lines.push(`${pad}}`);
  }
  return lines.join('\n');
}

// ─── Main API ───────────────────────────────────────────────────────────────

export async function callWithStructuredOutput<T>(
  callLLM: (prompt: string) => Promise<string>,
  prompt: string,
  schema: JSONSchema,
  maxRetries = 3
): Promise<StructuredOutputResult<T>> {
  const schemaBlock = `\n\nRespond with ONLY valid JSON matching this exact schema:\n${schemaToPrompt(schema)}\n\nNo text before or after the JSON.`;
  const validationErrors: string[] = [];
  let fullPrompt = prompt + schemaBlock;
  let raw = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    raw = await callLLM(fullPrompt);
    const parsed = extractJSON(raw);
    if (parsed === null) {
      validationErrors.push(`Attempt ${attempt}: no valid JSON found`);
      fullPrompt = prompt + schemaBlock + '\n\nPrevious response was not valid JSON. Respond with ONLY JSON.';
      continue;
    }
    const errors = validateAgainstSchema(parsed, schema);
    if (errors.length === 0) return { data: parsed as T, raw, attempts: attempt, validationErrors };
    validationErrors.push(`Attempt ${attempt}: ${errors.join('; ')}`);
    fullPrompt = prompt + schemaBlock + `\n\nPrevious JSON had errors:\n${errors.map(e => `- ${e}`).join('\n')}\nFix and respond with corrected JSON only.`;
  }

  const lastParse = extractJSON(raw);
  return { data: (lastParse ?? {}) as T, raw, attempts: maxRetries, validationErrors };
}

// ─── Common Schemas ─────────────────────────────────────────────────────────

export const SCHEMAS = {
  consultantAnalysis: {
    type: 'object' as const,
    required: ['recommendation', 'confidence', 'reasoning', 'risks', 'nextSteps'],
    properties: {
      recommendation: { type: 'string' as const, enum: ['proceed', 'pause', 'restructure', 'reject'] },
      confidence: { type: 'number' as const, description: 'Score 0-100' },
      reasoning: { type: 'string' as const },
      risks: { type: 'array' as const, items: { type: 'string' as const } },
      nextSteps: { type: 'array' as const, items: { type: 'string' as const } },
      citations: { type: 'array' as const, items: { type: 'string' as const } },
    },
  },
  issueClassification: {
    type: 'object' as const,
    required: ['category', 'severity', 'rootCauses'],
    properties: {
      category: { type: 'string' as const },
      severity: { type: 'string' as const, enum: ['critical', 'high', 'medium', 'low'] },
      rootCauses: { type: 'array' as const, items: { type: 'string' as const } },
      affectedDomains: { type: 'array' as const, items: { type: 'string' as const } },
    },
  },
  deepReasoning: {
    type: 'object' as const,
    required: ['verdict', 'reasoningChain'],
    properties: {
      verdict: { type: 'string' as const, enum: ['Strong Buy', 'Consider', 'Hard Pass'] },
      dealKillers: { type: 'array' as const, items: { type: 'string' as const } },
      hiddenGems: { type: 'array' as const, items: { type: 'string' as const } },
      reasoningChain: { type: 'array' as const, items: { type: 'string' as const } },
      counterIntuitiveInsight: { type: 'string' as const },
    },
  },
};
