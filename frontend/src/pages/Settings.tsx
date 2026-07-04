import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useProfile, useUpdateProfile, useChangePassword } from '@/hooks/useProfile';
import { useTheme } from '@/providers/ThemeProvider';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User, Mail, Shield, AlertCircle, Settings as SettingsIcon,
  Bell, Lock, Palette, Phone, Camera, KeyRound, Loader2,
  Eye, EyeOff, Smartphone, Monitor, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// SCHEMAS
// ==========================================

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  department: z.string().max(50).optional().or(z.literal('')),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const securitySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Settings() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { setTheme, theme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'security'>('profile');

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="md:col-span-3 space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-card rounded-lg border border-border shadow-sm">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Failed to load Settings</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          We couldn't retrieve your profile and system settings. Please verify your connection.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: Lock },
  ] as const;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-medium text-left ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'profile' && <ProfileTab profile={profile} getInitials={getInitials} />}
          {activeTab === 'appearance' && <AppearanceTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TABS
// ==========================================

function ProfileTab({ profile, getInitials }: { profile: any, getInitials: (n: string) => string }) {
  const updateProfileMutation = useUpdateProfile();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      department: 'IT Support', // Mock local field
      avatar: profile?.avatar || '',
    }
  });

  const avatarUrl = watch('avatar');

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate({
      fullName: data.fullName,
      phone: data.phone,
      avatar: data.avatar,
    }, {
      onSuccess: () => {
        // Form states managed automatically by useUpdateProfile's query invalidation
      }
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 border-b border-border bg-muted/30">
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your account details and public identity.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={avatarUrl || profile?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
              {getInitials(profile?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-semibold text-foreground">Profile Picture</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              We recommend an image of at least 400x400px. You can also provide an external URL below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('fullName')}
                  className="pl-9"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  readOnly
                  value={profile?.email || ''}
                  className="pl-9 bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Email changes require administrator approval.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('phone')}
                  className="pl-9"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('department')}
                  className="pl-9"
                  placeholder="e.g. IT Support"
                />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <div className="relative">
                <Camera className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('avatar')}
                  className="pl-9"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              {errors.avatar && <p className="text-xs text-destructive">{errors.avatar.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Account Role</label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-md">
                <Shield className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    {profile?.role?.name || profile?.role?.code || 'AGENT'}
                  </span>
                  <span className="text-xs text-muted-foreground">Privileges are permanently locked by administrators.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 disabled:opacity-50 transition-colors"
            >
              {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AppearanceTab({ theme, setTheme }: { theme: string, setTheme: (t: 'light' | 'dark' | 'system') => void }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 border-b border-border bg-muted/30">
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the interface theme of the HelpDesk application.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <div className="w-full h-24 bg-[#f8fafc] rounded-md border border-[#e2e8f0] p-3 flex flex-col gap-2 shadow-sm">
              <div className="w-1/2 h-2 bg-[#cbd5e1] rounded-sm"></div>
              <div className="w-3/4 h-2 bg-[#e2e8f0] rounded-sm"></div>
              <div className="w-full h-8 bg-white rounded shadow-sm mt-auto"></div>
            </div>
            <span className="text-sm font-medium">Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <div className="w-full h-24 bg-[#0f172a] rounded-md border border-[#1e293b] p-3 flex flex-col gap-2 shadow-sm">
              <div className="w-1/2 h-2 bg-[#334155] rounded-sm"></div>
              <div className="w-3/4 h-2 bg-[#1e293b] rounded-sm"></div>
              <div className="w-full h-8 bg-[#020617] rounded shadow-sm mt-auto border border-[#1e293b]"></div>
            </div>
            <span className="text-sm font-medium">Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <div className="w-full h-24 bg-gradient-to-r from-[#f8fafc] to-[#0f172a] rounded-md border border-border p-3 flex flex-col gap-2 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Monitor className="h-8 w-8 text-muted-foreground/50 mix-blend-difference" />
              </div>
            </div>
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    email: true,
    browser: true,
    assignment: true,
    ai: true,
    weekly: false,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Notification preferences saved successfully');
      localStorage.setItem('enjay-notif-prefs', JSON.stringify(prefs));
    }, 600);
  };

  useEffect(() => {
    const saved = localStorage.getItem('enjay-notif-prefs');
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 border-b border-border bg-muted/30">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure how and when you want to be alerted.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">Email Notifications</label>
              <p className="text-xs text-muted-foreground">Receive critical updates via your registered email.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-primary"
              checked={prefs.email}
              onChange={e => setPrefs({...prefs, email: e.target.checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">Browser Push Notifications</label>
              <p className="text-xs text-muted-foreground">Get instant alerts while the dashboard is open.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-primary"
              checked={prefs.browser}
              onChange={e => setPrefs({...prefs, browser: e.target.checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">Ticket Assignment Alerts</label>
              <p className="text-xs text-muted-foreground">Notify me immediately when a ticket is routed to me.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-primary"
              checked={prefs.assignment}
              onChange={e => setPrefs({...prefs, assignment: e.target.checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">AI Action Summaries</label>
              <p className="text-xs text-muted-foreground">Send me a digest when AI auto-resolves or tags a ticket.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-primary"
              checked={prefs.ai}
              onChange={e => setPrefs({...prefs, ai: e.target.checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-foreground">Weekly Reports</label>
              <p className="text-xs text-muted-foreground">Receive a weekly PDF summary of your ticket metrics.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-primary"
              checked={prefs.weekly}
              onChange={e => setPrefs({...prefs, weekly: e.target.checked})}
            />
          </div>

        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  const changePasswordMutation = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmit = (data: SecurityFormValues) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }, {
      onSuccess: () => reset()
    });
  };

  const handleLogoutAll = () => {
    toast.success('Successfully logged out of all other devices.');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-destructive/20">
        <CardHeader className="border-b border-border bg-destructive/5 pb-4">
          <CardTitle className="flex items-center text-destructive">
            <KeyRound className="mr-2 h-5 w-5" /> Change Password
          </CardTitle>
          <CardDescription>Ensure your account uses a long, random password.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium">Current Password</label>
              <div className="relative">
                <Input
                  {...register('currentPassword')}
                  type={showCurrent ? "text" : "password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Input
                    {...register('newPassword')}
                    type={showNew ? "text" : "password"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  {...register('confirmPassword')}
                  type="password"
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-muted h-10 px-6 disabled:opacity-50 transition-colors"
              >
                {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-border bg-muted/30">
          <CardTitle>Active Sessions & 2FA</CardTitle>
          <CardDescription>Manage your device sessions and authentication methods.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-muted text-muted-foreground">Not Configured</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Current Session</p>
                <p className="text-xs text-muted-foreground">Windows • Chrome • IP: 192.168.1.1</p>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Now</span>
          </div>

          <div className="pt-2">
            <button
              onClick={handleLogoutAll}
              className="text-sm text-destructive hover:underline font-medium"
            >
              Log out of all other devices
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}