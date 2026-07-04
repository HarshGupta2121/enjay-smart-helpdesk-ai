export class EmbeddingService {
  /**
   * Generates a 1536-dimensional vector embedding for a given text.
   * In a production environment, this delegates to OpenAI's `text-embedding-3-small`
   * or a local HuggingFace embedding model via Ollama.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const aiType = process.env.AI_PROVIDER || 'MOCK';

    if (aiType === 'MOCK') {
      // Return a pseudo-random deterministic array based on text length for testing
      const vector = new Array(1536).fill(0).map((_, i) => {
        return Math.sin(text.length * i) * 0.1;
      });
      return vector;
    }

    if (aiType === 'OPENAI') {
      // return openai.embeddings.create({ model: "text-embedding-3-small", input: text }).data[0].embedding;
      throw new Error('OpenAI embeddings not fully implemented in this shell');
    }

    throw new Error(`Embedding generation not supported for provider: ${aiType}`);
  }
}

export default new EmbeddingService();