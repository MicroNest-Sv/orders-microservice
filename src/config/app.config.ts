import { registerAs } from '@nestjs/config';
import z from 'zod';

import { EnvValidationError } from '@src/common/exceptions';

const appEnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
});

type AppEnv = z.infer<typeof appEnvSchema>;

export interface AppConfig {
  port: number;
}

export default registerAs('app', (): AppConfig => {
  const parsed = appEnvSchema.safeParse(process.env);

  if (!parsed.success) throw new EnvValidationError(parsed.error.issues);

  const env: AppEnv = parsed.data;

  return {
    port: env.PORT,
  };
});
