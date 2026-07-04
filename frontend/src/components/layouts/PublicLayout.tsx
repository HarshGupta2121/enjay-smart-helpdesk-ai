import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function PublicLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if trying to access public routes (like login) while authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}