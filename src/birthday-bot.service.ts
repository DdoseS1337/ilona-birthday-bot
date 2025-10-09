import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import * as cron from 'node-cron';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';

export interface BirthdayConfig {
  name: string;
  birthday: string; // Format: MM-DD
  chatId?: string; // Made optional since we'll auto-detect
  dailyMessages: string[];
  birthdayMessage: string;
  birthdayGifUrl?: string;
  timezone?: string;
  // New message types for different preparation periods
  twoWeeksMessages: string[]; // Messages for 2 weeks before birthday
  oneWeekMessages: string[]; // Messages for 1 week before birthday
  // Channel information
  channelId?: string; // Channel ID for sending messages
  channelUsername?: string; // Channel username (e.g., @mychannel)
  channelTitle?: string; // Channel title for display
}

@Injectable()
export class BirthdayBotService implements OnModuleInit {
  private readonly logger = new Logger(BirthdayBotService.name);
  private bot: Telegraf;
  private birthdayConfig: BirthdayConfig;

  private timezone: string;
  constructor(private configService: ConfigService) {
    this.bot = new Telegraf(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN')!,
    );
    this.timezone = this.configService.get<string>('TIMEZONE', 'Europe/Kyiv');

    this.setupBirthdayConfig();
  }

  onModuleInit() {
    this.setupBot();
    this.scheduleDailyMessages();
  }
  private uaPlural(n: number, one: string, few: string, many: string) {
    const n10 = n % 10,
      n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one; // 1 день
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few; // 2-4 дні
    return many; // 5+ днів
  }

  daysWord = (n: number) => this.uaPlural(n, 'день', 'дні', 'днів');
  hoursWord = (n: number) => this.uaPlural(n, 'година', 'години', 'годин');
  minutesWord = (n: number) => this.uaPlural(n, 'хвилина', 'хвилини', 'хвилин');

