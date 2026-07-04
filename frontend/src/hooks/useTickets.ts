import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTickets, FetchTicketsParams, fetchTicketTimeline, updateTicketStatus, addTicketComment } from '@/api/tickets';
import { toast } from 'sonner';

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

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: (data, variables) => {
      // Invalidate both the specific ticket and the ticket list to ensure global consistency
      queryClient.invalidateQueries({ queryKey: ['ticketTimeline', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket status updated successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTicketComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticketTimeline', variables.id] });
      toast.success(variables.isInternal ? 'Internal note added' : 'Reply posted');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to post comment';
      toast.error(msg);
    },
  });
};