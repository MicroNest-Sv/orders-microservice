import { registerAs } from '@nestjs/config';
import z from 'zod';

import { EnvValidationError } from '@src/common/exceptions';

const appEnvSchema = z.object({
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().nonempty(),
  PRODUCTS_SERVICE_HOST: z.string().nonempty(),
  PRODUCTS_SERVICE_PORT: z.coerce.number().default(3001),
});

type AppEnv = z.infer<typeof appEnvSchema>;

export interface AppConfig {
  port: number;
  databaseUrl: string;
  productsServiceHost: string;
  productsServicePort: number;
}

export default registerAs('app', (): AppConfig => {
  const parsed = appEnvSchema.safeParse(process.env);

  if (!parsed.success) throw new EnvValidationError(parsed.error.issues);

  const env: AppEnv = parsed.data;

  return {
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    productsServiceHost: env.PRODUCTS_SERVICE_HOST,
    productsServicePort: env.PRODUCTS_SERVICE_PORT,
  };
});