  private setupBirthdayConfig() {
    const dailyMessagesEnv = this.configService.get<string>(
      'DAILY_MESSAGES',
      '',
    );
    const dailyMessages = dailyMessagesEnv
      ? dailyMessagesEnv.split('|')
      : [
          '🏢 У 12-поверховому будинку є ліфт. На першому поверсі живе всього 2 людей, від поверху до поверху кількість мешканців збільшується вдвічі. На якому поверсі частіше натискають кнопку виклику ліфта?',
          '🔗 Ковалю принесли п’ять ланцюгів, по три кільця в кожному, і доручили з’єднати їх в один ланцюг. Він вирішив розкрити чотири кільця й знову їх закувати. Чи можна зробити це, розкривши менше кілець?',
          '🐺 Це відоме завдання про селянина, вовка, козла й капусту. Як перевезти всіх через ріку човном, що вміщує лише одного пасажира?',
          '🛶 Три аматори водного спорту мають один човен і тримають його на ланцюгу з трьома замками. У кожного лише один ключ, але кожен може взяти човен самостійно. Як це можливо?',
          '🦆 Від чого качка пливе?',
          '☔ Чоловік потрапив під зливу, але не одна волосина на голові не промокла. Чому?',
          '👒 Що трапиться з білою панамою, якщо її опустити на дно озера на 3 хвилини 20 секунд?',
          '👨‍👩‍👦 У сімох братів по сестрі. Скільки всього сестер?',
          '🎯 Що кидають тоді, коли це необхідно, і піднімають тоді, коли це вже не потрібно?',
          '🌊 Якою хворобою ніхто не хворіє на суші?',
          '👶 Що людина носить два рази в житті безкоштовно, а за третій раз платить?',
          '👁️ Воно завжди перед нами, але бачити його ми не можемо. Що це?',
          '🕊️ В якій клітці не тримають ні птахів, ні звірів?',
          '🪡 Яка голка не тоне в морі?',
          '👨‍⚕️ У трьох лікарів був брат Сашко, а в Сашка братів не було. Як таке можливо?',
          '🌧️ Коли небо буває нижчим за землю?',
          '⏰ Який годинник показує правильний час лише двічі на добу?',
          '🚦 Що треба робити, коли бачиш зеленого чоловічка?',
          '🔥 Жувати не жую, а все поїдаю, все тільки їм, а з голоду помираю.',
          '💧 Не п’є — живе, а нап’ється — умре.',
          '🤫 Не видно її і не чути її, а коли заговориш про неї, то вона зразу зникає.',
          '🌫️ Простелилось простирадло на весь світ — не дістане і не зложить весь мій рід.',
          '🌾 Рівненька дорожка, посилана горошком.',
          '🐑 Вівці день і ніч пасуться, а молока не дають.',
        ];
    // Messages for 2 weeks before birthday (gift preparation phase)
    const twoWeeksMessages = [
      '🎁 {days} {daysWord} до дня народження {name}! Час почати думати про подаруночки! 💝',
      '🛍️ {days} {daysWord} — ідеальний час для пошуку особливого подарунка для {name}! ✨',
      '💝 {days} {daysWord} до свята {name}. Можливо, варто зазирнути в магазини? 🛒',
      '🎯 {days} {daysWord} до дня народження {name}! Пора складати список подарунків! 📝',
      '🛒 {days} {daysWord} — час для шопінгу! Що б зробити {name} приємно? 🤔',
      '💎 {days} {daysWord} до свята {name}. Час шукати щось особливе! ✨',
      '🎨 {days} {daysWord} до дня народження {name}! Можливо, створити щось власноруч? 🖌️',
    ];

    // Messages for 1 week before birthday (urgent preparation phase)
    const oneWeekMessages = [
      '🚨 {days} {daysWord} до дня народження {name}! Хто ще не встиг купити подарунок — час діяти! ⏰',
      '⚡ {days} {daysWord} — останній тиждень! Подарунки треба купувати зараз! 🛍️',
      '🔥 {days} {daysWord} до свята {name}! Останній шанс для ідеального подарунка! 💝',
      '⏰ {days} {daysWord} — терміново! Подарунки, привітання, все треба готувати! 🎁',
      '🚀 {days} {daysWord} до дня народження {name}! Останній тиждень підготовки! 💪',
      '💥 {days} {daysWord} — фінальний спурт! Всі подарунки мають бути готові! 🎯',
      '⚡ {days} {daysWord} до свята {name}! Час дій — залишився лише тиждень! 🎊',
    ];

    this.birthdayConfig = {
      name: this.configService.get<string>('BIRTHDAY_NAME', 'Ілони'),
      birthday: this.configService.get<string>('BIRTHDAY_DATE', '11-2'),
      chatId: this.configService.get<string>('TELEGRAM_CHAT_ID'),
      dailyMessages: dailyMessages,
      birthdayMessage: this.configService.get<string>(
        'BIRTHDAY_MESSAGE',
        '🎉🎂 Сьогодні день народження {name}! Вітаємо! Бажаємо радості, сил і яскравих подій! ✨',
      ),
      birthdayGifUrl: this.configService.get<string>('BIRTHDAY_GIF_URL'),
      timezone: this.configService.get<string>('TIMEZONE', 'Europe/Kyiv'),
      twoWeeksMessages: twoWeeksMessages,
      oneWeekMessages: oneWeekMessages,
      // Channel configuration
      channelId: this.configService.get<string>('TELEGRAM_CHANNEL_ID'),
      channelUsername: this.configService.get<string>(
        'TELEGRAM_CHANNEL_USERNAME',
      ),
      channelTitle: this.configService.get<string>('TELEGRAM_CHANNEL_TITLE'),
    };

    // Debug logging
    this.logger.log('Birthday config loaded:');
    this.logger.log(`- Name: ${this.birthdayConfig.name}`);
    this.logger.log(`- Birthday: ${this.birthdayConfig.birthday}`);
    this.logger.log(
      `- Daily messages count: ${this.birthdayConfig.dailyMessages.length}`,
    );
    this.logger.log(
      `- Birthday message: ${this.birthdayConfig.birthdayMessage.substring(0, 50)}...`,
    );
    this.logger.log(`- Chat ID: ${this.birthdayConfig.chatId || 'Not set'}`);
    this.logger.log(
      `- Channel ID: ${this.birthdayConfig.channelId || 'Not set'}`,
    );
    this.logger.log(
      `- Channel Title: ${this.birthdayConfig.channelTitle || 'Not set'}`,
    );
    this.logger.log(
      `- Channel Username: ${this.birthdayConfig.channelUsername || 'Not set'}`,
    );
  }

