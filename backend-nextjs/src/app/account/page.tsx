'use client';

import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setUserProfile(data.profile);
          setProfileForm({
            full_name: data.profile.full_name || '',
            phone: data.profile.phone || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserProfile(data.profile);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Personal Information Card */}
      <div className="border border-border bg-background">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-light">Personal Information</h2>
          <p className="text-sm text-muted-foreground mt-1">Update your personal details</p>
        </div>
        <form onSubmit={handleProfileUpdate} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-light text-muted-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-light text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                value={userProfile?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-border bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-light text-muted-foreground">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="border border-border bg-background">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-light">Change Password</h2>
          <p className="text-sm text-muted-foreground mt-1">Ensure your account is using a strong password</p>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6">
          <div className="max-w-xl space-y-5 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-light text-muted-foreground">
                Current Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-light text-muted-foreground">
                New Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                placeholder="Enter new password (min. 6 characters)"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-light text-muted-foreground">
                Confirm New Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                placeholder="Re-enter new password"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
