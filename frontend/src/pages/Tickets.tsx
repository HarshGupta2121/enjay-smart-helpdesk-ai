import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, AlertCircle, Eye, RefreshCcw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Tickets() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    page: 1,
  });

  const [searchInput, setSearchInput] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useTickets(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Layers className="mr-3 h-8 w-8 text-primary" />
          All Tickets
        </h1>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Create Ticket
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-lg">Ticket Directory</CardTitle>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-48 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticket ID or title..."
                className="pl-9 h-9 w-full bg-background"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              aria-label="Filter by Status"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hidden sm:block"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              aria-label="Filter by Priority"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <button
              onClick={() => refetch()}
              className="h-9 px-3 rounded-md border border-input bg-background hover:bg-muted text-foreground transition-colors flex items-center justify-center ml-auto"
              title="Refresh Directory"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Failed to fetch directory</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">We couldn't retrieve the tickets. Please try again or check your connection.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : !data?.tickets || data.tickets.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center border-t border-border">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Layers className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No records found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                No tickets match your current filters and search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchInput('');
                  setFilters({ search: '', status: '', priority: '', category: '', page: 1 });
                }}
                className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px]">Ticket #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Priority</TableHead>
                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.tickets.map((ticket: any) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium text-foreground" title={ticket.title}>
                        {ticket.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {ticket.requester?.fullName || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.status as any}>{ticket.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={ticket.priority as any}>{ticket.priority}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs font-medium">
                        {ticket.category}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted text-primary transition-colors"
                          aria-label={`View Ticket ${ticket.ticketNumber}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
              <span className="text-sm text-muted-foreground">
                Showing page <span className="font-medium text-foreground">{filters.page}</span> of <span className="font-medium text-foreground">{data.meta.totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1 || isLoading}
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  className="px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={filters.page >= data.meta.totalPages || isLoading}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}