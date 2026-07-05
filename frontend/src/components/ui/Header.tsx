import { Bell, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 focus:outline-none"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="p-2 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 focus:outline-none">
          <Bell className="h-5 w-5" />
        </button>

        <Link
          to="/profile"
          className="flex items-center space-x-3 pl-4 border-l border-border/50 hover:opacity-80 transition-opacity"
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold overflow-hidden ring-2 ring-transparent transition-all hover:ring-primary/30">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
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