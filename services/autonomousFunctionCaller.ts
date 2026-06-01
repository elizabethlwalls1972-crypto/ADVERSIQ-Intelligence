import { callGemmaJSON, callGeminiThinking, GemmaMessage } from '../gemmaService';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTONOMOUS FUNCTION CALLER (ReAct Loop)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements the core "ReAct" (Reason + Act) loop for Susan, allowing the AI to
 * autonomously invoke system features (like Report Generator, Location Intel)
 * by evaluating available tools, generating arguments, and assessing results.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface SystemTool {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (args: any) => Promise<any>;
  parametersSchema: object;
}

export class AutonomousFunctionCaller {
  private tools: Map<string, SystemTool> = new Map();
  private maxIterations = 5;

  registerTool(tool: SystemTool) {
    this.tools.set(tool.name, tool);
  }

  getAvailableToolsDescription(): string {
    const desc: string[] = [];
    this.tools.forEach((tool) => {
      desc.push(`Tool Name: ${tool.name}\nDescription: ${tool.description}\nSchema: ${JSON.stringify(tool.parametersSchema)}\n`);
    });
    return desc.join('\n');
  }

  /**
   * Main ReAct Loop
   */
  async executeTask(task: string, context: string = ''): Promise<string> {
    const memory: GemmaMessage[] = [
      {
        role: 'system',
        content: `You are Susan, a highly autonomous strategic AI agent. You have access to the following tools:
        
${this.getAvailableToolsDescription()}

To use a tool, reply ONLY with a JSON object in this exact format:
{
  "thought": "your reasoning for why you need this tool",
  "action": "Tool_Name",
  "action_input": { ... parameters matching the schema ... }
}

If you have completed the task and have the final answer for the user, reply ONLY with a JSON object in this exact format:
{
  "thought": "your final reasoning",
  "final_answer": "Your comprehensive response to the user."
}

Do not include markdown blocks like \`\`\`json, just the raw JSON object.`,
      },
      { role: 'user', content: `Task: ${task}\nContext: ${context}` }
    ];

    for (let i = 0; i < this.maxIterations; i++) {
      try {
        // Use Gemini Thinking for deep ReAct reasoning
        const responseJsonStr = await callGeminiThinking(memory, { temperature: 0.2 });
        
        let parsed;
        try {
          // Strip out potential markdown blocks
          const cleaned = responseJsonStr.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          parsed = JSON.parse(cleaned);
        } catch (e) {
          memory.push({ role: 'assistant', content: responseJsonStr });
          memory.push({ role: 'user', content: `Error parsing JSON: ${(e as Error).message}. Please ensure your response is strictly valid JSON.` });
          continue;
        }

        if (parsed.final_answer) {
          return parsed.final_answer;
        }

        if (parsed.action && parsed.action_input) {
          const tool = this.tools.get(parsed.action);
          if (!tool) {
            memory.push({ role: 'assistant', content: JSON.stringify(parsed) });
            memory.push({ role: 'user', content: `Tool "${parsed.action}" not found. Available tools: ${Array.from(this.tools.keys()).join(', ')}` });
            continue;
          }

          // Execute tool
          try {
            console.log(`[ReAct] Executing ${parsed.action} with`, parsed.action_input);
            const result = await tool.execute(parsed.action_input);
            
            memory.push({ role: 'assistant', content: JSON.stringify(parsed) });
            memory.push({ role: 'user', content: `Observation from ${parsed.action}:\n${JSON.stringify(result, null, 2)}\n\nNow, either take the next action or provide the final_answer.` });
          } catch (err) {
            memory.push({ role: 'assistant', content: JSON.stringify(parsed) });
            memory.push({ role: 'user', content: `Tool ${parsed.action} failed with error: ${(err as Error).message}` });
          }
        } else {
          memory.push({ role: 'assistant', content: JSON.stringify(parsed) });
          memory.push({ role: 'user', content: `Invalid format. Must include either action/action_input OR final_answer.` });
        }
      } catch (error) {
        console.error('[AutonomousFunctionCaller] Loop error:', error);
        return `Task failed during execution loop: ${(error as Error).message}`;
      }
    }

    return "Task timed out. The agent could not reach a final conclusion within the allowed iterations.";
  }
}

// Export singleton instance for system-wide use
export const autonomousCaller = new AutonomousFunctionCaller();
