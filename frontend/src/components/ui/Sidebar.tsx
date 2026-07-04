import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Inbox, Users, Settings, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from 'sonner';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'ENGINEER', 'CUSTOMER'] },
    { name: 'My Tickets', path: '/my-tickets', icon: Inbox, roles: ['ADMIN', 'MANAGER', 'ENGINEER', 'CUSTOMER'] },
    { name: 'All Tickets', path: '/tickets', icon: Ticket, roles: ['ADMIN', 'MANAGER', 'ENGINEER'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER'] },
  ];

  // Filter based on role
  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      // Regardless of API success (maybe token was already dead), we wipe the local state
      logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    },
  });

  return (
    <aside className="w-64 flex flex-col border-r border-border bg-card">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary truncate">Enjay HelpDesk</h1>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-destructive rounded-md hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="mr-3 h-5 w-5" />
          )}
          {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}