import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation.js';

const validEnv = {
  JWT_SECRET: 'un_secreto_suficientemente_largo_1234567890',
  DB_HOST: 'localhost',
  DB_PORT: '5433',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_DATABASE: 'kooler_db',
  PORT: '3000',
};

describe('validateEnv', () => {
  // PORT es opcional, pero las variables de conexión y el secreto JWT no.
  it('acepta una configuración completa y válida', () => {
    expect(validateEnv({ ...validEnv })).toMatchObject(validEnv);
  });

  it('rechaza cuando falta una variable obligatoria', () => {
    const { DB_HOST: _omit, ...sinHost } = validEnv;
    expect(() => validateEnv(sinHost)).toThrow(/DB_HOST/);
  });

  it('rechaza un JWT_SECRET demasiado corto', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: 'corto' })).toThrow(
      /al menos 32 caracteres/,
    );
  });

  it('rechaza los secretos de ejemplo', () => {
    expect(() =>
      validateEnv({
        ...validEnv,
        JWT_SECRET: 'kooler_jwt_super_secret_key_2026',
      }),
    ).toThrow(/valor de ejemplo/);
  });

  it('rechaza un DB_PORT no numérico', () => {
    expect(() => validateEnv({ ...validEnv, DB_PORT: 'abc' })).toThrow(
      /DB_PORT debe ser numérico/,
    );
  });

  it('rechaza un PORT no numérico', () => {
    expect(() => validateEnv({ ...validEnv, PORT: 'tres mil' })).toThrow(
      /PORT debe ser numérico/,
    );
  });

  it('permite omitir PORT porque el framework usa un valor por defecto', () => {
    const { PORT: _omit, ...sinPort } = validEnv;
    expect(() => validateEnv(sinPort)).not.toThrow();
  });
});
