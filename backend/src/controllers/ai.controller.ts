import { Request, Response } from 'express';
import aiService from '../services/ai.service';
import { sendSuccess } from '../utils/responseHelper';
import { StatusCodes } from 'http-status-codes';

export class AIController {
  public generateReply = async (req: Request, res: Response) => {
    const { id } = req.params; // ticketId

    const draft = await aiService.generateDraftReply(id);

    return sendSuccess(res, StatusCodes.OK, 'Draft reply generated successfully', { draft });
  };
}

export default new AIController();