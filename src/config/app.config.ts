import { registerAs } from '@nestjs/config';
import z from 'zod';

import { EnvValidationError } from '@src/common/exceptions';

const appEnvSchema = z.object({
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().nonempty(),
});

type AppEnv = z.infer<typeof appEnvSchema>;

export interface AppConfig {
  port: number;
  databaseUrl: string;
}

export default registerAs('app', (): AppConfig => {
  const parsed = appEnvSchema.safeParse(process.env);

  if (!parsed.success) throw new EnvValidationError(parsed.error.issues);

  const env: AppEnv = parsed.data;

  return {
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
  };
});
