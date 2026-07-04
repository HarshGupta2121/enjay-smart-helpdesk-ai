# AI Intelligence Layer

The AI Intelligence layer is split between backend asynchronous processing and frontend Copilot interfaces.

## Backend Architecture
- **Pluggable LLM Strategy**: Abstract class `LLMProvider` extended by `OpenAIProvider`, `GeminiProvider`, and `OllamaProvider`.
- **Classification Engine**: Automatically processes `NEW` tickets. Identifies Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), Category, Sentiment (`ANGRY`, `NEUTRAL`, `HAPPY`), and Confidence Score (0-100).
- **Embeddings & pgvector**: Ticket descriptions and titles are vectorized and stored in a `vector(1536)` column in PostgreSQL. `fetchSimilarTickets` queries via Cosine Distance `<=>` operators.
- **Draft Reply Generation**: The `/api/tickets/:id/ai/reply` endpoint constructs a contextual prompt utilizing the entire ticket timeline (comments + activity) and generates a drafted professional response.

## Frontend Copilot Integration
- Located within `TicketDetails.tsx`.
- **AI Summary UI**: Immediately visible to Agents upon ticket view. Removes manual triage overhead.
- **Draft Workflow**: Agents must intentionally click "Draft with AI". The system ensures human-in-the-loop (HITL) by generating the response into an isolated preview window. The Agent must explicitly click "Insert" and then "Post Public Reply".
- **Duplicate Awareness**: Similar tickets are exposed visually in the UI allowing Agents to link or merge requests.
