#!/usr/bin/env node

// Simple debug script to test message formatting
const dotenv = require('dotenv');
dotenv.config();

// Simulate the message formatting logic
const birthdayConfig = {
  name: process.env.BIRTHDAY_NAME || 'Ilona',
  birthday: process.env.BIRTHDAY_DATE || '11-2',
  dailyMessages: process.env.DAILY_MESSAGES ? process.env.DAILY_MESSAGES.split('|') : [
    "🎉 Only {days} days until {name}'s birthday!",
    '⏰ {days} days left until the big day!',
    '🎂 The countdown continues: {days} days to go!',
    "🎈 {days} more days until {name}'s special day!",
    '🎊 Time is flying! Only {days} days left!',
  ],
  birthdayMessage: process.env.BIRTHDAY_MESSAGE || '🎉🎂 HAPPY BIRTHDAY {name}! 🎂🎉',
};

console.log('🔍 Debug Message Formatting');
console.log('==========================');
console.log(`Name: ${birthdayConfig.name}`);
console.log(`Birthday: ${birthdayConfig.birthday}`);
console.log(`Daily messages count: ${birthdayConfig.dailyMessages.length}`);
console.log(`Birthday message: ${birthdayConfig.birthdayMessage}`);
console.log('');

// Test countdown calculation
const now = new Date();
const currentYear = now.getFullYear();
const [month, day] = birthdayConfig.birthday.split('-').map(Number);

let birthdayDate = new Date(currentYear, month - 1, day);
if (birthdayDate < now) {
  birthdayDate = new Date(currentYear + 1, month - 1, day);
}

const timeDiff = birthdayDate.getTime() - now.getTime();
const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

console.log(`Current date: ${now.toISOString()}`);
console.log(`Next birthday: ${birthdayDate.toISOString()}`);
console.log(`Days until birthday: ${days}`);
console.log('');

// Test message formatting
const countdown = { days, isBirthday: days === 0 };

if (countdown.isBirthday) {
  const message = birthdayConfig.birthdayMessage.replace('{name}', birthdayConfig.name);
  console.log(`Birthday message: "${message}"`);
} else {
  const randomMessage = birthdayConfig.dailyMessages[Math.floor(Math.random() * birthdayConfig.dailyMessages.length)];
  console.log(`Selected message template: "${randomMessage}"`);
  
  const formattedMessage = randomMessage
    .replace('{days}', countdown.days.toString())
    .replace('{name}', birthdayConfig.name);
  
  console.log(`Formatted message: "${formattedMessage}"`);
  console.log(`Message length: ${formattedMessage.length}`);
  console.log(`Message is empty: ${formattedMessage.trim() === ''}`);
}
