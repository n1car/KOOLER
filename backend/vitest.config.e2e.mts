import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // La app exige JWT_SECRET desde el entorno: en pruebas se usa un valor propio.
    env: {
      JWT_SECRET: 'e2e_test_only_secret_value_0123456789',
      DB_HOST: 'localhost',
      DB_PORT: '5433',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_DATABASE: 'kooler_db',
    },
  },
});
