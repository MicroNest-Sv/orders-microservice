import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { appConfig } from '@src/config';

import { PrismaClient } from '@src/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(appConfig.KEY)
    appConfigValues: ConfigType<typeof appConfig>,
  ) {
    const adapter = new PrismaPg({
      connectionString: appConfigValues.databaseUrl,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
