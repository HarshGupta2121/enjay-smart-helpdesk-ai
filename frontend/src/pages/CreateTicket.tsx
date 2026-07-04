import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, UploadCloud } from 'lucide-react';

import { useCreateTicket } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Match backend Zod schema requirements
const createTicketSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000, 'Description is too long'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  type: z.enum(['INCIDENT', 'SERVICE_REQUEST', 'BUG', 'FEATURE_REQUEST', 'QUESTION']).optional(),
  category: z.enum(['SOFTWARE', 'HARDWARE', 'NETWORK', 'ACCOUNT', 'EMAIL', 'SECURITY', 'OTHER']).optional(),
});

type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

export default function CreateTicket() {
  const navigate = useNavigate();
  const createTicketMutation = useCreateTicket();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      type: 'QUESTION',
      category: 'SOFTWARE',
    },
  });

  const onSubmit = (data: CreateTicketFormValues) => {
    createTicketMutation.mutate(data, {
      onSuccess: (newTicket) => {
        // Redirect the user to the newly created ticket detail page
        navigate(`/tickets/${newTicket.id}`);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link to="/tickets" className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Submit a Request</h1>
          <p className="text-muted-foreground mt-1 text-sm">Please provide as much detail as possible to help us assist you faster.</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="shadow-sm border-border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
            <CardDescription>Fields marked with an asterisk (*) are required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none">
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="Brief summary of the issue..."
                {...register('title')}
                disabled={createTicketMutation.isPending}
                className="max-w-2xl"
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            {/* Grid for Classifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Category</label>
                <select
                  {...register('category')}
                  disabled={createTicketMutation.isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="SOFTWARE">Software</option>
                  <option value="HARDWARE">Hardware</option>
                  <option value="NETWORK">Network</option>
                  <option value="ACCOUNT">Account/Access</option>
                  <option value="EMAIL">Email</option>
                  <option value="SECURITY">Security</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Type</label>
                <select
                  {...register('type')}
                  disabled={createTicketMutation.isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="QUESTION">Question</option>
                  <option value="INCIDENT">Incident</option>
                  <option value="SERVICE_REQUEST">Service Request</option>
                  <option value="BUG">Bug Report</option>
                  <option value="FEATURE_REQUEST">Feature Request</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Priority</label>
                <select
                  {...register('priority')}
                  disabled={createTicketMutation.isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail. Steps to reproduce, expected vs actual behavior, etc."
                {...register('description')}
                disabled={createTicketMutation.isPending}
                className="min-h-[200px]"
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>

            {/* File Upload Shell */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Attachments (Optional)</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG, PDF or CSV (max 10MB)</p>
              </div>
            </div>

          </CardContent>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-end gap-3 rounded-b-lg">
            <Link
              to="/tickets"
              className="inline-flex items-center justify-center h-10 px-4 py-2 bg-transparent text-foreground text-sm font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              style={{ pointerEvents: createTicketMutation.isPending ? 'none' : 'auto' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="inline-flex items-center justify-center h-10 px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors shadow-sm"
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}