  private setupBot() {
    // Handle /start command
    this.bot.start((ctx) => {
      this.handleNewChat(ctx);
      const welcomeMessage = `Привіт, леді! 👋✨\n\n🎂 Ласкаво просимо до бота підрахунку днів до дня народження ${this.birthdayConfig.name}! 🎂\n\nЯ буду надсилати тобі щоденні повідомлення з підрахунком до великого дня! 💫`;
      if (welcomeMessage.trim()) {
        ctx.reply(welcomeMessage);
      }
    });

    // Handle new chat members (when bot is added to a group/channel)
    this.bot.on('new_chat_members', (ctx) => {
      const botInfo = ctx.botInfo;
      const newMembers = ctx.message.new_chat_members;
      this.logger.log(`New chat members: ${newMembers}`);
      // Check if the bot itself was added
      const botAdded = newMembers.some((member) => member.id === botInfo.id);
      if (botAdded) {
        this.handleNewChat(ctx);
        const message = `Привіт, леді! 👋✨\n\n🎂 Я бот підрахунку днів до дня народження ${this.birthdayConfig.name}! 🎂\n\nЯ буду надсилати щоденні повідомлення з підрахунком до великого дня! Використовуй /countdown щоб перевірити поточний підрахунок. 💫`;
        if (message.trim()) {
          ctx.reply(message);
        }
      }
    });

    // Handle when bot is added to a channel
    this.bot.on('channel_post', (ctx) => {
      if (
        ctx.channelPost &&
        'new_chat_members' in ctx.channelPost &&
        ctx.channelPost.new_chat_members
      ) {
        const botInfo = ctx.botInfo;
        const newMembers = ctx.channelPost.new_chat_members;

        const botAdded = newMembers.some((member) => member.id === botInfo.id);
        if (botAdded) {
          this.handleNewChat(ctx);
          const message = `Привіт, леді! 👋✨\n\n🎂 Я бот підрахунку днів до дня народження ${this.birthdayConfig.name}! 🎂\n\nЯ буду надсилати щоденні повідомлення з підрахунком до великого дня! Використовуй /countdown щоб перевірити поточний підрахунок. 💫`;
          if (message.trim()) {
            ctx.reply(message);
          }
        }
      }
    });

    this.bot.command('countdown', (ctx) => {
      // Auto-detect and set chat/channel information when user uses countdown command
      this.handleNewChat(ctx);

      const countdown = this.calculateCountdown();
      const message = this.formatCountdownMessage(countdown);
      if (message.trim()) {
        ctx.reply(message);
      }
    });

    this.bot.command('help', (ctx) => {
      // Auto-detect and set chat/channel information when user uses help command
      this.handleNewChat(ctx);

      const message = `Привіт, леді! 👋✨\n\nДоступні команди:\n/start - Запустити бота\n/countdown - Перевірити поточний підрахунок\n/status - Показати статус конфігурації\n/help - Показати це повідомлення допомоги\n\nГарного дня! 💫`;
      if (message.trim()) {
        ctx.reply(message);
      }
    });

    // Command to check current configuration
    this.bot.command('status', (ctx) => {
      // Auto-detect and set chat/channel information when user uses status command
      this.handleNewChat(ctx);

      const chatInfo = this.birthdayConfig.chatId
        ? `✅ Chat ID: ${this.birthdayConfig.chatId}`
        : '❌ Chat ID: Not set';
      const channelInfo = this.birthdayConfig.channelId
        ? `✅ Channel: ${this.birthdayConfig.channelTitle || 'Unknown'} (${this.birthdayConfig.channelId})`
        : '❌ Channel: Not set';
      const channelUsername = this.birthdayConfig.channelUsername
        ? `Username: ${this.birthdayConfig.channelUsername}`
        : 'Username: Not set';

      const message = `📊 **Статус конфігурації бота:**\n\n${chatInfo}\n${channelInfo}\n${channelUsername}\n\n🎂 Birthday: ${this.birthdayConfig.name} (${this.birthdayConfig.birthday})\n⏰ Timezone: ${this.birthdayConfig.timezone}`;

      ctx.reply(message);
    });

    // Handle any text message to auto-detect chat/channel
    this.bot.on('text', (ctx) => {
      // Only auto-detect if no chat/channel is configured yet
      if (!this.birthdayConfig.chatId && !this.birthdayConfig.channelId) {
        this.handleNewChat(ctx);
      }
    });

    this.bot.launch();
    this.logger.log('Birthday bot started successfully!');
  }

