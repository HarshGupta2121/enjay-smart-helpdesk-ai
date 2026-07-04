import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/useUsers';
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
import { Search, AlertCircle, Users as UsersIcon, RefreshCcw, Mail, Shield, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Users() {
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1,
  });

  
  const [searchInput, setSearchInput] = useState('');

  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'ENGINEER', isActive: true });

    const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', password: '', role: 'ENGINEER', isActive: true });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({ fullName: user.fullName || '', email: user.email, password: '', role: user.role?.code || 'ENGINEER', isActive: user.isActive });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useUsers(filters);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <UsersIcon className="mr-3 h-8 w-8 text-primary" />
          Users Management
        </h1>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Add New User
        </button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-lg">System Users</CardTitle>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                className="pl-9 h-9 w-full bg-background"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
              aria-label="Filter by Role"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="ENGINEER">Engineer</option>
              <option value="CUSTOMER">Customer</option>
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
              <h3 className="text-lg font-semibold">Failed to load users</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">We couldn't retrieve the user directory. The endpoint may not be implemented on the backend yet.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : !data?.users || data.users.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center border-t border-border">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <UsersIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No users found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                No users match your current filters and search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{user.fullName || 'Unknown User'}</span>
                            <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                              <Mail className="h-3 w-3 mr-1" /> {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{user.role?.code || 'UNKNOWN'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.isActive ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Edit
                        </button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Modify the user's details and access level." : "Create a new user account for the platform."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                required 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                required 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="john@example.com"
                disabled={!!editingUser}
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input 
                  required 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
            )}
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium">Role</label>
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="ENGINEER">Engineer</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium">Active Account</label>
            </div>
            <DialogFooter className="pt-4">
              <button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save User
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
