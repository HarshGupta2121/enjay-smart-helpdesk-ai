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

export const fetchTicketTimeline = async (id: string) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data.data;
};

export const updateTicketStatus = async ({ id, status, version }: { id: string; status: string; version: number }) => {
  const response = await api.patch(`/tickets/${id}/status`, { status, version });
  return response.data.data;
};

export const addTicketComment = async ({ id, content, isInternal }: { id: string; content: string; isInternal: boolean }) => {
  const response = await api.post(`/tickets/${id}/comments`, { content, isInternal });
  return response.data.data;
};