import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = parseInt(process.env.NEST_APPLICATION_PORT || '4444');

  const appModule = await AppModule.register();
  const app = await NestFactory.create(appModule);

  app.enableCors();
  await app.listen(port);
}
bootstrap();
