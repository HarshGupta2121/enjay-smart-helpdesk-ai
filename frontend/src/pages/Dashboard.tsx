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
import { Search, AlertCircle, Eye, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
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

  // Derived dummy stats since we don't have an aggregate endpoint yet
  // In a real scenario, this would be a separate useQuery call to /api/tickets/stats
  const stats = {
    total: data?.tickets?.length || 0,
    open: data?.tickets?.filter((t: any) => t.status === 'OPEN').length || 0,
    pending: data?.tickets?.filter((t: any) => t.status === 'PENDING').length || 0,
    resolved: data?.tickets?.filter((t: any) => t.status === 'RESOLVED').length || 0,
    urgent: data?.tickets?.filter((t: any) => t.priority === 'URGENT' || t.priority === 'CRITICAL').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and track all support tickets.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket List Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Recent Tickets</CardTitle>

            {/* Filters Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tickets..."
                  className="pl-8 w-[200px] lg:w-[250px]"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
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
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Failed to load tickets</h3>
              <p className="text-sm text-muted-foreground mb-4">An error occurred while fetching the data from the server.</p>
              <button
                onClick={() => refetch()}
                className="flex items-center text-sm font-medium text-primary hover:underline"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>SLA Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  /* Skeleton Loaders */
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.tickets?.length === 0 ? (
                  /* Empty State */
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No tickets found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  /* Data Rows */
                  data?.tickets?.map((ticket: any) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={ticket.title}>{ticket.title}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.status as any}>{ticket.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.priority as any}>{ticket.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{ticket.category}</TableCell>
                      <TableCell>{ticket.assignee?.fullName || <span className="text-muted-foreground italic">Unassigned</span>}</TableCell>
                      <TableCell className="text-xs">{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-xs">
                        {ticket.resolutionDueAt
                          ? format(new Date(ticket.resolutionDueAt), 'MMM dd, h:mm a')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Simple Pagination Footer */}
          {!isError && !isLoading && data?.tickets?.length > 0 && (
            <div className="flex items-center justify-between mt-4 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Showing page {filters.page}
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 text-sm border rounded-md hover:bg-muted disabled:opacity-50"
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 text-sm border rounded-md hover:bg-muted disabled:opacity-50"
                  disabled={data?.tickets?.length < 20} // Assuming 20 is the default limit
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
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