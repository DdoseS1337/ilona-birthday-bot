#!/usr/bin/env node

// Test script specifically for September 21st
console.log('🧪 Testing September 21st Countdown');
console.log('===================================');

// Set birthday to September 21st
const birthdayDate = new Date(2024, 8, 21, 0, 1, 0); // September 21st, 2024 at 00:01
const birthdayName = 'Ilona';

console.log(`Birthday: ${birthdayDate.toLocaleDateString()} at 00:01`);
console.log('');

// Test different current dates
const testDates = [
  {
    name: 'Today (September 20th, 22:00)',
    date: new Date(2024, 8, 20, 22, 0, 0)
  },
  {
    name: 'Today (September 20th, 23:30)',
    date: new Date(2024, 8, 20, 23, 30, 0)
  },
  {
    name: 'Today (September 20th, 23:59)',
    date: new Date(2024, 8, 20, 23, 59, 0)
  },
  {
    name: 'Birthday (September 21st, 00:00)',
    date: new Date(2024, 8, 21, 0, 0, 0)
  },
  {
    name: 'Birthday (September 21st, 00:01)',
    date: new Date(2024, 8, 21, 0, 1, 0)
  },
  {
    name: 'Birthday (September 21st, 12:00)',
    date: new Date(2024, 8, 21, 12, 0, 0)
  }
];

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

testDates.forEach(scenario => {
  const countdown = calculateCountdown(birthdayDate, scenario.date);
  
  console.log(`📅 ${scenario.name}:`);
  console.log(`   Date: ${scenario.date.toLocaleString()}`);
  console.log(`   Days: ${countdown.days}, Hours: ${countdown.hours}, Minutes: ${countdown.minutes}`);
  console.log(`   Is Birthday: ${countdown.isBirthday}`);
  
  // Format message based on new logic
  let message;
  if (countdown.isBirthday) {
    message = `Привіт, леді! 👋✨\n\n🎉🎂 З ДНЕМ НАРОДЖЕННЯ, ${birthdayName}! 🎂🎉\n\nБажаю тобі безмежного щастя! 💫✨`;
  } else if (countdown.days === 0) {
    if (countdown.hours > 1) {
      message = `Привіт, леді! 👋✨\n\n⏰ Тільки ${countdown.hours} годин до дня народження ${birthdayName}! 🎂\n\nПідготуйся до свята! 💫`;
    } else if (countdown.hours === 1) {
      message = `Привіт, леді! 👋✨\n\n🔥 ОСТАННІЙ ГОДИННИК! Через 1 годину день народження ${birthdayName}! 🎂🎉\n\nАтмосфера нагрівається! 🔥✨`;
    } else if (countdown.minutes > 1) {
      message = `Привіт, леді! 👋✨\n\n⚡ Тільки ${countdown.minutes} хвилин до дня народження ${birthdayName}! 🎂\n\nСкоро буде феєрія! 🎆`;
    } else if (countdown.minutes === 1) {
      message = `Привіт, леді! 👋✨\n\n🚀 ОСТАННЯ ХВИЛИНА! Через 1 хвилину день народження ${birthdayName}! 🎂🎉\n\nГотовься до вибуху радості! 💥✨`;
    } else {
      message = `Привіт, леді! 👋✨\n\n🎉🎂 З ДНЕМ НАРОДЖЕННЯ, ${birthdayName}! 🎂🎉\n\nБажаю тобі безмежного щастя! 💫✨`;
    }
  } else {
    message = `Привіт, леді! 👋✨\n\n🎉 Тільки ${countdown.days} днів до дня народження ${birthdayName}! 🎂\n\nНе можу дочекатися свята! 💫`;
  }
  
  console.log(`   Message: ${message}`);
  console.log('');
});

console.log('✅ September 21st countdown test completed!');