  private handleNewChat(ctx: any) {
    const chatId = ctx.chat?.id?.toString();
    const chatType = ctx.chat?.type;
    const chatTitle = ctx.chat?.title;
    const chatUsername = ctx.chat?.username;

    if (chatId) {
      let chatInfoUpdated = false;
      let channelInfoUpdated = false;

      // Store chat information (always update if not set)
      if (!this.birthdayConfig.chatId) {
        this.birthdayConfig.chatId = chatId;
        this.logger.log(`Auto-detected chat ID: ${chatId}`);
        chatInfoUpdated = true;
      }

      // If it's a channel, store channel information (always update for channels)
      if (chatType === 'channel') {
        const wasChannelSet = !!this.birthdayConfig.channelId;
        this.birthdayConfig.channelId = chatId;
        this.birthdayConfig.channelTitle = chatTitle;
        this.birthdayConfig.channelUsername = chatUsername
          ? `@${chatUsername}`
          : undefined;

        if (!wasChannelSet) {
          this.logger.log(`Auto-detected channel: ${chatTitle} (${chatId})`);
          if (chatUsername) {
            this.logger.log(`Channel username: @${chatUsername}`);
          }
          channelInfoUpdated = true;
        } else {
          this.logger.log(`Updated channel info: ${chatTitle} (${chatId})`);
          channelInfoUpdated = true;
        }
      }

      // Only send welcome message for new chats or when explicitly called
      // This prevents spam when using /countdown or /help commands
      const shouldSendWelcome = chatInfoUpdated || channelInfoUpdated;

      if (shouldSendWelcome) {
        // Send a welcome message with current countdown
        setTimeout(async () => {
          try {
            const countdown = this.calculateCountdown();
            const message = this.formatCountdownMessage(countdown);

            // Validate message is not empty
            if (message && message.trim() !== '') {
              await ctx.reply(
                `Привіт, леді! 👋✨\n\n📅 Поточний підрахунок:\n\n${message}`,
              );
            } else {
              await ctx.reply(
                `Привіт, леді! 👋✨\n\n📅 Поточний підрахунок:\n\n🎉 Тільки ${countdown.days} днів до дня народження ${this.birthdayConfig.name}! 🎂`,
              );
            }
          } catch (error) {
            this.logger.error('Error sending welcome countdown:', error);
          }
        }, 1000);
      }
    }
  }

