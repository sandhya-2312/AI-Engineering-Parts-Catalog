import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Eye, EyeOff, Layers, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--engineering-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--engineering-grid)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:flex flex-col justify-center space-y-6 p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20">
                  <Layers className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl tracking-tight text-foreground">EngineerX</h1>
                  <p className="text-sm text-muted-foreground">AI-Powered Parts Catalog</p>
                </div>
              </div>

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
              <div className="lg:hidden flex items-center gap-3 justify-center pb-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl tracking-tight">EngineerX</h1>
                  <p className="text-xs text-muted-foreground">AI Parts Catalog</p>
                </div>
              </div>

              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-2xl tracking-tight">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to access your engineering workspace
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="engineer@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
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
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Need access?{' '}
                  <button type="button" className="text-primary hover:underline">
                    Contact Administrator
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
