import { TicketCategory, TicketPriority } from '@prisma/client';

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

// ---------------------------------------------------------
// 1. Mock Provider (Default for development without keys)
// ---------------------------------------------------------
class MockLLMProvider implements LLMProvider {
  async generateText(prompt: string): Promise<string> {
    return `[Mock AI Response]: Based on the provided context, the user is experiencing technical difficulties. We recommend checking the system logs.`;
  }

  async generateClassification(title: string, description: string) {
    return {
      category: TicketCategory.SOFTWARE,
      priority: TicketPriority.HIGH,
      sentiment: 'FRUSTRATED',
      confidence: 0.92,
      reason: 'User mentions app crashing repeatedly.',
    };
  }
}

// ---------------------------------------------------------
// 2. OpenAI Provider Implementation (Example Shell)
// ---------------------------------------------------------
class OpenAIProvider implements LLMProvider {
  async generateText(prompt: string): Promise<string> {
    // In production: await openai.chat.completions.create({...})
    throw new Error('OpenAI Provider not fully implemented in this shell');
  }
  async generateClassification(title: string, description: string): Promise<any> {
    throw new Error('OpenAI Provider not fully implemented in this shell');
  }
}

// ---------------------------------------------------------
// 3. Gemini Provider Implementation (Example Shell)
// ---------------------------------------------------------
class GeminiProvider implements LLMProvider {
  async generateText(prompt: string): Promise<string> {
    // In production: await google.generativeai.generateContent({...})
    throw new Error('Gemini Provider not fully implemented in this shell');
  }
  async generateClassification(title: string, description: string): Promise<any> {
    throw new Error('Gemini Provider not fully implemented in this shell');
  }
}

// ---------------------------------------------------------
// 4. Ollama Provider Implementation (Local LLM)
// ---------------------------------------------------------
class OllamaProvider implements LLMProvider {
  async generateText(prompt: string): Promise<string> {
    // In production: await axios.post('http://localhost:11434/api/generate', {...})
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
    const aiType = process.env.AI_PROVIDER || 'MOCK';

    switch (aiType) {
      case 'OPENAI':
        this.provider = new OpenAIProvider();
        break;
      case 'GEMINI':
        this.provider = new GeminiProvider();
        break;
      case 'OLLAMA':
        this.provider = new OllamaProvider();
        break;
      default:
        this.provider = new MockLLMProvider();
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