/**
 * Validación de variables de entorno al arrancar.
 *
 * Regla de negocio: la aplicación no debe iniciar con configuración incompleta
 * ni con el secreto de ejemplo. Es preferible fallar al bootear que atender
 * peticiones con valores por defecto silenciosos.
 */

export const REQUIRED_ENV_VARIABLES = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
] as const;

/** Valores de ejemplo que nunca deben llegar a un ambiente real. */
export const FORBIDDEN_JWT_SECRETS = [
  'change_me_use_a_long_random_value',
  'kooler_jwt_super_secret_key_2026',
];

const MIN_JWT_SECRET_LENGTH = 32;
const NUMERIC_PATTERN = /^\d+$/;

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

/**
 * Se ejecuta dentro de `ConfigModule.forRoot({ validate })`, por lo que recibe
 * la unión de `process.env` y el archivo `.env`.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];

  const missing = REQUIRED_ENV_VARIABLES.filter((key) => isBlank(config[key]));
  if (missing.length > 0) {
    errors.push(`Faltan variables obligatorias: ${missing.join(', ')}`);
  }

  const jwtSecret = config.JWT_SECRET;
  if (!isBlank(jwtSecret) && typeof jwtSecret === 'string') {
    const secret = jwtSecret.trim();
    if (secret.length < MIN_JWT_SECRET_LENGTH) {
      errors.push(
        `JWT_SECRET debe tener al menos ${MIN_JWT_SECRET_LENGTH} caracteres`,
      );
    }
    if (FORBIDDEN_JWT_SECRETS.includes(secret)) {
      errors.push('JWT_SECRET no puede usar un valor de ejemplo');
    }
  }

  if (!isBlank(config.DB_PORT) && !NUMERIC_PATTERN.test(String(config.DB_PORT).trim())) {
    errors.push('DB_PORT debe ser numérico');
  }

  if (!isBlank(config.PORT) && !NUMERIC_PATTERN.test(String(config.PORT).trim())) {
    errors.push('PORT debe ser numérico');
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuración de entorno inválida:\n- ${errors.join('\n- ')}\n` +
        'Revise su archivo .env (o las variables del proveedor de despliegue).',
    );
  }

  return config;
}
