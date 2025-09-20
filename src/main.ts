import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BirthdayBotService } from './birthday-bot.service';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get the birthday bot service to ensure it initializes
  const birthdayBotService = app.get(BirthdayBotService);
  
  // Graceful shutdown
  process.once('SIGINT', () => {
    console.log('Shutting down gracefully...');
    app.close();
  });
  
  process.once('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    app.close();
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('Birthday Bot is running! 🎂');
}
bootstrap();
