#!/usr/bin/env node

// Test script for Luxon DateTime functionality
const { DateTime } = require('luxon');
const dotenv = require('dotenv');
dotenv.config();

console.log('🧪 Testing Luxon DateTime Functionality');
console.log('=====================================');

// Test different timezones
const timezones = ['Europe/Kyiv', 'UTC', 'America/New_York', 'Asia/Tokyo'];

timezones.forEach(tz => {
  console.log(`\n📍 Timezone: ${tz}`);
  console.log(`Current time: ${DateTime.now().setZone(tz).toISO()}`);
  console.log(`Local time: ${DateTime.now().setZone(tz).toLocaleString()}`);
});

// Test birthday calculation with different timezones
const birthdayDate = '09-21'; // September 21st
const [month, day] = birthdayDate.split('-').map(Number);

console.log(`\n🎂 Testing birthday calculation for ${birthdayDate}`);

timezones.forEach(tz => {
  const now = DateTime.now().setZone(tz);
  const currentYear = now.year;
  
  // Create birthday date for current year at 00:01 in the timezone
  let birthdayDateTime = DateTime.fromObject({
    year: currentYear,
    month: month,
    day: day,
    hour: 0,
    minute: 1,
    second: 0
  }, { zone: tz });

  // If birthday has passed this year, use next year
  if (birthdayDateTime < now) {
    birthdayDateTime = DateTime.fromObject({
      year: currentYear + 1,
      month: month,
      day: day,
      hour: 0,
      minute: 1,
      second: 0
    }, { zone: tz });
  }

  const diff = birthdayDateTime.diff(now, ['days', 'hours', 'minutes']);
  const totalMinutes = Math.max(0, Math.floor(birthdayDateTime.diff(now, 'minutes').minutes || 0));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const isBirthday = now.year === birthdayDateTime.year && 
                    now.hasSame(birthdayDateTime, 'day') && 
                    now.hasSame(birthdayDateTime, 'month');

  console.log(`  ${tz}:`);
  console.log(`    Days: ${days}, Hours: ${hours}, Minutes: ${minutes}`);
  console.log(`    Is Birthday: ${isBirthday}`);
  console.log(`    Birthday DateTime: ${birthdayDateTime.toISO()}`);
});

// Test cron scheduling with timezone
console.log(`\n⏰ Testing cron scheduling with timezone`);
const timezone = 'Europe/Kyiv';
const now = DateTime.now().setZone(timezone);

// Test different cron times
const cronTimes = [
  { name: '12:00 PM', hour: 12, minute: 0 },
  { name: '00:01 AM', hour: 0, minute: 1 },
  { name: '18:30 PM', hour: 18, minute: 30 }
];

cronTimes.forEach(({ name, hour, minute }) => {
  const scheduledTime = now.set({ hour, minute, second: 0, millisecond: 0 });
  if (scheduledTime <= now) {
    scheduledTime.plus({ days: 1 });
  }
  
  console.log(`  ${name} (${timezone}): ${scheduledTime.toISO()}`);
  console.log(`    Local time: ${scheduledTime.toLocaleString()}`);
});

console.log('\n✅ DateTime functionality test completed!');
