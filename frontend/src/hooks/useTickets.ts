import { useQuery } from '@tanstack/react-query';
import { fetchTickets, FetchTicketsParams, fetchTicketTimeline } from '@/api/tickets';

export const useTickets = (params: FetchTicketsParams) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => fetchTickets(params),
    placeholderData: (previousData) => previousData, // Keeps previous data visible while fetching next page
  });
};

export const useTicketTimeline = (id: string) => {
  return useQuery({
    queryKey: ['ticketTimeline', id],
    queryFn: () => fetchTicketTimeline(id),
    enabled: !!id,
  });
};