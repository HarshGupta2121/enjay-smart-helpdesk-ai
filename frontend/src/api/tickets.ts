import { api } from './client';

export interface FetchTicketsParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

export interface TicketResponse {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  resolutionDueAt: string | null;
  assignee: { fullName: string } | null;
}

export const fetchTickets = async (params: FetchTicketsParams) => {
  const response = await api.get('/tickets', { params });
  return response.data.data;
};