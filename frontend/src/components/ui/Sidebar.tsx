import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, Inbox, Users, Settings, LogOut, Loader2, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
      logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    },
  });

  return (
    <aside 
      className={
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-card shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out border-r border-border md:relative md:translate-x-0 " +
        (isOpen ? "translate-x-0" : "-translate-x-full")
      }
    >
      <div className="h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-display font-bold text-primary truncate tracking-tight">Enjay HelpDesk</h1>
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 " +
                (isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")
              }
            >
              <Icon className={"mr-3 h-5 w-5 transition-colors " + (isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button
          onClick={() => { logoutMutation.mutate(); onClose?.(); }}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 transition-colors"
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
