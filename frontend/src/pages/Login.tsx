import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

// Form Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Where did the user try to go before being redirected to login?
  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Login Mutation API Call
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken } = data.data;

      // Store in Zustand
      setAuth(user, accessToken);
      toast.success('Welcome back!');

      // Redirect Logic:
      // If they tried to access a specific page, send them there.
      // Otherwise, route them based on their role.
      if (from) {
        navigate(from, { replace: true });
      } else {
        const defaultRoute = user.role === 'CUSTOMER' ? '/my-tickets' : '/dashboard';
        navigate(defaultRoute, { replace: true });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-xl border border-border">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Enjay HelpDesk</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your support tickets</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@enjay.com"
              {...register('email')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loginMutation.isPending}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none text-foreground" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loginMutation.isPending}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={loginMutation.isPending}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none text-foreground cursor-pointer"
            >
              Remember me for 7 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}