import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts & Guards
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PublicLayout from '@/components/layouts/PublicLayout';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Lazy loaded Pages
const Login = React.lazy(() => import('@/pages/Login'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Tickets = React.lazy(() => import('@/pages/Tickets'));
const TicketDetails = React.lazy(() => import('@/pages/TicketDetails'));
const CreateTicket = React.lazy(() => import('@/pages/CreateTicket'));
const MyTickets = React.lazy(() => import('@/pages/MyTickets'));
const Users = React.lazy(() => import('@/pages/Users'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const ErrorPage = React.lazy(() => import('@/pages/ErrorPage'));

const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Public Routes
  {
    element: <PublicLayout />,
    errorElement: withSuspense(ErrorPage),
    children: [
      {
        path: '/login',
        element: withSuspense(Login),
      },
    ],
  },

  // Protected Dashboard Routes
  {
    element: <ProtectedRoute />,
    errorElement: withSuspense(ErrorPage),
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Default redirect
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          // All authenticated users
          {
            path: '/dashboard',
            element: withSuspense(Dashboard),
          },
          {
            path: '/my-tickets',
            element: withSuspense(MyTickets),
          },
          // Anyone authenticated can create a ticket
          {
            path: '/tickets/new',
            element: withSuspense(CreateTicket),
          },
          {
            path: '/tickets/:id',
            element: withSuspense(TicketDetails),
          },
          {
            path: '/profile',
            element: withSuspense(Profile),
          },

          // Agent/Admin Routes
          {
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'ENGINEER']} />,
            children: [
              {
                path: '/tickets',
                element: withSuspense(Tickets),
              }
            ]
          },

          // Admin/Manager Routes
          {
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />,
            children: [
              {
                path: '/settings',
                element: withSuspense(Settings),
              }
            ]
          },

          // Admin Only Routes
          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: '/users',
                element: withSuspense(Users),
              }
            ]
          },

          // 404 Catcher inside dashboard
          {
            path: '*',
            element: withSuspense(NotFound),
          }
        ],
      },
    ],
  },
]);