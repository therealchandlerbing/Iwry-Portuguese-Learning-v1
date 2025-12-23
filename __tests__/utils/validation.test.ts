import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from '../../utils/validation';

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });

  it('returns null for valid email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBeNull();
  });

  it('returns error for invalid email format', () => {
    expect(validateEmail('invalid')).toBe('Por favor, insira um endereço de email válido');
  });

  it('returns error for email without domain', () => {
    expect(validateEmail('test@')).toBe('Por favor, insira um endereço de email válido');
  });

  it('returns error for email without @', () => {
    expect(validateEmail('testexample.com')).toBe('Por favor, insira um endereço de email válido');
  });

  it('returns error for empty email', () => {
    expect(validateEmail('')).toBe('Email é obrigatório');
  });
});

describe('validatePassword', () => {
  it('returns strong for valid password with all requirements', () => {
    const result = validatePassword('SecurePass1');
    expect(result.isValid).toBe(true);
    expect(result.strength).toBe('strong');
    expect(result.strengthLabel).toBe('forte');
    expect(result.errors).toHaveLength(0);
  });

  it('returns medium for password missing one requirement', () => {
    const result = validatePassword('securepass1'); // missing uppercase
    expect(result.isValid).toBe(false);
    expect(result.strength).toBe('medium');
    expect(result.strengthLabel).toBe('média');
    expect(result.errors).toHaveLength(1);
  });

  it('returns weak for password missing multiple requirements', () => {
    const result = validatePassword('pass'); // short, no uppercase, no number
    expect(result.isValid).toBe(false);
    expect(result.strength).toBe('weak');
    expect(result.strengthLabel).toBe('fraca');
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it('returns weak for empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.strength).toBe('weak');
  });

  it('includes correct requirements in response', () => {
    const result = validatePassword('Test1234');
    expect(result.requirements).toHaveLength(3);
    expect(result.requirements.every((r) => r.met)).toBe(true);
  });

  it('marks unmet requirements correctly', () => {
    const result = validatePassword('test');
    const unmetRequirements = result.requirements.filter((r) => !r.met);
    expect(unmetRequirements.length).toBeGreaterThan(0);
  });
});

describe('validateName', () => {
  it('returns null for valid name', () => {
    expect(validateName('John')).toBeNull();
  });

  it('returns null for name with 2 characters', () => {
    expect(validateName('Jo')).toBeNull();
  });

  it('returns null for longer names', () => {
    expect(validateName('João da Silva')).toBeNull();
  });

  it('returns error for empty name', () => {
    expect(validateName('')).toBe('Nome é obrigatório');
  });

  it('returns error for name too short', () => {
    expect(validateName('J')).toBe('Nome deve ter pelo menos 2 caracteres');
  });
});

describe('validateConfirmPassword', () => {
  it('returns null when passwords match', () => {
    expect(validateConfirmPassword('SecurePass1', 'SecurePass1')).toBeNull();
  });

  it('returns error for empty confirm password', () => {
    expect(validateConfirmPassword('SecurePass1', '')).toBe(
      'Por favor, confirme sua senha'
    );
  });

  it('returns error when passwords do not match', () => {
    expect(validateConfirmPassword('SecurePass1', 'DifferentPass')).toBe(
      'As senhas não coincidem'
    );
  });

  it('returns error for case mismatch', () => {
    expect(validateConfirmPassword('SecurePass1', 'securepass1')).toBe(
      'As senhas não coincidem'
    );
  });
});
