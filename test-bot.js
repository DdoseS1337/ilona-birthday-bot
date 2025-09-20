#!/usr/bin/env node

// Simple test to verify the bot configuration
const dotenv = require('dotenv');
dotenv.config();

console.log('🧪 Testing Bot Configuration');
console.log('============================');

// Check required environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const birthdayName = process.env.BIRTHDAY_NAME || 'Ilona';
const birthdayDate = process.env.BIRTHDAY_DATE || '11-2';

console.log(`Bot Token: ${botToken ? '✅ Set' : '❌ Missing'}`);
console.log(`Birthday Name: ${birthdayName}`);
console.log(`Birthday Date: ${birthdayDate}`);

// Test message formatting
const dailyMessages = process.env.DAILY_MESSAGES ? 
  process.env.DAILY_MESSAGES.split('|') : 
  [
    "🎉 Only {days} days until {name}'s birthday!",
    '⏰ {days} days left until the big day!',
    '🎂 The countdown continues: {days} days to go!',
  ];

console.log(`Daily Messages: ${dailyMessages.length} configured`);

// Test a sample message
const testCountdown = { days: 5, isBirthday: false };
const randomMessage = dailyMessages[0];
const testMessage = randomMessage
  .replace('{days}', testCountdown.days.toString())
  .replace('{name}', birthdayName);

console.log(`Test Message: "${testMessage}"`);
console.log(`Message Length: ${testMessage.length}`);
console.log(`Is Empty: ${testMessage.trim() === ''}`);

if (testMessage.trim() === '') {
  console.log('❌ ERROR: Message is empty!');
  process.exit(1);
} else {
  console.log('✅ Message formatting works correctly');
}

console.log('\n🎉 Bot configuration test completed successfully!');
