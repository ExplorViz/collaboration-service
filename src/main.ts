import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logPerformance } from './performance-logger';

async function bootstrap() {
  logPerformance();
  const port = parseInt(process.env.NEST_APPLICATION_PORT || '4444');
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
}
bootstrap();
