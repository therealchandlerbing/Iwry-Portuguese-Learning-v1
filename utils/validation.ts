// Form validation utilities for login and registration

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
  requirements: {
    label: string;
    met: boolean;
  }[];
}

export const validatePassword = (password: string): PasswordValidation => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const errors: string[] = requirements
    .filter(req => !req.met)
    .map(req => req.label);

  const isValid = errors.length === 0;
  const strength: 'weak' | 'medium' | 'strong' =
    errors.length === 0 ? 'strong' :
    errors.length === 1 ? 'medium' :
    'weak';

  return { isValid, strength, errors, requirements };
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};
