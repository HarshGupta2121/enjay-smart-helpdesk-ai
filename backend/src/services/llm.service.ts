import { TicketCategory, TicketPriority } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

export interface LLMProvider {
  generateText(prompt: string, fastFail?: boolean): Promise<string>;
  generateClassification(title: string, description: string): Promise<{
    category: TicketCategory;
    priority: TicketPriority;
    sentiment: string;
    confidence: number;
    reason: string;
  }>;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const extractRetryDelay = (errorMessage: string): number => {
  const match = errorMessage.match(/Please retry in (\d+(?:\.\d+)?)(s|ms)/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    return (unit === 's' ? value * 1000 : value) + 2000; // Add 2s safety buffer
  }
  return 30000; // Default 30s
};

interface RetryOptions {
  maxRetries?: number;
  timeoutMs?: number;
  fastFailOnRateLimit?: boolean;
}

const withRetry = async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
  const maxRetries = options.maxRetries ?? 1;
  const timeoutMs = options.timeoutMs ?? 15000;
  const fastFailOnRateLimit = options.fastFailOnRateLimit ?? false;

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI Request timeout')), timeoutMs)
      );
      return await Promise.race([fn(), timeoutPromise]);
    } catch (error: any) {
      attempt++;

      const errorMessage = error.message || String(error);
      const isRateLimit = error.status === 429 || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('Quota');

      if (isRateLimit && fastFailOnRateLimit) {
        const waitTime = extractRetryDelay(errorMessage);
        const seconds = Math.round(waitTime / 1000);
        throw new Error(`AI API is busy due to Free Tier quotas. Please wait ${seconds} seconds before trying again.`);
      }

      if (attempt > maxRetries) {
        console.error(`[LLM Service] All ${maxRetries + 1} attempts failed.`);
        throw error;
      }

      if (isRateLimit) {
        const waitTime = extractRetryDelay(errorMessage);
        console.warn(`\n[LLM Service] Rate limit exceeded (429). Waiting ${Math.round(waitTime / 1000)} seconds before attempt ${attempt + 1}...`);
        await delay(waitTime);
      } else {
        console.warn(`\n[LLM Service] Attempt ${attempt} failed: ${errorMessage}. Retrying in 2 seconds...`);
        await delay(2000);
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

  async generateText(prompt: string, fastFail = false): Promise<string> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is missing. Please configure your environment to use AI features.');
    }

    console.log('\n[LLM Provider] Using Provider: GEMINI');
    console.log(`[LLM Provider] Sending Prompt Length: ${prompt.length} chars`);

    return withRetry(async () => {
      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2,
        }
      });

      const responseText = response.text || '';
      console.log(`[LLM Provider] Response Received. Length: ${responseText.length}`);
      return responseText;
    }, { fastFailOnRateLimit: fastFail, maxRetries: 1 });
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

    console.log('\n[LLM Provider] Using Provider: GEMINI (Classification)');

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
        const parsed = JSON.parse(jsonStr);
        console.log('[LLM Provider] Classification Result:', parsed);
        return parsed;
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
    }, { maxRetries: 2 });
  }
}

// ---------------------------------------------------------
// 2. OpenAI Provider Implementation (Example Shell)
// ---------------------------------------------------------
class OpenAIProvider implements LLMProvider {
  async generateText(_prompt: string, _fastFail?: boolean): Promise<string> {
    throw new Error('OpenAI Provider not fully implemented in this shell');
  }
  async generateClassification(_title: string, _description: string): Promise<any> {
    throw new Error('OpenAI Provider not fully implemented in this shell');
  }
}

// ---------------------------------------------------------
// 3. Ollama Provider Implementation (Local LLM)
// ---------------------------------------------------------
class OllamaProvider implements LLMProvider {
  async generateText(_prompt: string, _fastFail?: boolean): Promise<string> {
    throw new Error('Ollama Provider not fully implemented in this shell');
  }
  async generateClassification(_title: string, _description: string): Promise<any> {
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

  async generateText(prompt: string, fastFail = false): Promise<string> {
    return this.provider.generateText(prompt, fastFail);
  }

  async generateClassification(title: string, description: string) {
    return this.provider.generateClassification(title, description);
  }
}

export default new LLMService();