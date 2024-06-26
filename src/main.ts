import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CronService } from './cron/cron.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(3002);
  console.log(`App is running on: 3002`);

  const cronService = app.get(CronService);
  await cronService.initiateCron();
}
bootstrap();
