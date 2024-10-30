declare const module: any;
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtGuard } from './auth/guards/jwt-guard';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { UniqueConstraintExceptionFilter } from 'utils/unique-violation.filter';
import { corsConfig, validatorConfig } from './config/app-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors(corsConfig);
  app.use(cookieParser());
  app.useGlobalGuards(new JwtGuard(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe(validatorConfig));
  app.useGlobalFilters(new UniqueConstraintExceptionFilter());
  await app.listen(3000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
