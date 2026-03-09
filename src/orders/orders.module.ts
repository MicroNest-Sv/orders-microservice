import { Module } from '@nestjs/common';

import { PrismaService } from '@src/common/services';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule {}
