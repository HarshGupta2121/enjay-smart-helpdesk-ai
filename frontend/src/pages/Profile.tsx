import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useProfile, useUpdateProfile, useChangePassword } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, User, Mail, Phone, Shield, Camera, KeyRound, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Profile() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [profileData, setProfileData] = useState({ fullName: '', phone: '', avatar: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  // Sync profile data once fetched
  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    }, {
      onSuccess: () => {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-1 h-96 w-full rounded-xl" />
          <Skeleton className="md:col-span-2 h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-card rounded-lg border border-border shadow-sm">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Failed to load Profile</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          We couldn't retrieve your profile data. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information and security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Identity Overview */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                  <AvatarImage src={profileData.avatar || profile.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-medium">
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground">{profile.fullName || 'Unknown User'}</h2>
              <p className="text-sm text-muted-foreground mb-4">{profile.email}</p>

              <div className="w-full flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{profile.role?.name || profile.role?.code || 'UNKNOWN'}</span>
              </div>

              <div className="w-full mt-6 text-left text-sm text-muted-foreground space-y-2 border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Joined:</span>
                  <span>{format(new Date(profile.createdAt), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="text-emerald-600 font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editable Forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Form */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact details and identity.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        required
                        value={profileData.fullName}
                        onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="pl-9"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address (Read-only)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={profile.email}
                        className="pl-9 bg-muted/50 text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={profileData.phone}
                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                        className="pl-9"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Avatar URL</label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={profileData.avatar}
                        onChange={e => setProfileData({ ...profileData, avatar: e.target.value })}
                        className="pl-9"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Form */}
          <Card className="shadow-sm border-destructive/20">
            <CardHeader className="border-b border-border bg-destructive/5 pb-4">
              <CardTitle className="flex items-center text-destructive">
                <KeyRound className="mr-2 h-5 w-5" /> Security
              </CardTitle>
              <CardDescription>Change your account password.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-5">

                {passwordError && (
                  <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" /> {passwordError}
                  </div>
                )}

                <div className="space-y-2 max-w-md">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    required
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input
                      required
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input
                      required
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-muted h-10 px-6 disabled:opacity-50"
                  >
                    {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}