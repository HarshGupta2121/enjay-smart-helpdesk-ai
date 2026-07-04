import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Send, Lock, Clock, User, Tag as TagIcon,
  AlertCircle, Paperclip, Bot, Sparkles, Copy, Calendar, Loader2,
  RefreshCw, ArrowDownToLine
} from 'lucide-react';

import { useTicketTimeline, useUpdateTicketStatus, useAddComment, useGenerateAiReply, useSimilarTickets } from '@/hooks/useTickets';
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
  const [aiDraft, setAiDraft] = useState<string | null>(null);

  const { data, isLoading, isError } = useTicketTimeline(id!);
  const { data: similarTicketsData, isLoading: similarLoading } = useSimilarTickets(id!);
  const updateStatusMutation = useUpdateTicketStatus();
  const addCommentMutation = useAddComment();
  const generateAiMutation = useGenerateAiReply();

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

  // Handlers for Mutations
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
      { onSuccess: () => setCommentContent('') } // Clear text box on success
    );
  };

  const handleGenerateAiReply = () => {
    generateAiMutation.mutate(ticket.id, {
      onSuccess: (draft) => {
        setAiDraft(draft);
      },
    });
  };

  const handleCopyDraft = () => {
    if (aiDraft) {
      navigator.clipboard.writeText(aiDraft);
    }
  };

  const handleInsertDraft = () => {
    if (aiDraft) {
      setCommentContent((prev) => prev ? `${prev}\n\n${aiDraft}` : aiDraft);
      setAiDraft(null);
    }
  };

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
            {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        )}
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
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {ticket.aiSummary || `## Ticket Summary

**Customer:**
Unknown

**Issue:**
Unable to determine issue.

**Possible Cause:**
More information required

**Recommended Action:**
More information required

**Priority:**
Unknown`}
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Suggested Priority</p>
                  <Badge variant="outline" className="text-xs bg-background border-indigo-200 dark:border-indigo-800">{ticket.aiPriority || 'N/A'}</Badge>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Suggested Category</p>
                  <Badge variant="outline" className="text-xs bg-background border-indigo-200 dark:border-indigo-800">{ticket.aiCategory || 'N/A'}</Badge>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Sentiment</p>
                  <Badge variant="outline" className="text-xs bg-background border-indigo-200 dark:border-indigo-800">{ticket.aiSentiment || 'N/A'}</Badge>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Confidence Score</p>
                  <Badge variant="outline" className="text-xs bg-background border-indigo-200 dark:border-indigo-800">{ticket.aiConfidence ? `${ticket.aiConfidence}%` : 'N/A'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {similarTicketsData && similarTicketsData.length > 0 && (
            <Card className="shadow-sm border-amber-200/50 dark:border-amber-900/50">
              <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center text-amber-700 dark:text-amber-400">
                  <Copy className="mr-2 h-4 w-4" /> Similar Tickets Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {similarTicketsData.map((st: any) => (
                    <div key={st.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{st.title}</p>
                        <div className="flex items-center mt-1 gap-2">
                          <Badge variant="outline" className="text-[10px]">{st.ticketNumber}</Badge>
                          <span className="text-xs text-muted-foreground">Similarity: {st.similarityScore}%</span>
                        </div>
                      </div>
                      <Link to={`/tickets/${st.id}`} className="text-xs font-medium text-primary hover:underline" aria-label={`Open similar ticket ${st.ticketNumber}`}>
                        Open Ticket
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* AI Draft Section */}
          {(generateAiMutation.isPending || generateAiMutation.isError || aiDraft !== null) && (
            <Card className="mt-4 border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <CardHeader className="py-3 px-4 border-b border-indigo-100 dark:border-indigo-900/50">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generated Draft
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {generateAiMutation.isPending && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                )}

                {generateAiMutation.isError && (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="h-6 w-6 text-destructive mb-2" />
                    <p className="text-sm text-foreground mb-3">Failed to generate AI reply.</p>
                    <button
                      onClick={handleGenerateAiReply}
                      className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium transition-colors"
                    >
                      Retry Generation
                    </button>
                  </div>
                )}

                {aiDraft !== null && !generateAiMutation.isPending && !generateAiMutation.isError && (
                  <>
                    <Textarea
                      value={aiDraft}
                      onChange={(e) => setAiDraft(e.target.value)}
                      className="min-h-[100px] resize-y bg-background border-indigo-200 dark:border-indigo-800 text-sm focus-visible:ring-indigo-500/50"
                      aria-label="AI Generated Draft"
                      title="Edit AI generated draft here"
                    />
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={handleGenerateAiReply}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                        aria-label="Regenerate response"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyDraft}
                          className="text-xs px-3 py-1.5 border border-border bg-background rounded-md hover:bg-muted font-medium transition-colors flex items-center"
                          aria-label="Copy response"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </button>
                        <button
                          onClick={handleInsertDraft}
                          className="text-xs px-3 py-1.5 bg-indigo-600 text-white dark:bg-indigo-700 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 font-medium transition-colors flex items-center"
                          aria-label="Insert into editor"
                        >
                          <ArrowDownToLine className="h-3 w-3 mr-1" /> Insert
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* 4. REPLY BOX (WIRED TO MUTATIONS) */}
          {ticket.status !== 'CLOSED' ? (
            <Card className="mt-8 border-primary/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardContent className="p-6 space-y-4">
                <Textarea
                  placeholder="Type your reply here..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[140px] resize-y bg-background border-border text-base p-4 focus-visible:ring-primary/50"
                  disabled={addCommentMutation.isPending || generateAiMutation.isPending}
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-border/50">
                  {/* Left Side: Attachments and AI Copilot */}
                  <div className="flex items-center gap-2">
                    <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted">
                      <Paperclip className="h-4 w-4 mr-2" /> Attach files
                    </button>

                    {['ADMIN', 'MANAGER', 'ENGINEER'].includes(currentUser?.role || '') && (
                      <button
                        onClick={handleGenerateAiReply}
                        disabled={generateAiMutation.isPending || addCommentMutation.isPending}
                        className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-50"
                      >
                        {generateAiMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {generateAiMutation.isPending ? 'Drafting...' : 'Draft with AI'}
                      </button>
                    )}
                  </div>

                  {/* Right Side: Action Buttons */}
                  <div className="flex w-full sm:w-auto gap-3">
                    {['ADMIN', 'MANAGER', 'ENGINEER'].includes(currentUser?.role || '') && (
                      <button
                        onClick={() => handleAddComment(true)}
                        disabled={addCommentMutation.isPending || !commentContent.trim() || generateAiMutation.isPending}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-sm font-semibold rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/60 focus:outline-none transition-colors border border-amber-200 dark:border-amber-800 disabled:opacity-50"
                      >
                        {addCommentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                        Add Internal Note
                      </button>
                    )}
                    <button
                      onClick={() => handleAddComment(false)}
                      disabled={addCommentMutation.isPending || !commentContent.trim() || generateAiMutation.isPending}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 focus:outline-none transition-colors shadow-sm disabled:opacity-50"
                    >
                      {addCommentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Post Public Reply
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground text-sm flex items-center justify-center">
              <Lock className="mr-2 h-4 w-4" /> This ticket is closed. No further replies can be added.
            </div>
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
                    <Avatar className="h-6 w-6 border border-border">
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