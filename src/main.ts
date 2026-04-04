import { NestFactory } from '@nestjs/core';
import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';

import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const appConfigValues = appConfig();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: appConfigValues.natsServers,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const extractMessages = (
          errors: import('class-validator').ValidationError[],
        ): string[] =>
          errors.flatMap((error) => [
            ...Object.values(error.constraints ?? {}),
            ...extractMessages(error.children ?? []),
          ]);

        return new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: extractMessages(errors),
        });
      },
    }),
  );

  await app.listen();

  logger.log(
    `Orders Microservice running on NATS servers: ${appConfigValues.natsServers.join(', ')}`,
  );
}

void bootstrap();
