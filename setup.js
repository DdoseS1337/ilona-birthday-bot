#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎂 Ilona Birthday Bot Setup 🎂\n');

// Check if .env already exists
if (fs.existsSync('.env')) {
  console.log('⚠️  .env file already exists. Skipping setup.');
  process.exit(0);
}

// Copy env.example to .env
try {
  fs.copyFileSync('env.example', '.env');
  console.log('✅ Created .env file from env.example');
  console.log('\n📝 Next steps:');
  console.log('1. Edit .env file and add your TELEGRAM_BOT_TOKEN');
  console.log('2. Customize BIRTHDAY_NAME and BIRTHDAY_DATE');
  console.log('3. Run: pnpm run start:dev');
  console.log('\n🔍 Auto-detection:');
  console.log('- Add the bot to your channel/group');
  console.log('- The bot will automatically detect the chat ID');
  console.log('- No manual chat ID configuration needed!');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
