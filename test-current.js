#!/usr/bin/env node

// Test current date calculation
console.log('🧪 Testing Current Date Calculation');
console.log('===================================');

const now = new Date();
console.log(`Current date: ${now.toLocaleString()}`);
console.log(`Current year: ${now.getFullYear()}`);
console.log(`Current month: ${now.getMonth() + 1}`);
console.log(`Current day: ${now.getDate()}`);
console.log('');

// Set birthday to September 21st
const birthdayMonth = 9; // September
const birthdayDay = 21;
const currentYear = now.getFullYear();

// Create birthday date for current year at 00:01
let birthdayDate = new Date(currentYear, birthdayMonth - 1, birthdayDay, 0, 1, 0);

// If birthday has passed this year, use next year
if (birthdayDate < now) {
  birthdayDate = new Date(currentYear + 1, birthdayMonth - 1, birthdayDay, 0, 1, 0);
}

console.log(`Birthday date: ${birthdayDate.toLocaleString()}`);
console.log('');

const timeDiff = birthdayDate.getTime() - now.getTime();
console.log(`Time difference: ${timeDiff} ms`);
console.log(`Time difference in days: ${timeDiff / (1000 * 3600 * 24)}`);
console.log('');

// Calculate days, hours, and minutes correctly
const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
const remainingHours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
const remainingMinutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));

console.log(`Total days: ${totalDays}`);
console.log(`Remaining hours: ${remainingHours}`);
console.log(`Remaining minutes: ${remainingMinutes}`);
console.log('');

// Check if it's the same day
const isSameDay = now.getDate() === birthdayDay && now.getMonth() === (birthdayMonth - 1) && now.getFullYear() === currentYear;
const isBirthday = isSameDay;

console.log(`Is same day: ${isSameDay}`);
console.log(`Is birthday: ${isBirthday}`);
console.log('');

// Format message
let message;
if (isBirthday) {
  message = `Привіт, леді! 👋✨\n\n🎉🎂 З ДНЕМ НАРОДЖЕННЯ, Илона! 🎂🎉\n\nБажаю тобі безмежного щастя! 💫✨`;
} else if (totalDays === 0) {
  if (remainingHours > 1) {
    message = `Привіт, леді! 👋✨\n\n⏰ Тільки ${remainingHours} годин до дня народження Илони! 🎂\n\nПідготуйся до свята! 💫`;
  } else if (remainingHours === 1) {
    message = `Привіт, леді! 👋✨\n\n🔥 ОСТАННІЙ ГОДИННИК! Через 1 годину день народження Илони! 🎂🎉\n\nАтмосфера нагрівається! 🔥✨`;
  } else if (remainingMinutes > 1) {
    message = `Привіт, леді! 👋✨\n\n⚡ Тільки ${remainingMinutes} хвилин до дня народження Илони! 🎂\n\nСкоро буде феєрія! 🎆`;
  } else if (remainingMinutes === 1) {
    message = `Привіт, леді! 👋✨\n\n🚀 ОСТАННЯ ХВИЛИНА! Через 1 хвилину день народження Илони! 🎂🎉\n\nГотовься до вибуху радості! 💥✨`;
  } else {
    message = `Привіт, леді! 👋✨\n\n🎉🎂 З ДНЕМ НАРОДЖЕННЯ, Илона! 🎂🎉\n\nБажаю тобі безмежного щастя! 💫✨`;
  }
} else {
  message = `Привіт, леді! 👋✨\n\n🎉 Тільки ${totalDays} днів до дня народження Илони! 🎂\n\nНе можу дочекатися свята! 💫`;
}

console.log(`Message: ${message}`);
console.log('✅ Current date calculation test completed!');
