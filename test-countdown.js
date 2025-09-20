#!/usr/bin/env node

// Test script for the new countdown logic
const dotenv = require('dotenv');
dotenv.config();

console.log('🧪 Testing New Countdown Logic');
console.log('===============================');

// Simulate the new countdown calculation
function calculateCountdown(birthdayDate, currentDate) {
  const timeDiff = birthdayDate.getTime() - currentDate.getTime();
  
  // Calculate days, hours, and minutes correctly
  const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
  const remainingHours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
  const remainingMinutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
  
  // If we're on the same day but before 00:01, it's still the birthday day
  const isSameDay = currentDate.getDate() === birthdayDate.getDate() && 
                   currentDate.getMonth() === birthdayDate.getMonth() && 
                   currentDate.getFullYear() === birthdayDate.getFullYear();
  const isBirthday = isSameDay && (currentDate.getHours() >= 0 && currentDate.getMinutes() >= 1);

  return {
    days: totalDays,
    isBirthday: isBirthday,
    hours: remainingHours,
    minutes: remainingMinutes,
  };
}

// Test different scenarios
const birthdayName = process.env.BIRTHDAY_NAME || 'Ilona';
const [month, day] = (process.env.BIRTHDAY_DATE || '11-2').split('-').map(Number);
const currentYear = new Date().getFullYear();

// Test scenarios
const testScenarios = [
  {
    name: '3 days before',
    date: new Date(currentYear, month - 1, day - 3, 12, 0, 0)
  },
  {
    name: '1 day before (23 hours)',
    date: new Date(currentYear, month - 1, day - 1, 1, 0, 0)
  },
  {
    name: '12 hours before',
    date: new Date(currentYear, month - 1, day - 1, 12, 0, 0)
  },
  {
    name: '2 hours before',
    date: new Date(currentYear, month - 1, day - 1, 22, 0, 0)
  },
  {
    name: '1 hour before',
    date: new Date(currentYear, month - 1, day - 1, 23, 0, 0)
  },
  {
    name: '30 minutes before',
    date: new Date(currentYear, month - 1, day - 1, 23, 30, 0)
  },
  {
    name: '5 minutes before',
    date: new Date(currentYear, month - 1, day - 1, 23, 55, 0)
  },
  {
    name: '1 minute before',
    date: new Date(currentYear, month - 1, day - 1, 23, 59, 0)
  },
  {
    name: 'Birthday (00:01)',
    date: new Date(currentYear, month - 1, day, 0, 1, 0)
  },
  {
    name: 'Birthday (00:00)',
    date: new Date(currentYear, month - 1, day, 0, 0, 0)
  },
  {
    name: 'Birthday (12:00)',
    date: new Date(currentYear, month - 1, day, 12, 0, 0)
  }
];

// Create birthday date
const birthdayDate = new Date(currentYear, month - 1, day, 0, 1, 0);

console.log(`Birthday: ${birthdayDate.toLocaleDateString()} at 00:01`);
console.log(`Birthday Name: ${birthdayName}`);
console.log('');

testScenarios.forEach(scenario => {
  const countdown = calculateCountdown(birthdayDate, scenario.date);
  
  console.log(`📅 ${scenario.name}:`);
  console.log(`   Date: ${scenario.date.toLocaleString()}`);
  console.log(`   Days: ${countdown.days}, Hours: ${countdown.hours}, Minutes: ${countdown.minutes}`);
  
  // Format message based on new logic
  let message;
  if (countdown.isBirthday) {
    message = `🎉🎂 С ДНЕМ РОЖДЕНИЯ, ${birthdayName}! 🎂🎉`;
  } else if (countdown.days === 0) {
    if (countdown.hours > 1) {
      message = `⏰ Только ${countdown.hours} часов до дня рождения ${birthdayName}! 🎂`;
    } else if (countdown.hours === 1) {
      message = `🔥 ПОСЛЕДНИЙ ЧАС! Через 1 час день рождения ${birthdayName}! 🎂🎉`;
    } else if (countdown.minutes > 1) {
      message = `⚡ Только ${countdown.minutes} минут до дня рождения ${birthdayName}! 🎂`;
    } else if (countdown.minutes === 1) {
      message = `🚀 ПОСЛЕДНЯЯ МИНУТА! Через 1 минуту день рождения ${birthdayName}! 🎂🎉`;
    } else {
      message = `🎉🎂 С ДНЕМ РОЖДЕНИЯ, ${birthdayName}! 🎂🎉`;
    }
  } else {
    message = `🎉 Only ${countdown.days} days until ${birthdayName}'s birthday!`;
  }
  
  console.log(`   Message: ${message}`);
  console.log('');
});

console.log('✅ Countdown logic test completed!');
