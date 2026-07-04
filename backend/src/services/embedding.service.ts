import { GoogleGenAI } from '@google/genai';

export class EmbeddingService {
  /**
   * Generates a vector embedding for a given text.
   * In a production environment, this delegates to the active AI provider.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const aiType = process.env.AI_PROVIDER || 'gemini';

    if (aiType.toUpperCase() === 'GEMINI') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in the environment.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: text,
      });
      return response.embeddings?.[0]?.values || new Array(768).fill(0);
    }

    if (aiType.toUpperCase() === 'MOCK') {
      // Return a pseudo-random deterministic array based on text length for testing
      const vector = new Array(1536).fill(0).map((_, i) => {
        return Math.sin(text.length * i) * 0.1;
      });
      return vector;
    }

    if (aiType.toUpperCase() === 'OPENAI') {
      throw new Error('OpenAI embeddings not fully implemented in this shell');
    }

    throw new Error(`Embedding generation not supported for provider: ${aiType}`);
  }
}

export default new EmbeddingService();