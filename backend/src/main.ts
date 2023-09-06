import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import { urlencoded, json } from 'express';
import helmet from 'helmet';

let httpsOptions = null;

async function bootstrap() {
  const keyP = readFileSync(String(process.env.HTTPS_KEY));
  const certP = readFileSync(String(process.env.HTTPS_CERT));
  httpsOptions = {
    key: keyP,
    cert: certP,
  }
  const app = await NestFactory.create(AppModule, { httpsOptions });
  //dev mod strict transport disabled for dev mod, enable it on production with a domain name to disable warning
  app.use(helmet({
    strictTransportSecurity: false
  }));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  await app.listen(3000);
}
bootstrap();
