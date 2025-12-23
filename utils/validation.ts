// Form validation utilities for login and registration

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email é obrigatório';
  if (!emailRegex.test(email)) return 'Por favor, insira um endereço de email válido';
  return null;
};

export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  strengthLabel: string;
  errors: string[];
  requirements: {
    label: string;
    met: boolean;
  }[];
}

export const validatePassword = (password: string): PasswordValidation => {
  const requirements = [
    { label: 'Pelo menos 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Um número', met: /[0-9]/.test(password) },
  ];

  const errors: string[] = requirements
    .filter(req => !req.met)
    .map(req => req.label);

  const isValid = errors.length === 0;
  const strength: 'weak' | 'medium' | 'strong' =
    errors.length === 0 ? 'strong' :
    errors.length === 1 ? 'medium' :
    'weak';

  const strengthLabels = {
    weak: 'fraca',
    medium: 'média',
    strong: 'forte'
  };

  return { isValid, strength, strengthLabel: strengthLabels[strength], errors, requirements };
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Nome é obrigatório';
  if (name.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Por favor, confirme sua senha';
  if (password !== confirmPassword) return 'As senhas não coincidem';
  return null;
};
