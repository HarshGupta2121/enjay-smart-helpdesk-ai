import { Request, Response } from 'express';
import ticketService from '../services/ticket.service';
import ticketRepository from '../repositories/ticket.repository';
import { sendSuccess } from '../utils/responseHelper';
import { StatusCodes } from 'http-status-codes';

const getClientInfo = (req: Request) => ({
  ipAddress: req.ip || req.socket.remoteAddress,
  userAgent: req.headers['user-agent'],
});

export class TicketController {
  async createTicket(req: Request, res: Response) {
    const requesterId = req.user!.userId;
    const { ipAddress, userAgent } = getClientInfo(req);

    const ticket = await ticketService.createTicket(req.body, requesterId, ipAddress, userAgent);

    return sendSuccess(res, StatusCodes.CREATED, 'Ticket created successfully', { ticket });
  }

  async getTickets(req: Request, res: Response) {
    const filters = {
      status: req.query.status as any,
      assigneeId: req.query.assigneeId as string,
      requesterId: req.query.requesterId as string,
      searchTerm: req.query.search as string,
    };

    const tickets = await ticketRepository.findTickets(filters);
    return sendSuccess(res, StatusCodes.OK, 'Tickets fetched successfully', { tickets });
  }

  async getTicket(req: Request, res: Response) {
    const { id } = req.params;
    const data = await ticketService.getTicketWithTimeline(id);

    return sendSuccess(res, StatusCodes.OK, 'Ticket fetched successfully', data);
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, version } = req.body;
    const actorId = req.user!.userId;
    const { ipAddress, userAgent } = getClientInfo(req);

    const ticket = await ticketService.updateTicketStatus(id, status, version, actorId, ipAddress, userAgent);

    return sendSuccess(res, StatusCodes.OK, 'Ticket status updated', { ticket });
  }

  async addComment(req: Request, res: Response) {
    const { id } = req.params;
    const { content, isInternal } = req.body;
    const authorId = req.user!.userId;
    const { ipAddress, userAgent } = getClientInfo(req);

    const comment = await ticketService.addComment(id, content, isInternal, authorId, ipAddress, userAgent);

    return sendSuccess(res, StatusCodes.CREATED, 'Comment added successfully', { comment });
  }
}

export default new TicketController();