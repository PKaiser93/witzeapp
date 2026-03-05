import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ❌ GLOBAL PIPE AUS!
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3000);
  console.log('🚀 Backend http://localhost:3000');
}
bootstrap();
