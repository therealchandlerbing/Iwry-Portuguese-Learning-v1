import React, { useState, useMemo } from 'react';
import { LogIn, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateEmail } from '../utils/validation';

interface LoginPageProps {
  onLogin: (token: string, user: { id: number; email: string; name: string }) => void;
  onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation states for blur handling
  const [touchedFields, setTouchedFields] = useState<{
    email: boolean;
    password: boolean;
  }>({ email: false, password: false });

  // Computed validation
  const emailError = useMemo(() => touchedFields.email ? validateEmail(email) : null, [email, touchedFields.email]);
  const passwordError = useMemo(() => {
    if (!touchedFields.password) return null;
    return !password ? 'Please enter your password' : null;
  }, [password, touchedFields.password]);

  // Form validity check
  const isFormValid = useMemo(() => {
    return !validateEmail(email) && password.length > 0;
  }, [email, password]);

  const handleBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched
    setTouchedFields({ email: true, password: true });

    if (!isFormValid) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 z-[9998] animate-in fade-in duration-500">
      <a
        href="#login-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to login form
      </a>
      <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-emerald-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Entre para continuar sua jornada
          </p>
        </div>

        <form id="login-form" onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
          {/* Email Field */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  emailError ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="seu@email.com"
                aria-required="true"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'login-email-error' : undefined}
              />
            </div>
            {emailError && (
              <p id="login-email-error" role="alert" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden="true" />
                {emailError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full pl-10 pr-12 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  passwordError ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Sua senha"
                aria-required="true"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
            {passwordError && (
              <p id="login-password-error" role="alert" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden="true" />
                {passwordError}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 rounded-xl flex items-start gap-2" role="alert">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            aria-disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Ainda não tem uma conta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>

      <p className="mt-8 text-slate-400 text-xs font-medium">
        Iwry - Personal Brazilian Portuguese Companion
      </p>
    </div>
  );
};

export default LoginPage;