  calculateCountdown(): {
    days: number;
    isBirthday: boolean;
    hours: number;
    minutes: number;
  } {
    const tz = this.birthdayConfig.timezone || 'Europe/Kyiv';
    const now = DateTime.now().setZone(tz);

    // Очікуємо BIRTHDAY_DATE у форматі "MM-DD" (з лідир. нулем: "11-02")
    const [mmStr, ddStr] = this.birthdayConfig.birthday.split('-');
    const month = Number(mmStr);
    const day = Number(ddStr);

    // Ціль — 00:01 у TZ Києва
    let target = DateTime.fromObject(
      { year: now.year, month, day, hour: 0, minute: 1 },
      { zone: tz },
    );

    // Якщо вже минуло — наступний рік (врахуємо 29 лютого)
    if (target < now) {
      const nextYear = now.year + 1;
      const tryNext = DateTime.fromObject(
        { year: nextYear, month, day, hour: 0, minute: 1 },
        { zone: tz },
      );
      // Якщо дата невалідна (наприклад 02-29 у невисокосний) — прокинь на 28 лютого
      target = tryNext.isValid
        ? tryNext
        : DateTime.fromObject(
            { year: nextYear, month: 2, day: 28, hour: 0, minute: 1 },
            { zone: tz },
          );
    }

    const diff = target.diff(now, ['days', 'hours', 'minutes']).toObject();
    const totalMinutes = Math.max(
      0,
      Math.floor(target.diff(now, 'minutes').minutes || 0),
    );
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const isBirthday =
      now.year === target.year &&
      now.hasSame(target, 'day') &&
      now.hasSame(target, 'month');

    return { days, isBirthday, hours, minutes };
  }

