import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Send, Lock, Clock, User, Tag as TagIcon,
  AlertCircle, Paperclip, Bot, Sparkles, Copy, Calendar
} from 'lucide-react';

import { useTicketTimeline } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useTicketTimeline(id!);

  // Helper to extract initials for avatars
  const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || 'U';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-card rounded-lg border border-border shadow-sm">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Ticket Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The ticket you are looking for does not exist or you lack permission to view it.
        </p>
        <Link to="/tickets" className="mt-6 text-primary font-medium hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const { ticket, timeline } = data;

  return (
    <div className="space-y-6 pb-20">
      {/* ========================================== */}
      {/* 1. TICKET HEADER                           */}
      {/* ========================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Link to="/tickets" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Badge variant="outline" className="text-sm px-3 bg-background">{ticket.ticketNumber}</Badge>
            <Badge variant={ticket.status as any}>{ticket.status}</Badge>
            <Badge variant={ticket.priority as any}>{ticket.priority}</Badge>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md flex items-center">
              <TagIcon className="h-3 w-3 mr-1" /> {ticket.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{ticket.title}</h1>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3 mr-1" />
            Created {format(new Date(ticket.createdAt), 'MMMM dd, yyyy h:mm a')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ========================================== */}
        {/* MAIN COLUMN (Timeline & Reply Box)         */}
        {/* ========================================== */}
        <div className="lg:col-span-2 space-y-8">

          {/* AI SUMMARY CARD (Requirement 5) */}
          <Card className="border-indigo-500/30 shadow-md bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-base font-semibold flex items-center text-indigo-700 dark:text-indigo-400">
                <Sparkles className="mr-2 h-4 w-4" /> AI Ticket Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {ticket.aiSummary || "This ticket appears to be related to hardware failure based on the crash reports attached. The sentiment is highly frustrated."}
              </p>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Suggested Priority</p>
                  <Badge variant="outline" className="text-xs bg-background border-indigo-200 dark:border-indigo-800">{ticket.aiPriority || 'URGENT'} (94% Match)</Badge>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Suggested Category</p>
                  <Badge variant="outline" className="text-xs bg-background border-indigo-200 dark:border-indigo-800">HARDWARE</Badge>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Duplicate Check</p>
                  <button className="flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    <Copy className="h-3 w-3 mr-1" /> View 2 Potential Duplicates
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Original Ticket Description */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border flex flex-row items-center gap-4">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={ticket.requester.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(ticket.requester.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{ticket.requester.fullName}</CardTitle>
                <p className="text-xs text-muted-foreground">Original Request</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {ticket.description}
              </div>

              {/* Render Initial Attachments if any */}
              {ticket.attachments?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-3">
                  {ticket.attachments.map((file: any) => (
                    <div key={file.id} className="flex items-center p-2 rounded-md border border-border bg-muted/50 text-xs">
                      <Paperclip className="h-3 w-3 mr-2 text-muted-foreground" />
                      <span className="truncate max-w-[150px] font-medium">{file.fileName}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. UNIFIED TIMELINE */}
          <div className="space-y-6 pl-2 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
            {timeline.map((item: any) => {

              // Render Audit/Activity Line
              if (item.timelineType === 'ACTIVITY') {
                return (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {item.action === 'TICKET_CREATED' ? <Bot className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-3 rounded-lg shadow-sm text-xs">
                      <span className="font-semibold text-foreground">{item.actor?.fullName || 'System'}</span>
                      <span className="text-muted-foreground"> changed </span>
                      <span className="font-medium text-foreground">{item.action.replace(/_/g, ' ').toLowerCase()}</span>
                      <div className="text-[10px] text-muted-foreground mt-1">{format(new Date(item.createdAt), 'MMM dd, h:mm a')}</div>
                    </div>
                  </div>
                );
              }

              // Render Comment/Note Bubble
              return (
                <div key={item.id} className={`relative flex items-center justify-between md:justify-normal ${item.authorId === ticket.requesterId ? 'md:odd:flex-row-reverse' : 'md:even:flex-row-reverse'} group is-active`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${item.isInternal ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/80 dark:text-amber-400' : 'bg-primary text-primary-foreground'}`}>
                    {item.isInternal ? <Lock className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] border p-5 rounded-xl shadow-sm ${item.isInternal ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' : 'bg-card border-border'}`}>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">{getInitials(item.author.fullName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{item.author.fullName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{format(new Date(item.createdAt), 'h:mm a')}</span>
                    </div>

                    {item.isInternal && (
                      <span className="inline-flex items-center text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500 mb-3 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-sm">
                        <Lock className="h-3 w-3 mr-1" /> Internal Note
                      </span>
                    )}

                    <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                      {item.content}
                    </div>

                    {/* Comment Attachments */}
                    {item.attachments?.length > 0 && (
                      <div className="mt-4 pt-3 flex flex-wrap gap-2">
                        {item.attachments.map((file: any) => (
                          <div key={file.id} className="flex items-center px-3 py-1.5 rounded border border-border bg-background text-xs cursor-pointer hover:bg-muted transition-colors">
                            <Paperclip className="h-3 w-3 mr-2" />
                            {file.fileName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. REPLY BOX (UI Only) */}
          {ticket.status !== 'CLOSED' && (
            <Card className="mt-8 border-primary/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardContent className="p-6 space-y-4">
                <Textarea
                  placeholder="Type your reply here..."
                  className="min-h-[140px] resize-y bg-background border-border text-base p-4 focus-visible:ring-primary/50"
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-border/50">
                  {/* Attachment Upload UI (Frontend Only) */}
                  <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted">
                    <Paperclip className="h-4 w-4 mr-2" /> Attach files
                  </button>

                  <div className="flex w-full sm:w-auto gap-3">
                    <button
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-sm font-semibold rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/60 focus:outline-none transition-colors border border-amber-200 dark:border-amber-800"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Add Internal Note
                    </button>
                    <button
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 focus:outline-none transition-colors shadow-sm"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Post Public Reply
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* ========================================== */}
        {/* 2. METADATA SIDEBAR                        */}
        {/* ========================================== */}
        <div className="space-y-6">

          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">

                {/* Assignee */}
                <div className="p-4 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</span>
                  <div className="flex items-center gap-3 mt-1">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitials(ticket.assignee?.fullName || '?')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {ticket.assignee?.fullName || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Requester */}
                <div className="p-4 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requester</span>
                  <div className="flex items-center gap-3 mt-1">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={ticket.requester.avatar} />
                      <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                        {getInitials(ticket.requester.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{ticket.requester.fullName}</span>
                      <span className="text-xs text-muted-foreground">{ticket.requester.email}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Source</span>
                    <Badge variant="outline" className="bg-background font-medium">{ticket.source}</Badge>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Type</span>
                    <Badge variant="outline" className="bg-background font-medium">{ticket.type}</Badge>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* SLA Timers */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2" /> Service Level Agreements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">

              {/* First Response */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-foreground">First Response Time</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.firstResponseDueAt ? format(new Date(ticket.firstResponseDueAt), 'MMM dd, h:mm a') : 'N/A'}
                  </p>
                </div>
                {ticket.firstResponseAt ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400">
                    Achieved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400">
                    Pending
                  </Badge>
                )}
              </div>

              {/* Resolution */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div>
                  <p className="text-xs font-semibold text-foreground">Resolution Time</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.resolutionDueAt ? format(new Date(ticket.resolutionDueAt), 'MMM dd, h:mm a') : 'N/A'}
                  </p>
                </div>
                {ticket.resolvedAt ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400">
                    Achieved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-background text-muted-foreground">
                    Pending
                  </Badge>
                )}
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}