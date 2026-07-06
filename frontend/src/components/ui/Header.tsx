import { Bell, Moon, Sun, User, Menu } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/40">
      <div className="flex items-center">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="mr-4 p-2 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors md:hidden focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="p-2 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 focus:outline-none" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>

        <Link
          to="/profile"
          className="flex items-center space-x-3 pl-2 md:pl-4 border-l border-border/50 hover:opacity-80 transition-opacity"
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold overflow-hidden ring-2 ring-transparent transition-all hover:ring-primary/30">
            {user?.avatar ? (
              <img src={user?.avatar} alt={user?.fullName || 'Avatar'} className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="hidden md:flex flex-col text-sm">
            <span className="font-medium text-foreground leading-none font-display">{user?.fullName || 'User'}</span>
            <span className="text-xs text-muted-foreground mt-1.5">{user?.role || 'Role'}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
