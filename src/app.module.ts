import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OrdersModule } from './orders';
import { appConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
    }),
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
