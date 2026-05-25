import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth, isApiError, roleLabel } from '../context/AuthContext';
import { authApi } from '../lib/api/auth';
import { notifyProfileUpdated } from '../lib/profile';
import type { ApiUser } from '../lib/api/types';

function isRedundantJobTitle(jobTitle: string, role: ApiUser['role']) {
  const normalized = jobTitle.trim().toLowerCase();
  if (!normalized) return true;
  const duplicates = [
    roleLabel(role).toLowerCase(),
    role,
    'administrator',
    'admin',
    'engineer',
    'user',
    'viewer',
  ];
  return duplicates.includes(normalized);
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  showIcon = false,
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showIcon?: boolean;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {showIcon && (
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        )}
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={showIcon ? 'pl-10 pr-10' : 'pr-10'}
          placeholder=""
          autoComplete={id === 'current' ? 'current-password' : 'new-password'}
          required={required}
          minLength={id === 'current' ? undefined : 8}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ChangePasswordDialog() {
  const navigate = useNavigate();
  const { user, changePassword, logout, refreshProfile, syncSession } = useAuth();
  const errorRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const mustSetup = !!user?.mustChangePassword;

  useEffect(() => {
    if (!mustSetup || !user) {
      setProfileLoaded(false);
      return;
    }

    const applyProfile = (
      nextEmail: string,
      name: string,
      contact: string,
      title: string,
    ) => {
      setEmail(nextEmail);
      setFullName(name);
      setContactNo(contact);
      setJobTitle(isRedundantJobTitle(title, user.role) ? '' : title);
      setProfileLoaded(true);
    };

    authApi
      .getSettings()
      .then((data) => {
        applyProfile(
          data.profile.email.trim(),
          data.profile.name.trim(),
          data.profile.contactNo.trim(),
          data.profile.jobTitle.trim(),
        );
      })
      .catch(() => {
        applyProfile(
          user.email,
          user.fullName?.trim() || '',
          user.contactNo?.trim() || '',
          user.jobTitle?.trim() || '',
        );
      });
  }, [mustSetup, user?.id, user?.role, user?.email, user?.fullName, user?.contactNo, user?.jobTitle]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [error]);

  if (!mustSetup || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nextEmail = email.trim().toLowerCase();
    const name = fullName.trim();
    if (!isValidEmail(nextEmail)) {
      setError('Please enter a valid login email.');
      return;
    }
    if (!name) {
      setError('Please enter your full name.');
      return;
    }
    if (!currentPassword) {
      setError('Enter your current (temporary) password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Choose a new password with at least 8 characters to finish setup.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);

      const settings = await authApi.getSettings();
      const updated = await authApi.updateSettings({
        ...settings,
        profile: {
          ...settings.profile,
          email: nextEmail,
          name,
          contactNo: contactNo.trim(),
          jobTitle: jobTitle.trim(),
        },
      });

      syncSession({ accessToken: updated.accessToken, user: updated.user });
      notifyProfileUpdated();
      await refreshProfile();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to complete account setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-2xl">
        <div className="shrink-0 space-y-1 border-b border-border px-6 py-5">
          <h2 className="text-xl font-semibold tracking-tight">Complete your account setup</h2>
          <p className="text-sm text-muted-foreground">
            Set your login email and a new password (required), then save to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {!profileLoaded && (
              <p className="text-sm text-muted-foreground">Loading your profile…</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="setup-email">Login email</Label>
                <Input
                  id="setup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  disabled={!profileLoaded || isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  You will use this email to sign in next time.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setup-name">Full name</Label>
                <Input
                  id="setup-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  disabled={!profileLoaded || isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="setup-contact">Contact no</Label>
                <Input
                  id="setup-contact"
                  type="tel"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  placeholder="Phone or extension"
                  autoComplete="tel"
                  disabled={!profileLoaded || isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Access role</Label>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="secondary">{roleLabel(user.role)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Assigned by an administrator. You cannot change this here.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setup-job-title">Job title</Label>
                <Input
                  id="setup-job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Mechanical Engineer"
                  autoComplete="organization-title"
                  disabled={!profileLoaded || isSubmitting}
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Login password</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Required: enter your current password, then choose a new password (min. 8
                  characters). This screen will not go away until you save a new password.
                </p>
              </div>
              <PasswordField
                id="current"
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                showIcon
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  id="new"
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                />
                <PasswordField
                  id="confirm"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              </div>
            </div>

            {error && (
              <div
                ref={errorRef}
                className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-3 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !profileLoaded}
            >
              {isSubmitting ? 'Saving…' : 'Save and continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
