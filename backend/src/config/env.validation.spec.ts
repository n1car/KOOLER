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

const validEnvWithUrl = {
  JWT_SECRET: 'un_secreto_suficientemente_largo_1234567890',
  DATABASE_URL: 'postgresql://user:pass@host/db?sslmode=require',
  PORT: '3000',
};

describe('validateEnv', () => {
  // PORT es opcional; JWT_SECRET y la conexión (DB_* o DATABASE_URL) no.
  it('acepta una configuración completa y válida', () => {
    expect(validateEnv({ ...validEnv })).toMatchObject(validEnv);
  });

  it('acepta DATABASE_URL sin las variables DB_*', () => {
    expect(validateEnv({ ...validEnvWithUrl })).toMatchObject(validEnvWithUrl);
  });

  it('rechaza DATABASE_URL con un esquema que no es PostgreSQL', () => {
    expect(() =>
      validateEnv({ ...validEnvWithUrl, DATABASE_URL: 'mysql://host/db' }),
    ).toThrow(/URL de PostgreSQL/);
  });

  it('rechaza DB_SSL con un valor distinto de true/false', () => {
    expect(() => validateEnv({ ...validEnv, DB_SSL: 'quizas' })).toThrow(
      /DB_SSL debe ser true o false/,
    );
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
