# AI Intelligence Layer

The Enjay Smart HelpDesk AI layer transforms standard ticketing into a semantic, context-aware engine. The architecture is designed to be fully modular, allowing you to swap between LLM providers effortlessly.

## 1. Pluggable Providers (`llm.service.ts`)
The AI engine relies on a Strategy pattern. By setting the `AI_PROVIDER` environment variable (`OPENAI`, `GEMINI`, `OLLAMA`, `MOCK`), the system hot-swaps the underlying LLM logic.
- No provider logic exists inside the Express controllers.
- This allows enterprise deployments to utilize isolated, on-premise open-source models (like Llama 3 via Ollama) for strict data privacy, while allowing cloud deployments to leverage OpenAI.

## 2. Asynchronous Pipeline (`ai.service.ts`)
To ensure high-performance API response times, the AI processing occurs *completely in the background* (`processNewTicketBackground`). 
1. **Summarization**: Generates a one-sentence summary of the user's issue to populate the Agent UI cards.
2. **Classification**: Analyzes the title and description to predict `Sentiment`, `Priority`, and `Category`.
3. **Semantic Embedding**: Generates a 1536-dimensional floating-point vector representing the ticket's semantic meaning.

## 3. Vector Similarity & Duplicate Detection
The engine natively supports advanced Duplicate Detection.
- **Production (`pgvector`)**: By utilizing the PostgreSQL `vector` extension, the engine can execute blazing-fast cosine similarity queries (`ORDER BY embedding <=> $1`) natively at the database level across millions of rows.
- **Local Fallback**: If `pgvector` is not available on your local machine, the Prisma schema gracefully falls back to storing the 1536-dim vector as a `Json` array, and the `ai.service.ts` calculates the Cosine Similarity via in-memory math.

## 4. Drafting Replies
Agents can generate AI-suggested responses via `POST /api/tickets/:id/ai/reply`. The LLM service reads the ticket context (and the history of comments) to draft a highly contextual, polite response. The response is *not* sent automatically; it is returned to the frontend for human review.