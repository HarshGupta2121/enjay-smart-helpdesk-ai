import { useQuery } from '@tanstack/react-query';
import { fetchTickets, FetchTicketsParams } from '@/api/tickets';

export const useTickets = (params: FetchTicketsParams) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => fetchTickets(params),
    placeholderData: (previousData) => previousData, // Keeps previous data visible while fetching next page
  });
};