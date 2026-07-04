import { TicketCategory, TicketPriority } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

export interface LLMProvider {
  generateText(prompt: string): Promise<string>;
  generateClassification(title: string, description: string): Promise<{
    category: TicketCategory;
    priority: TicketPriority;
    sentiment: string;
    confidence: number;
    reason: string;
  }>;
}

const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 2, timeoutMs = 15000): Promise<T> => {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI Request timeout')), timeoutMs)
      );
      return await Promise.race([fn(), timeoutPromise]);
    } catch (error: any) {
      attempt++;
      console.warn(`[LLM Service] Attempt ${attempt} failed: ${error.message}. Retrying...`);
      if (attempt > maxRetries) {
        console.error(`[LLM Service] All ${maxRetries + 1} attempts failed.`);
        throw error;
      }
    }
  }
  throw new Error('Unreachable');
};

// ---------------------------------------------------------
// 1. Gemini Provider Implementation
// ---------------------------------------------------------
class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error('WARNING: GEMINI_API_KEY is missing from environment variables.');
    } else {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is missing. Please configure your environment to use AI features.');
    }

    return withRetry(async () => {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
        }
      });
      return response.text || '';
    });
  }

  async generateClassification(title: string, description: string): Promise<any> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is missing. Cannot classify ticket.');
    }

    const prompt = `
      Analyze the following support ticket and classify it into specific parameters.
      Respond ONLY with a valid JSON object. Do not use Markdown formatting for the JSON block.

      Ticket Title: ${title}
      Ticket Description: ${description}

      Return a JSON object with this exact structure:
      {
        "category": "SOFTWARE" | "HARDWARE" | "NETWORK" | "ACCOUNT" | "EMAIL" | "SECURITY" | "OTHER",
        "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL",
        "sentiment": "HAPPY" | "NEUTRAL" | "FRUSTRATED" | "ANGRY" | "PANICKED",
        "confidence": <number between 0 and 100>,
        "reason": "Brief one sentence explanation for this classification"
      }
    `;

    return withRetry(async () => {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
        }
      });

      const text = response.text || '{}';

      try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error('[Gemini] Classification Parse Error:', error);
        return {
          category: TicketCategory.OTHER,
          priority: TicketPriority.MEDIUM,
          sentiment: 'NEUTRAL',
          confidence: 0,
          reason: 'Failed to parse AI classification',
        };
      }
    });
  }
}

// ---------------------------------------------------------
// 2. OpenAI Provider Implementation (Example Shell)
// ---------------------------------------------------------
class OpenAIProvider implements LLMProvider {
  async generateText(prompt: string): Promise<string> {
    throw new Error('OpenAI Provider not fully implemented in this shell');
  }
  async generateClassification(title: string, description: string): Promise<any> {
    throw new Error('OpenAI Provider not fully implemented in this shell');
  }
}

// ---------------------------------------------------------
// 3. Ollama Provider Implementation (Local LLM)
// ---------------------------------------------------------
class OllamaProvider implements LLMProvider {
  async generateText(prompt: string): Promise<string> {
    throw new Error('Ollama Provider not fully implemented in this shell');
  }
  async generateClassification(title: string, description: string): Promise<any> {
    throw new Error('Ollama Provider not fully implemented in this shell');
  }
}

// ---------------------------------------------------------
// Factory / Strategy Selector
// ---------------------------------------------------------
export class LLMService {
  private provider: LLMProvider;

  constructor() {
    const aiType = process.env.AI_PROVIDER || 'gemini';

    switch (aiType.toUpperCase()) {
      case 'OPENAI':
        this.provider = new OpenAIProvider();
        break;
      case 'OLLAMA':
        this.provider = new OllamaProvider();
        break;
      case 'GEMINI':
      default:
        this.provider = new GeminiProvider();
    }
  }

  async generateText(prompt: string): Promise<string> {
    return this.provider.generateText(prompt);
  }

  async generateClassification(title: string, description: string) {
    return this.provider.generateClassification(title, description);
  }
}

export default new LLMService();