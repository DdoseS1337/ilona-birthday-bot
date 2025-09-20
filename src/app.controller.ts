import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { BirthdayBotService } from './birthday-bot.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly birthdayBotService: BirthdayBotService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('countdown')
  async getCountdown() {
    const countdown = this.birthdayBotService.calculateCountdown();
    return {
      days: countdown.days,
      hours: countdown.hours,
      minutes: countdown.minutes,
      isBirthday: countdown.isBirthday,
      message: this.birthdayBotService.formatCountdownMessage(countdown)
    };
  }

  @Post('send-countdown')
  async sendCountdown() {
    await this.birthdayBotService.checkAndSendCountdown();
    return { message: 'Countdown message sent!' };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('chat-id')
  getChatId() {
    const chatId = this.birthdayBotService.getCurrentChatId();
    return { 
      chatId: chatId,
      hasChatId: !!chatId,
      message: chatId ? `Bot is configured for chat: ${chatId}` : 'No chat ID configured. Add bot to a channel/group to auto-detect.'
    };
  }

  @Post('set-chat-id')
  setChatId(@Body() body: { chatId: string }) {
    this.birthdayBotService.setChatId(body.chatId);
    return { message: `Chat ID set to: ${body.chatId}` };
  }
}