  formatCountdownMessage(countdown: {
    days: number;
    isBirthday: boolean;
    hours: number;
    minutes: number;
  }): string {
    this.logger.debug(
      `Formatting countdown message: days=${countdown.days}, hours=${countdown.hours}, minutes=${countdown.minutes}, isBirthday=${countdown.isBirthday}`,
    );

    if (countdown.isBirthday) {
      const message = this.birthdayConfig.birthdayMessage.replace(
        '{name}',
        this.birthdayConfig.name,
      );
      this.logger.debug(`Birthday message: "${message}"`);
      return (
        message ||
        `Привіт, леді! 👋✨\n\n🎉🎂 З ДНЕМ НАРОДЖЕННЯ, ${this.birthdayConfig.name}! 🎂🎉\n\nБажаю тобі безмежного щастя, здоров'я та усмішок! Нехай цей день буде сповнений радості та чудових моментів! 💫✨`
      );
    }

    // If less than 1 day remaining, show hours
    if (countdown.days === 0) {
      if (countdown.hours > 1) {
        return `⏰ Лишилось ${countdown.hours} ${this.hoursWord(countdown.hours)} до дня народження ${this.birthdayConfig.name}!`;
      } else if (countdown.hours === 1) {
        return `🔥 Остання година! За 1 годину святкуємо ${this.birthdayConfig.name}!`;
      } else if (countdown.minutes > 1) {
        return `⚡ Лишилось ${countdown.minutes} ${this.minutesWord(countdown.minutes)} до старту свята ${this.birthdayConfig.name}!`;
      } else if (countdown.minutes === 1) {
        return `🚀 Остання хвилина — готуємось вітати ${this.birthdayConfig.name}!`;
      }
      return this.birthdayConfig.birthdayMessage.replace(
        '{name}',
        this.birthdayConfig.name,
      );
    }

    // Choose message type based on days remaining
    let messagePool: string[] = [];
    let messageType = '';

    // if (countdown.days <= 3) {
    //   // 3 days or less - only regular daily messages
    //   messagePool = this.birthdayConfig.dailyMessages;
    //   messageType = 'daily';
    // } else if (countdown.days <= 7) {
    //   // 4-7 days - randomly choose between urgent and regular messages (50/50 chance)
    //   const useUrgentMessages = Math.random() < 0.5;
    //   messagePool = useUrgentMessages
    //     ? this.birthdayConfig.oneWeekMessages
    //     : this.birthdayConfig.dailyMessages;
    //   messageType = useUrgentMessages ? 'oneWeek' : 'daily';
    // } else if (countdown.days <= 14) {
    //   // 2 weeks or less - gift preparation messages
    //   // Randomly choose between gift messages and regular messages (50/50 chance)
    //   const useGiftMessages = Math.random() < 0.5;
    //   messagePool = useGiftMessages
    //     ? this.birthdayConfig.twoWeeksMessages
    //     : this.birthdayConfig.dailyMessages;
    //   messageType = useGiftMessages ? 'twoWeeks' : 'daily';
    // } else {
    //   // More than 2 weeks - regular daily messages

    // }
    messagePool = this.birthdayConfig.dailyMessages;
    messageType = 'daily';

    // Ensure we have messages
    if (!messagePool || messagePool.length === 0) {
      this.logger.warn(`No ${messageType} messages configured, using fallback`);
      return `Привіт, леді! 👋✨\n\n🎉 Тільки ${countdown.days} днів до дня народження ${this.birthdayConfig.name}! 🎂\n\nНе можу дочекатися свята! 💫`;
    }

    const randomMessage =
      messagePool[Math.floor(Math.random() * messagePool.length)];

    this.logger.debug(`Selected ${messageType} message: "${randomMessage}"`);

    // Format message with parameters
    let formattedMessage = randomMessage;

    // Replace parameters if they exist in the message
    if (formattedMessage.includes('{days}')) {
      formattedMessage = formattedMessage.replace(
        '{days}',
        countdown.days.toString(),
      );
    }
    if (formattedMessage.includes('{daysWord}')) {
      formattedMessage = formattedMessage.replace(
        '{daysWord}',
        this.daysWord(countdown.days),
      );
    }
    if (formattedMessage.includes('{name}')) {
      formattedMessage = formattedMessage.replace(
        '{name}',
        this.birthdayConfig.name,
      );
    }

    // Add countdown info to messages that don't have parameters
    if (
      !formattedMessage.includes('{days}') &&
      !formattedMessage.includes('{daysWord}')
    ) {
      formattedMessage = `📅 ${countdown.days} ${this.daysWord(countdown.days)} до дня народження ${this.birthdayConfig.name}! 🎂\n\n${formattedMessage}`;
    }

    this.logger.debug(`Formatted message: "${formattedMessage}"`);

    // Ensure we don't return an empty message
    return (
      formattedMessage ||
      `Привіт, леді! 👋✨\n\n🎉 Тільки ${countdown.days} днів до дня народження ${this.birthdayConfig.name}! 🎂\n\nНе можу дочекатися свята! 💫`
    );
  }

  private scheduleDailyMessages() {
    // Schedule daily message at 12 PM (noon) using Luxon timezone
    const timezone = this.birthdayConfig.timezone || 'Europe/Kyiv';

    cron.schedule(
      '0 12 * * *',
      async () => {
        try {
          const countdown = this.calculateCountdown();

          if (countdown.isBirthday) {
            await this.sendBirthdayMessage();
          } else {
            await this.sendDailyCountdown(countdown);
          }
        } catch (error) {
          this.logger.error('Error sending scheduled message:', error);
        }
      },
      {
        timezone: timezone,
      },
    );

    // Schedule a cron job to run every minute
    cron.schedule(
      '* * * * *',
      async () => {
        this.logger.debug(
          `Opa Ping | Chat ID: ${this.birthdayConfig.chatId || 'N/A'} | Channel ID: ${this.birthdayConfig.channelId || 'N/A'} | Name: ${this.birthdayConfig.name || 'N/A'} | Birthday: ${this.birthdayConfig.birthday || 'N/A'}`,
        );
      },
      {
        timezone: timezone,
      },
    );

    // Schedule birthday message at exactly 00:01
    cron.schedule(
      '1 0 * * *', // 00:01 every day
      async () => {
        try {
          const countdown = this.calculateCountdown();

          if (countdown.isBirthday) {
            await this.sendBirthdayMessage();
          }
        } catch (error) {
          this.logger.error('Error sending birthday message at 00:01:', error);
        }
      },
      {
        timezone: timezone,
      },
    );

    this.logger.log('Message scheduling set up successfully!');
  }

