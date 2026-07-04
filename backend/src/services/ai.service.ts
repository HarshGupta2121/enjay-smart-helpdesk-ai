import prisma from '../config/prisma';
import llmService from './llm.service';
import embeddingService from './embedding.service';
import { Prisma } from '@prisma/client';

export class AIService {
  private draftCache = new Map<string, { draft: string, timestamp: number }>();

  /**
   * Generates a draft reply for an agent based on the ticket context.
   * Does NOT auto-send. It simply returns the string to populate the UI.
   */
  async generateDraftReply(ticketId: string, forceRegenerate = false): Promise<string> {
    if (!forceRegenerate && this.draftCache.has(ticketId)) {
      console.log(`[AI Service] Cache hit for ticket ${ticketId} draft.`);
      return this.draftCache.get(ticketId)!.draft;
    }

    // Optimization: Select ONLY necessary fields. NO timeline/comments/metadata.
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        category: true,
        requester: { select: { fullName: true } }
      }
    });

    if (!ticket) throw new Error('Ticket not found');

    const prompt = `
      You are Enjay Smart HelpDesk AI, an expert customer support agent.
      Draft a polite, professional reply to the following ticket.

      RULES:
      - Never hallucinate or invent facts.
      - Never mention information not explicitly present in the ticket context.
      - If uncertain about the resolution, clearly state that more information is required.
      - Use Markdown formatting with headings and bullet points.
      - Address the customer strictly by their FIRST NAME.
      - Return clean Markdown only.

      REQUIRED FORMAT:
      Hi [Customer's FIRST NAME],

      Thank you for contacting Enjay Support.

      [Issue Understanding - summarize their issue in natural language]

      ### Troubleshooting Steps
      [Suggested Resolution - clear numbered or bulleted troubleshooting steps]

      ### Next Steps
      [Additional Information - mention what may be required if issue persists]

      Best Regards,
      **Enjay Smart HelpDesk AI**

      TICKET DATA:
      Title: ${ticket.title}
      Description: ${ticket.description}
      Customer Full Name: ${ticket.requester?.fullName || 'Customer'}
      Priority: ${ticket.priority}
      Category: ${ticket.category}
    `;

    const start = Date.now();
    const draft = await llmService.generateText(prompt, true); // true = fastFailOnRateLimit
    const end = Date.now();

    console.log(`
[AI Service] Gemini Draft Response Time: ${end - start}ms`);

    this.draftCache.set(ticketId, { draft, timestamp: Date.now() });

    return draft;
  }

  /**
   * The core background worker that processes a new ticket.
   * 1. Summarizes the content.
   * 2. Classifies the category, priority, and sentiment.
   * 3. Generates a semantic vector embedding.
   * 4. Detects duplicates.
   */
  async processNewTicketBackground(ticketId: string) {
    try {
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, include: { requester: true } });
      if (!ticket) return;

      const combinedText = `Title: ${ticket.title}\nDescription: ${ticket.description}`;

      // Execute AI processing sequentially to prevent Gemini Free Tier Rate Limits (429)
      const summary = await llmService.generateText(`
          You are an expert IT Service Management AI analyzing a support ticket.
          Generate a technical summary based STRICTLY on the provided context.

          RULES:
          - Never hallucinate or invent facts.
          - Never mention information not explicitly present in the ticket.
          - If uncertain about a cause or resolution, clearly state "More information required".
          - Use exact Markdown formatting as shown below, including headings and bullet points.
          - Extract FIRST NAME ONLY from the Customer Full Name.
          - Return clean Markdown only.

          REQUIRED FORMAT:
          ## Ticket Summary

          **Customer:**
          [FIRST NAME]

          **Issue:**
          [Problem Summary]

          **Possible Cause:**
          [Root Cause if inferable, else "More information required"]

          **Recommended Action:**
          - [Step 1]
          - [Step 2]

          **Priority:**
          [Priority Assessment]

          TICKET DATA:
          Title: ${ticket.title}
          Description: ${ticket.description}
          Customer Full Name: ${ticket.requester?.fullName || 'Customer'}
        `);

      const classification = await llmService.generateClassification(ticket.title, ticket.description);
      const embedding = await embeddingService.generateEmbedding(combinedText);

      // Detect Duplicates (Using Math locally if pgvector extension is missing, or raw SQL if present)
      const duplicateData = await this.detectDuplicates(ticketId, embedding);

      // Persist the AI Intelligence back to the ticket
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          aiSummary: summary,
          aiCategoryReason: classification.reason,
          aiSentiment: classification.sentiment,
          aiPriority: classification.priority,
          aiConfidence: classification.confidence,
          duplicateScore: duplicateData?.topScore || 0,
          embedding: embedding, // Stored safely as JSON array fallback
        },
      });

      // If a high-confidence duplicate is found, log an internal note to alert the agents
      if (duplicateData && duplicateData.topScore > 0.85) {
        await prisma.ticketComment.create({
          data: {
            ticketId: ticketId,
            authorId: ticket.requesterId, // Use system/requester ID
            content: `🤖 AI Alert: Potential duplicate detected. This ticket has a ${(duplicateData.topScore * 100).toFixed(1)}% semantic similarity to ticket #${duplicateData.similarTicketNumber}.`,
            isInternal: true,
          }
        });
      }

    } catch (error) {
      console.error(`[AI Service] Failed to process ticket ${ticketId}:`, error);
      // Fail silently in the background so it doesn't crash the main routing pipeline
    }
  }

  /**
   * Calculates duplicate score using Cosine Similarity.
   * In a true production environment with `pgvector` installed on the OS, this is done via:
   * SELECT id, 1 - (embedding <=> $1::vector) AS similarity FROM tickets ORDER BY embedding <=> $1 LIMIT 1
   */
  private async detectDuplicates(currentTicketId: string, currentEmbedding: number[]) {
    // Fallback in-memory Cosine Similarity computation since pgvector isn't natively installed on Windows OS
    const recentTickets = await prisma.ticket.findMany({
      where: {
        id: { not: currentTicketId },
        status: { in: ['NEW', 'OPEN', 'PENDING'] },
        embedding: { not: Prisma.AnyNull },
      },
      select: { id: true, ticketNumber: true, embedding: true },
      take: 100, // Limit memory overhead
    });

    if (recentTickets.length === 0) return null;

    let topScore = 0;
    let similarTicketNumber = null;

    for (const t of recentTickets) {
      const targetEmbedding = t.embedding as number[];
      if (!targetEmbedding || targetEmbedding.length !== 1536) continue;

      const score = this.cosineSimilarity(currentEmbedding, targetEmbedding);
      if (score > topScore) {
        topScore = score;
        similarTicketNumber = t.ticketNumber;
      }
    }

    return { topScore, similarTicketNumber };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export default new AIService();