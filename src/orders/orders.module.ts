import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { appConfig, NATS_SERVICE } from '@src/config';
import { PrismaService } from '@src/common/services';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  imports: [
    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        inject: [appConfig.KEY],
        useFactory: (config: ConfigType<typeof appConfig>) => ({
          transport: Transport.NATS,
          options: {
            servers: config.natsServers,
          },
        }),
      },
    ]),
  ],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule {}
