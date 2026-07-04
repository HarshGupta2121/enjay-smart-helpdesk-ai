import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, Send, Lock, Clock, User, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { useTicketTimeline, useUpdateTicketStatus, useAddComment } from '@/hooks/useTickets';
import { useAuthStore } from '@/store/authStore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const [commentContent, setCommentContent] = useState('');

  const { data, isLoading, isError, refetch } = useTicketTimeline(id!);
  const updateStatusMutation = useUpdateTicketStatus();
  const addCommentMutation = useAddComment();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Ticket Not Found</h2>
        <p className="text-muted-foreground mt-2">The ticket you are looking for does not exist or you don't have permission to view it.</p>
        <Link to="/tickets" className="mt-6 text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
        </Link>
      </div>
    );
  }

  const { ticket, timeline } = data;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatusMutation.mutate({
      id: ticket.id,
      status: e.target.value,
      version: ticket.version,
    });
  };

  const handleAddComment = (isInternal: boolean) => {
    if (!commentContent.trim()) return;
    addCommentMutation.mutate(
      { id: ticket.id, content: commentContent, isInternal },
      { onSuccess: () => setCommentContent('') }
    );
  };

  const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="space-y-6 pb-20">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/tickets" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Badge variant="outline" className="text-sm px-3">{ticket.ticketNumber}</Badge>
            <Badge variant={ticket.status as any}>{ticket.status}</Badge>
            <Badge variant={ticket.priority as any}>{ticket.priority}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{ticket.title}</h1>
        </div>

        {/* Status Mutator (Only for Agents/Admins) */}
        {['ADMIN', 'MANAGER', 'ENGINEER'].includes(currentUser?.role || '') && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Change Status:</span>
            <select
              disabled={updateStatusMutation.isPending}
              value={ticket.status}
              onChange={handleStatusChange}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timeline & Comments */}
        <div className="lg:col-span-2 space-y-6">

          {/* Original Description */}
          <Card>
            <CardHeader className="bg-muted/30 pb-4 border-b border-border flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src={ticket.requester.avatar} />
                <AvatarFallback>{getInitials(ticket.requester.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{ticket.requester.fullName}</CardTitle>
                <p className="text-xs text-muted-foreground">Reported on {format(new Date(ticket.createdAt), 'MMM dd, yyyy h:mm a')}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {ticket.description}
              </div>
            </CardContent>
          </Card>

          {/* Unified Timeline Feed */}
          <div className="space-y-4 pl-2 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {timeline.map((item: any) => {
              if (item.timelineType === 'ACTIVITY') {
                return (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-3 rounded shadow-sm text-xs">
                      <span className="font-semibold text-foreground">{item.actor?.fullName || 'System'}</span> changed{' '}
                      <span className="font-medium">{item.action.replace('_', ' ').toLowerCase()}</span> on {format(new Date(item.createdAt), 'MMM dd, h:mm a')}
                    </div>
                  </div>
                );
              }

              // COMMENT
              return (
                <div key={item.id} className={`relative flex items-center justify-between md:justify-normal ${item.authorId === ticket.requesterId ? 'md:odd:flex-row-reverse' : 'md:even:flex-row-reverse'} group is-active`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${item.isInternal ? 'bg-amber-100 text-amber-600' : 'bg-primary text-primary-foreground'}`}>
                    {item.isInternal ? <Lock className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] border p-4 rounded-lg shadow-sm ${item.isInternal ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' : 'bg-card border-border'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{item.author.fullName}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(item.createdAt), 'MMM dd, h:mm a')}</span>
                    </div>
                    {item.isInternal && <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500 mb-2 block">Internal Note</span>}
                    <div className="whitespace-pre-wrap text-sm text-foreground">
                      {item.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Box */}
          {ticket.status !== 'CLOSED' ? (
            <Card className="mt-8 border-primary/20 shadow-md">
              <CardContent className="p-4 space-y-4">
                <Textarea
                  placeholder="Type your reply here..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[120px] resize-y"
                  disabled={addCommentMutation.isPending}
                />
                <div className="flex justify-end gap-3">
                  {['ADMIN', 'MANAGER', 'ENGINEER'].includes(currentUser?.role || '') && (
                    <button
                      onClick={() => handleAddComment(true)}
                      disabled={addCommentMutation.isPending || !commentContent.trim()}
                      className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400 text-sm font-medium rounded-md hover:bg-amber-200 dark:hover:bg-amber-900 focus:outline-none disabled:opacity-50 transition-colors"
                    >
                      {addCommentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                      Add Internal Note
                    </button>
                  )}
                  <button
                    onClick={() => handleAddComment(false)}
                    disabled={addCommentMutation.isPending || !commentContent.trim()}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 focus:outline-none disabled:opacity-50 transition-colors"
                  >
                    {addCommentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Post Public Reply
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground text-sm flex items-center justify-center">
              <Lock className="mr-2 h-4 w-4" /> This ticket is closed. No further replies can be added.
            </div>
          )}

        </div>

        {/* Right Column: Metadata Sidebar */}
        <div className="space-y-6">

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Assignee</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">{getInitials(ticket.assignee?.fullName || '?')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{ticket.assignee?.fullName || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Category</p>
                <div className="flex items-center gap-2 text-sm">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  {ticket.category}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Source</p>
                <span className="text-sm">{ticket.source}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">SLA Timers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">First Response Due</p>
                <p className={`text-sm font-medium ${ticket.firstResponseAt ? 'text-emerald-600' : new Date() > new Date(ticket.firstResponseDueAt) ? 'text-destructive' : 'text-foreground'}`}>
                  {ticket.firstResponseDueAt ? format(new Date(ticket.firstResponseDueAt), 'MMM dd, h:mm a') : '-'}
                  {ticket.firstResponseAt && ' (Fulfilled)'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Resolution Due</p>
                <p className={`text-sm font-medium ${ticket.resolvedAt ? 'text-emerald-600' : new Date() > new Date(ticket.resolutionDueAt) ? 'text-destructive' : 'text-foreground'}`}>
                  {ticket.resolutionDueAt ? format(new Date(ticket.resolutionDueAt), 'MMM dd, h:mm a') : '-'}
                  {ticket.resolvedAt && ' (Fulfilled)'}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}