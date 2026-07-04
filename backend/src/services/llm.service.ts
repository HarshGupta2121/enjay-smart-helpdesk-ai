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
    if (prompt.includes('## Ticket Summary')) {
      return `## Ticket Summary

**Customer:**
Alice

**Issue:**
User is unable to access the billing portal and is receiving a 404 error page.

**Possible Cause:**
More information required (Likely a routing issue or an expired session token).

**Recommended Action:**
1. Clear browser cache and cookies.
2. Attempt logging in using an Incognito window.
3. Check internal routing logs for the billing service.

**Priority:**
High`;
    }
    
    if (prompt.includes("Hi [Customer's FIRST NAME]")) {
      return `Hi Alice,

Thank you for contacting Enjay Support.

I understand you are experiencing a 404 error when trying to access the billing portal. I apologize for the inconvenience this is causing.

To help us resolve this quickly, please try the following troubleshooting steps:
1. Clear your browser's cache and cookies.
2. Attempt to access the portal using an Incognito or Private browsing window.
3. Verify if you are connected to the company VPN.

If the issue persists, please reply to this ticket with your browser version and a screenshot of the error, so our engineering team can investigate further.

Best Regards,
Enjay Smart HelpDesk AI`;
    }

    return `[Mock AI Response]: Based on the provided context, the user is experiencing technical difficulties.`;
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