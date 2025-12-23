import React, { useState, useMemo } from 'react';
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from '../utils/validation';

interface RegisterPageProps {
  onRegister: (token: string, user: { id: number; email: string; name: string }) => void;
  onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation states for blur handling
  const [touchedFields, setTouchedFields] = useState<{
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({ name: false, email: false, password: false, confirmPassword: false });

  // Computed validation
  const nameError = useMemo(() => touchedFields.name ? validateName(name) : null, [name, touchedFields.name]);
  const emailError = useMemo(() => touchedFields.email ? validateEmail(email) : null, [email, touchedFields.email]);
  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const confirmPasswordError = useMemo(
    () => touchedFields.confirmPassword ? validateConfirmPassword(password, confirmPassword) : null,
    [password, confirmPassword, touchedFields.confirmPassword]
  );

  // Form validity check
  const isFormValid = useMemo(() => {
    return !validateName(name) &&
           !validateEmail(email) &&
           passwordValidation.isValid &&
           !validateConfirmPassword(password, confirmPassword);
  }, [name, email, password, confirmPassword, passwordValidation.isValid]);

  const handleBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'strong': return 'text-emerald-600';
      case 'medium': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched to show any remaining errors
    setTouchedFields({ name: true, email: true, password: true, confirmPassword: true });

    if (!isFormValid) {
      setError('Por favor, corrija os erros acima antes de enviar');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha no registro');
      }

      onRegister(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Falha no registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 z-[9998] animate-in fade-in duration-500 overflow-auto">
      <a
        href="#register-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Pular para formulário de registro
      </a>
      <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 my-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-emerald-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Criar conta</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Comece sua jornada com Iwry
          </p>
        </div>

        <form id="register-form" onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de registro">
          {/* Name Field */}
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nome
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  nameError ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Seu nome"
                aria-required="true"
                aria-invalid={!!nameError}
                aria-describedby={nameError ? 'name-error' : undefined}
              />
            </div>
            {nameError && (
              <p id="name-error" role="alert" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden="true" />
                {nameError}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                id="register-email"
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
                aria-describedby={emailError ? 'email-error' : undefined}
              />
            </div>
            {emailError && (
              <p id="email-error" role="alert" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden="true" />
                {emailError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Crie uma senha"
                aria-required="true"
                aria-describedby="password-requirements"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2" id="password-requirements" aria-live="polite">
                <div className="flex gap-1 mb-1" role="presentation">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordValidation.strength === 'strong' ? 'bg-emerald-500' :
                        passwordValidation.strength === 'medium' && i <= 2 ? 'bg-yellow-500' :
                        passwordValidation.strength === 'weak' && i <= 1 ? 'bg-red-500' :
                        'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Força da senha: <span className={`font-semibold ${getStrengthColor(passwordValidation.strength)}`}>{passwordValidation.strengthLabel}</span>
                </p>

                {/* Requirements Checklist */}
                <ul className="mt-2 space-y-1" aria-label="Requisitos da senha">
                  {passwordValidation.requirements.map((req, i) => (
                    <li key={i} className={`text-xs flex items-center gap-1.5 ${
                      req.met ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {req.met ? <Check size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />}
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirmar senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  confirmPasswordError ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Confirme sua senha"
                aria-required="true"
                aria-invalid={!!confirmPasswordError}
                aria-describedby={confirmPasswordError ? 'confirm-password-error' : undefined}
              />
            </div>
            {confirmPasswordError && (
              <p id="confirm-password-error" role="alert" className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden="true" />
                {confirmPasswordError}
              </p>
            )}
            {/* Show match indicator when passwords match */}
            {confirmPassword && !confirmPasswordError && password === confirmPassword && (
              <p className="text-emerald-600 text-xs mt-1.5 flex items-center gap-1">
                <Check size={12} aria-hidden="true" />
                Senhas coincidem
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
                Criando conta...
              </>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>

      <p className="mt-4 text-slate-400 text-xs font-medium">
        Iwry - Personal Brazilian Portuguese Companion
      </p>
    </div>
  );
};

export default RegisterPage;
