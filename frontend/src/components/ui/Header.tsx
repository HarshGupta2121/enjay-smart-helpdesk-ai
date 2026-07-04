import { Bell, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors focus:outline-none"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors focus:outline-none">
          <Bell className="h-5 w-5" />
        </button>

        <Link
          to="/profile"
          className="flex items-center space-x-2 pl-2 border-l border-border hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="hidden md:flex flex-col text-sm">
            <span className="font-medium text-foreground leading-none">{user?.fullName || 'User'}</span>
            <span className="text-xs text-muted-foreground mt-1">{user?.role || 'Role'}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}