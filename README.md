# 🎂 Ilona Birthday Bot

Український Telegram бот, створений на NestJS та Telegraf, який веде підрахунок днів до дня народження та надсилає щоденні повідомлення з підрахунком. В день народження надсилає особливе привітання та опціонально GIF!

## ✨ Можливості

- 🎉 **Щоденні повідомлення з підрахунком**: Надсилає налаштовувані повідомлення з підрахунком щодня
- 🎂 **Святкування дня народження**: Особливе повідомлення та GIF в день народження
- ⚙️ **Повністю налаштовувано**: Налаштуй повідомлення, дату народження, часовий пояс та багато іншого
- 🤖 **Інтеграція з Telegram**: Створений на Telegraf для безшовної роботи з Telegram
- 📅 **Заплановані повідомлення**: Використовує node-cron для надійного щоденного планування
- 🌍 **Підтримка часових поясів**: Використовує Luxon DateTime для точного часу в різних часових поясах
- 🎨 **Випадкові повідомлення**: Обертає різні повідомлення з підрахунком для різноманітності
- 🔍 **Автовизначення**: Автоматично визначає ID чату при додаванні до каналів/груп
- 🚀 **Простий налаштування**: Не потрібна ручна конфігурація ID чату!
- 👋 **Грайливий стиль**: Всі повідомлення починаються з "Привіт, леді!" та написані в грайливому стилі

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- pnpm (or npm)
- A Telegram bot token (get one from [@BotFather](https://t.me/botfather))

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd ilona-birthday-bot
   pnpm install
   ```

2. **Create environment file:**
   ```bash
   # Option 1: Use the setup script
   pnpm run setup
   
   # Option 2: Manual copy
   cp env.example .env
   ```

3. **Configure your bot:**
   Edit `.env` file with your settings:
   ```env
   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here

   # Birthday Configuration
   BIRTHDAY_NAME=Ilona
   BIRTHDAY_DATE=12-25
   TIMEZONE=UTC

   # Custom Messages (separated by |)
   DAILY_MESSAGES=🎉 Only {days} days until {name}'s birthday!|⏰ {days} days left until the big day!|🎂 The countdown continues: {days} days to go!

   # Birthday Message
   BIRTHDAY_MESSAGE=🎉🎂 HAPPY BIRTHDAY {name}! 🎂🎉\n\nWishing you an amazing day filled with joy, laughter, and all your favorite things! 🎁✨

   # Optional: Birthday GIF URL
   BIRTHDAY_GIF_URL=https://media.giphy.com/media/your-gif-url-here.gif
   ```

### Getting Your Telegram Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the instructions
3. Copy the bot token to your `.env` file

### Getting Your Chat ID (Optional)

The bot can now automatically detect the chat ID when you add it to a channel or group! However, if you want to set it manually:

1. Add your bot to a group or start a private chat
2. Send a message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for the `chat.id` in the response

**Auto-detection**: Simply add the bot to your desired channel/group and it will automatically start sending messages there!

## 🔍 Auto-Detection Feature

The bot now automatically detects when it's added to a channel or group:

1. **Add the bot** to your desired channel/group
2. **Bot automatically detects** the chat ID
3. **Welcome message** is sent with current countdown
4. **Daily messages** start automatically at 12 PM

### How it works:
- When you add the bot to a channel/group, it detects the chat ID
- The bot sends a welcome message with the current countdown
- Daily scheduled messages will be sent to this chat automatically
- No manual configuration needed!

### Running the Bot

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

## 🎛️ Configuration Options

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token | Required | `123456789:ABCdefGHIjklMNOpqrsTUVwxyz` |
| `TELEGRAM_CHAT_ID` | Chat ID to send messages to | Optional (auto-detected) | `-1001234567890` |
| `BIRTHDAY_NAME` | Name of the birthday person | `Ilona` | `John` |
| `BIRTHDAY_DATE` | Birthday date (MM-DD format) | `12-25` | `03-15` |
| `TIMEZONE` | Timezone for scheduling | `Europe/Kyiv` | `America/New_York` |
| `DAILY_MESSAGES` | Custom countdown messages (separated by \|) | Default messages | `Message 1\|Message 2` |
| `BIRTHDAY_MESSAGE` | Special birthday message | Default message | `Happy Birthday {name}!` |
| `BIRTHDAY_GIF_URL` | Optional GIF URL for birthday | None | `https://giphy.com/gif/...` |

### Message Templates

Use these placeholders in your messages:
- `{name}` - Replaced with the birthday person's name
- `{days}` - Replaced with the number of days remaining

## 🎮 Bot Commands

- `/start` - Welcome message and bot introduction
- `/countdown` - Check current countdown status
- `/help` - Show available commands

## 🌐 API Endpoints

The bot also provides HTTP endpoints for monitoring:

- `GET /` - Basic health check
- `GET /countdown` - Get current countdown information
- `POST /send-countdown` - Manually trigger countdown message
- `GET /health` - Detailed health status
- `GET /chat-id` - Check current chat ID status
- `POST /set-chat-id` - Manually set chat ID

## 📅 Scheduling

- **Daily Messages**: Sent at 12:00 PM (noon) in the configured timezone
- **Hourly Messages**: When less than 24 hours remain, messages sent every hour
- **10-Minute Messages**: In the last hour, messages sent every 10 minutes
- **Birthday Message**: Sent at exactly 00:01 on the birthday date
- **Timezone Support**: Configure any timezone using standard timezone names

### 🎯 Smart Countdown Logic:
- **Days > 1**: Daily messages at 12 PM
- **Last 24 hours**: Hourly countdown messages
- **Last hour**: Every 10 minutes with special messages
- **00:01**: Exact birthday celebration message

### ⏰ DateTime Features:
- **Luxon Integration**: Uses Luxon DateTime for precise timezone handling
- **Timezone Support**: All calculations respect the configured timezone
- **Accurate Scheduling**: Cron jobs run in the correct timezone
- **Flexible Scheduling**: Can schedule messages at specific DateTime instances

## 🛠️ Development

### Project Structure

```
src/
├── birthday-bot.service.ts # Main bot service
├── app.controller.ts      # HTTP endpoints
├── app.module.ts         # Main app module
├── app.service.ts        # App service
└── main.ts              # Application entry point
```

### Available Scripts

```bash
# Development
pnpm run start:dev

# Build
pnpm run build

# Production
pnpm run start:prod

# Linting
pnpm run lint

# Testing
pnpm run test
pnpm run test:e2e
```

## 🎨 Customization Examples

### Custom Daily Messages
```env
DAILY_MESSAGES=🎉 Only {days} days until {name}'s birthday!|⏰ {days} days left until the big day!|🎂 The countdown continues: {days} days to go!|🎈 {days} more days until {name}'s special day!|🎊 Time is flying! Only {days} days left!
```

### Custom Birthday Message
```env
BIRTHDAY_MESSAGE=🎉🎂 HAPPY BIRTHDAY {name}! 🎂🎉\n\nWishing you an amazing day filled with joy, laughter, and all your favorite things! 🎁✨
```

### Different Timezone
```env
TIMEZONE=America/New_York
```

## 🚀 Deployment

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Build the project
pnpm run build

# Start with PM2
pm2 start dist/main.js --name "birthday-bot"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎂 Happy Birthday!

Enjoy your automated birthday countdown bot! 🎉