import { Request, Response } from 'express';
import ticketService from '../services/ticket.service';
import { sendSuccess } from '../utils/responseHelper';
import { StatusCodes } from 'http-status-codes';
import { TicketStatus } from '@prisma/client';

export class TicketController {
  public getTickets = async (req: Request, res: Response) => {
    const { 
      page, 
      limit, 
      search, 
      status, 
      priority, 
      category, 
      assigneeId, 
      requesterId 
    } = req.query;

    const data = await ticketService.getTickets({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search as string,
      status: status as string,
      priority: priority as string,
      category: category as string,
      assigneeId: assigneeId as string,
      requesterId: requesterId as string
    }, req.user!);

    return sendSuccess(res, StatusCodes.OK, 'Tickets fetched successfully', data);
  };


  public createTicket = async (req: Request, res: Response) => {
    const requesterId = req.user!.userId;

    // IP and UserAgent extracted for the Service's Audit Log
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const ticket = await ticketService.createTicket(req.body, requesterId, ipAddress, userAgent);

    return sendSuccess(res, StatusCodes.CREATED, 'Ticket created successfully', { ticket });
  };

  public getTicket = async (req: Request, res: Response) => {
    const { id } = req.params;

    const data = await ticketService.getTicketWithTimeline(id);

    return sendSuccess(res, StatusCodes.OK, 'Ticket fetched successfully', data);
  };

  public updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, version } = req.body as { status: TicketStatus; version: number };
    const actorId = req.user!.userId;

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const ticket = await ticketService.updateTicketStatus(
      id,
      status,
      version,
      actorId,
      ipAddress,
      userAgent
    );

    return sendSuccess(res, StatusCodes.OK, 'Ticket status updated', { ticket });
  };

  public addComment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content, isInternal } = req.body as { content: string; isInternal: boolean };
    const authorId = req.user!.userId;

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const comment = await ticketService.addComment(
      id,
      content,
      isInternal,
      authorId,
      ipAddress,
      userAgent
    );

    return sendSuccess(res, StatusCodes.CREATED, 'Comment added successfully', { comment });
  };
}

export default new TicketController();