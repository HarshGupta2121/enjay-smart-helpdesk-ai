import { TicketStatus } from '@prisma/client';

export const TicketStateMachine: Record<TicketStatus, TicketStatus[]> = {
  NEW: ['OPEN', 'RESOLVED', 'CLOSED'],
  OPEN: ['PENDING', 'ON_HOLD', 'RESOLVED'],
  PENDING: ['OPEN', 'RESOLVED'],
  ON_HOLD: ['OPEN', 'RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['OPEN', 'RESOLVED'],
  CLOSED: [], // Terminal state
};

export const isValidTransition = (
  currentStatus: TicketStatus,
  nextStatus: TicketStatus
): boolean => {
  return TicketStateMachine[currentStatus]?.includes(nextStatus) ?? false;
};