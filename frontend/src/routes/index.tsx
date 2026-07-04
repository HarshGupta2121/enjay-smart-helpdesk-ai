import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts & Guards
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PublicLayout from '@/components/layouts/PublicLayout';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Tickets from '@/pages/Tickets';
import TicketDetails from '@/pages/TicketDetails';
import CreateTicket from '@/pages/CreateTicket';
import MyTickets from '@/pages/MyTickets';
import Users from '@/pages/Users';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import ErrorPage from '@/pages/ErrorPage';

export const router = createBrowserRouter([
  // Public Routes
  {
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },

  // Protected Dashboard Routes
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
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
            element: <Dashboard />,
          },
          {
            path: '/my-tickets',
            element: <MyTickets />,
          },
          // Anyone authenticated can create a ticket
          {
            path: '/tickets/new',
            element: <CreateTicket />,
          },
          {
            path: '/tickets/:id',
            element: <TicketDetails />,
          },
          {
            path: '/profile',
            element: <Profile />,
          },

          // Agent/Admin Routes
          {
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'ENGINEER']} />,
            children: [
              {
                path: '/tickets',
                element: <Tickets />,
              }
            ]
          },

          // Admin/Manager Routes
          {
            element: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />,
            children: [
              {
                path: '/settings',
                element: <Settings />,
              }
            ]
          },

          // Admin Only Routes
          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: '/users',
                element: <Users />,
              }
            ]
          },

          // 404 Catcher inside dashboard
          {
            path: '*',
            element: <NotFound />,
          }
        ],
      },
    ],
  },
]);