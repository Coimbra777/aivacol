import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./swagger";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // CORS para o console (frontend React + Vite). Origens configuráveis por env.
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((value) => value.trim())
      : true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

void bootstrap();
