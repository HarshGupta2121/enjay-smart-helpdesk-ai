import prisma from '../config/prisma';
import llmService from './llm.service';
import embeddingService from './embedding.service';
import { Ticket, Prisma } from '@prisma/client';

export class AIService {
  /**
   * Generates a draft reply for an agent based on the ticket context.
   * Does NOT auto-send. It simply returns the string to populate the UI.
   */
  async generateDraftReply(ticketId: string): Promise<string> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { comments: true },
    });

    if (!ticket) throw new Error('Ticket not found');

    const prompt = `
      You are an expert customer support agent at Enjay Smart HelpDesk.
      Draft a polite, professional reply to the following ticket.

      Ticket Title: ${ticket.title}
      Ticket Description: ${ticket.description}
      Current Status: ${ticket.status}

      Ensure the reply is concise and asks clarifying questions if needed.
    `;

    return llmService.generateText(prompt);
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
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) return;

      const combinedText = `Title: ${ticket.title}\nDescription: ${ticket.description}`;

      // Execute AI processing concurrently
      const [summary, classification, embedding] = await Promise.all([
        llmService.generateText(`Summarize this support ticket in exactly one sentence:\n\n${combinedText}`),
        llmService.generateClassification(ticket.title, ticket.description),
        embeddingService.generateEmbedding(combinedText),
      ]);

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