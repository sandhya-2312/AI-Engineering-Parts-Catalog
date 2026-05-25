import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { useAuth, isApiError } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Unable to sign in. Check your credentials.';
      const isAdminEmail = email.trim().toLowerCase() === 'admin@engineerx.com';
      setError(
        isAdminEmail && message.toLowerCase().includes('invalid')
          ? `${message} If this is the default admin, restart the API with ADMIN_RESET_PASSWORD_ON_BOOT=true, then use the password from your API .env (ADMIN_TEMP_PASSWORD).`
          : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:flex flex-col justify-center space-y-6 p-8">
            <div className="space-y-4">
              <AppLogo className="h-20" />

              <div className="space-y-3 pt-6">
                <h2 className="text-4xl tracking-tight text-foreground">Industrial Engineering Excellence</h2>
                <p className="text-lg text-muted-foreground">
                  Access thousands of precision-engineered components with advanced 3D visualization and AR integration
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                {['🔩', '⚙️', '🔧'].map((icon, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-card border border-border p-6 flex items-center justify-center text-5xl backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-105">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl p-8 space-y-6">
              <div className="lg:hidden flex justify-center pb-4">
                <AppLogo className="h-14" />
              </div>

              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-2xl tracking-tight">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to access your engineering workspace
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {error}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use the password from your administrator, or the temporary password if this is
                      your first sign-in.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder=""
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-input bg-input-background text-primary focus:ring-2 focus:ring-ring"
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Remember me
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in…' : 'Sign In'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Need access?{' '}
                  <span className="text-primary">Contact your administrator</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
