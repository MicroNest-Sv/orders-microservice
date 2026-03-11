import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { appConfig } from '@src/config';
import { PrismaService } from '@src/common/services';

import { PRODUCTS_SERVICE } from './constants';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [OrdersController],
  imports: [
    ClientsModule.registerAsync([
      {
        name: PRODUCTS_SERVICE,
        inject: [appConfig.KEY],
        useFactory: (config: ConfigType<typeof appConfig>) => ({
          transport: Transport.TCP,
          options: {
            host: config.productsServiceHost,
            port: config.productsServicePort,
          },
        }),
      },
    ]),
  ],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule {}
