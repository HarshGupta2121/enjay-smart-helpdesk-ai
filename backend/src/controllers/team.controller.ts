import { Request, Response } from 'express';
import teamRepository from '../repositories/team.repository';
import { sendSuccess } from '../utils/responseHelper';
import { StatusCodes } from 'http-status-codes';

export class TeamController {
  public createTeam = async (req: Request, res: Response) => {
    const { name, description, assignmentStrategy, firstResponseSlaHrs, resolutionSlaHrs } = req.body;

    const team = await teamRepository.createTeam({
      name,
      description,
      settings: {
        create: {
          assignmentStrategy,
          firstResponseSlaHrs,
          resolutionSlaHrs,
        },
      },
    });

    // Create a default General queue for the new team
    await teamRepository.createQueue(team.id, 'General');

    return sendSuccess(res, StatusCodes.CREATED, 'Team created successfully', { team });
  };

  public addMember = async (req: Request, res: Response) => {
    const { id } = req.params; // teamId
    const { userId, role } = req.body;

    const member = await teamRepository.addTeamMember(id, userId, role);

    return sendSuccess(res, StatusCodes.CREATED, 'Member added to team', { member });
  };

  public createQueue = async (req: Request, res: Response) => {
    const { id } = req.params; // teamId
    const { name } = req.body;

    const queue = await teamRepository.createQueue(id, name);

    return sendSuccess(res, StatusCodes.CREATED, 'Queue created successfully', { queue });
  };

  public getTeamMembers = async (req: Request, res: Response) => {
    const { id } = req.params;

    const members = await teamRepository.getTeamMembers(id);

    return sendSuccess(res, StatusCodes.OK, 'Team members fetched', { members });
  };
}

export default new TeamController();