  // Helper method to create timezone-aware cron expressions using Luxon
  private createTimezoneAwareSchedule(
    cronExpression: string,
    callback: () => Promise<void>,
  ) {
    const timezone = this.birthdayConfig.timezone || 'Europe/Kyiv';

    return cron.schedule(cronExpression, callback, {
      timezone: timezone,
    });
  }

  // Method to schedule a message at a specific DateTime
  private scheduleAtDateTime(
    dateTime: DateTime,
    callback: () => Promise<void>,
  ) {
    const now = DateTime.now().setZone(
      this.birthdayConfig.timezone || 'Europe/Kyiv',
    );
    const delay = dateTime.diff(now).milliseconds;

    if (delay > 0) {
      setTimeout(async () => {
        try {
          await callback();
        } catch (error) {
          this.logger.error('Error in scheduled DateTime callback:', error);
        }
      }, delay);

      this.logger.log(`Scheduled message for ${dateTime.toISO()}`);
    } else {
      this.logger.warn(
        `Scheduled time ${dateTime.toISO()} is in the past, skipping`,
      );
    }
  }

  // Method to reschedule all messages based on current timezone
  private rescheduleMessages() {
    const timezone = this.birthdayConfig.timezone || 'Europe/Kyiv';
    const now = DateTime.now().setZone(timezone);

    this.logger.log(`Rescheduling messages for timezone: ${timezone}`);
    this.logger.log(`Current time: ${now.toISO()}`);

    // This could be used to dynamically reschedule based on timezone changes
    // For now, we'll keep the existing cron approach but with better timezone handling
  }

  private async sendDailyCountdown(countdown: {
    days: number;
    isBirthday: boolean;
    hours: number;
    minutes: number;
  }) {
    const message = this.formatCountdownMessage(countdown);

    // Validate message is not empty
    if (!message || message.trim() === '') {
      this.logger.error('Message is empty, skipping send');
      return;
    }

    try {
      await this.sendMessageToChannel(message);
      this.logger.log(`Daily countdown sent: ${countdown.days} days remaining`);
    } catch (error) {
      this.logger.error('Error sending daily countdown:', error);
    }
  }

  private async sendHourlyCountdown(countdown: {
    days: number;
    isBirthday: boolean;
    hours: number;
    minutes: number;
  }) {
    const message = this.formatCountdownMessage(countdown);

    // Validate message is not empty
    if (!message || message.trim() === '') {
      this.logger.error('Message is empty, skipping send');
      return;
    }

    try {
      await this.sendMessageToChannel(message);
      this.logger.log(
        `Hourly countdown sent: ${countdown.hours} hours remaining`,
      );
    } catch (error) {
      this.logger.error('Error sending hourly countdown:', error);
    }
  }

  private async sendBirthdayMessage() {
    try {
      // Prepare birthday message
      const birthdayMessage =
        this.birthdayConfig.birthdayMessage.replace(
          '{name}',
          this.birthdayConfig.name,
        ) || `🎉🎂 HAPPY BIRTHDAY ${this.birthdayConfig.name}! 🎂🎉`;

      // Validate message is not empty
      if (!birthdayMessage || birthdayMessage.trim() === '') {
        this.logger.error('Birthday message is empty, skipping send');
        return;
      }

      // Send birthday message
      await this.sendMessageToChannel(birthdayMessage);

      // Send birthday GIF if configured
      if (this.birthdayConfig.birthdayGifUrl) {
        await this.sendAnimationToChannel(this.birthdayConfig.birthdayGifUrl);
      }

      this.logger.log('Birthday message sent successfully!');
    } catch (error) {
      this.logger.error('Error sending birthday message:', error);
    }
  }

