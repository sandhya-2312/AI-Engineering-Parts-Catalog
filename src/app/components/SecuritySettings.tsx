import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useAuth, isApiError } from '../context/AuthContext';
import { authApi } from '../lib/api/auth';

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

type SecuritySettingsProps = {
  onStatusMessage?: (message: string) => void;
};

export default function SecuritySettings({ onStatusMessage }: SecuritySettingsProps) {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const notify = (message: string) => {
    onStatusMessage?.(message);
  };

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      const result = await authApi.enableTwoFactor();
      notify(result.message);
    } catch (error) {
      notify(isApiError(error) ? error.message : 'Failed to enable two-factor authentication.');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleViewSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const sessions = await authApi.sessions();
      const summary = sessions
        .map(
          (session) =>
            `${session.isCurrent ? '[Current] ' : ''}${session.device} - ${session.lastActiveAt}`,
        )
        .join('\n');
      window.alert(summary || 'No active sessions found.');
    } catch (error) {
      notify(isApiError(error) ? error.message : 'Failed to load active sessions.');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password updated successfully.');
    } catch (error) {
      setPasswordError(isApiError(error) ? error.message : 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Card className="border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security
        </CardTitle>
        <CardDescription>Password and account security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={handleUpdatePassword}>
          <h4 className="text-sm font-medium">Change Password</h4>
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-sm text-emerald-600">{passwordSuccess}</p>
            )}
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>

        <Separator />

        <div className="divide-y divide-border">
          <SettingRow
            label="Two-factor authentication"
            description="Add an extra layer of security to your account"
          >
            <Button variant="outline" size="sm" onClick={handleEnable2FA} disabled={isEnabling2FA}>
              {isEnabling2FA ? 'Enabling...' : 'Enable 2FA'}
            </Button>
          </SettingRow>

          <SettingRow
            label="Active sessions"
            description="Manage devices signed into your account"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewSessions}
              disabled={isLoadingSessions}
            >
              {isLoadingSessions ? 'Loading...' : 'View Sessions'}
            </Button>
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  );
}
