import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.port,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) =>
          Object.values(error.constraints ?? {}).join(', '),
        );
        return new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: messages,
        });
      },
    }),
  );

  await app.listen();

  Logger.log(
    `Orders Microservice running on port: ${envs.port}`,
    'NestMicroservice',
  );
}
bootstrap();
