// App configuration defaults (messages, timings, animations). SAFE TO EDIT - change default settings here.

const CONFIG = {
  // Banner animation style: 'typewriter', 'fade', 'slide', or 'none'
  animationType: "typewriter",

  // How many seconds each thought stays visible before rotating
  thoughtChangeSeconds: 8,

  // Minutes before deadline to send the early warning notification
  warningMinutes: 15,

  // Minutes between repeated overdue nudge notifications
  repeatGapMinutes: 30,

  // Maximum number of overdue repeat reminders to schedule
  maxOverdueReminders: 3,

  // Default reminder messages with placeholders {task}, {time_left}, and {thought}
  defaultMessages: {
    beforeDeadline: 'Reminder: "{task}" is due in {time_left}! 🚀 "{thought}"',
    overdue: 'Alert: "{task}" is now overdue! ⚠️ "{thought}"'
  },

  // App Creator / Author Credit
  author: "Sameer",
  footerText: "ORBITAL PRODUCTIVITY PROTOCOL • MADE BY SAMEER"
};

// Make available globally in browser and module environments
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG };
}
