import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If authenticated but wrong role, send to a safe place (or 403 page)
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};