  // Method to send message to channel (preferred) or chat
  private async sendMessageToChannel(message: string) {
    const targetId =
      this.birthdayConfig.channelId || this.birthdayConfig.chatId;

    if (!targetId) {
      this.logger.warn(
        'No channel ID or chat ID configured. Cannot send message.',
      );
      return;
    }

    try {
      await this.bot.telegram.sendMessage(targetId, message);
      const channelInfo =
        this.birthdayConfig.channelTitle ||
        this.birthdayConfig.channelUsername ||
        'channel';
      this.logger.log(`Message sent to ${channelInfo} (${targetId})`);
    } catch (error) {
      this.logger.error(`Error sending message to ${targetId}:`, error);
      throw error;
    }
  }

  // Method to send animation to channel (preferred) or chat
  private async sendAnimationToChannel(animationUrl: string) {
    const targetId =
      this.birthdayConfig.channelId || this.birthdayConfig.chatId;

    if (!targetId) {
      this.logger.warn(
        'No channel ID or chat ID configured. Cannot send animation.',
      );
      return;
    }

    try {
      await this.bot.telegram.sendAnimation(targetId, animationUrl);
      const channelInfo =
        this.birthdayConfig.channelTitle ||
        this.birthdayConfig.channelUsername ||
        'channel';
      this.logger.log(`Animation sent to ${channelInfo} (${targetId})`);
    } catch (error) {
      this.logger.error(`Error sending animation to ${targetId}:`, error);
      throw error;
    }
  }

  // Method to manually trigger countdown check
  async checkAndSendCountdown() {
    const countdown = this.calculateCountdown();

    if (this.birthdayConfig.channelId || this.birthdayConfig.chatId) {
      if (countdown.isBirthday) {
        await this.sendBirthdayMessage();
      } else if (countdown.days === 0 && countdown.hours <= 24) {
        await this.sendHourlyCountdown(countdown);
      } else {
        await this.sendDailyCountdown(countdown);
      }
    } else {
      this.logger.warn(
        'No channel ID or chat ID configured. Cannot send countdown message.',
      );
    }
  }

  // Method to update birthday configuration
  updateBirthdayConfig(newConfig: Partial<BirthdayConfig>) {
    this.birthdayConfig = { ...this.birthdayConfig, ...newConfig };
    this.logger.log('Birthday configuration updated');
  }

  // Method to get current chat ID
  getCurrentChatId(): string | undefined {
    return this.birthdayConfig.chatId;
  }

  // Method to set chat ID manually
  setChatId(chatId: string) {
    this.birthdayConfig.chatId = chatId;
    this.logger.log(`Chat ID set to: ${chatId}`);
  }

  // Method to get current channel information
  getCurrentChannelInfo(): { id?: string; title?: string; username?: string } {
    return {
      id: this.birthdayConfig.channelId,
      title: this.birthdayConfig.channelTitle,
      username: this.birthdayConfig.channelUsername,
    };
  }

  // Method to set channel information manually
  setChannelInfo(
    channelId: string,
    channelTitle?: string,
    channelUsername?: string,
  ) {
    this.birthdayConfig.channelId = channelId;
    this.birthdayConfig.channelTitle = channelTitle;
    this.birthdayConfig.channelUsername = channelUsername;
    this.logger.log(
      `Channel info set: ${channelTitle || 'Unknown'} (${channelId})`,
    );
    if (channelUsername) {
      this.logger.log(`Channel username: ${channelUsername}`);
    }
  }

  // Method to get the preferred target (channel first, then chat)
  getPreferredTarget(): string | undefined {
    return this.birthdayConfig.channelId || this.birthdayConfig.chatId;
  }
}
