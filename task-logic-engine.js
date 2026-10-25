/**
 * ============================================================================
 * TASK LOGIC ENGINE (Universal Modular Core)
 * ============================================================================
 * Location: task-logic-engine.js
 * 
 * DESCRIPTION:
 * A complete, standalone, framework-agnostic logic engine extracted from the
 * CosmoTask productivity system. It encapsulates ALL business rules, state
 * management, persistence, multi-stage notification scheduling, time parsing,
 * text interpolation, quotes rotation, audio synthesis, and status automation.
 *
 * ZERO EXTERNAL DEPENDENCIES. Works in:
 * - Plain HTML/CSS/JS (Browser)
 * - React / Next.js
 * - Vue / Nuxt
 * - Svelte / Angular
 * - Capacitor / Cordova / Electron
 * - Node.js (with mock storage/audio)
 *
 * HOW TO USE IN ANY NEXT PROJECT:
 * 1. Copy this single file ("task-logic-engine.js") into your new project's
 *    `src/`, `lib/`, `services/`, or root directory.
 * 2. In JavaScript / TypeScript:
 *      import { TaskLogicEngine } from './task-logic-engine.js';
 *      const engine = new TaskLogicEngine();
 *      await engine.init();
 * 3. In Vanilla HTML:
 *      <script src="./task-logic-engine.js"></script>
 *      <script>
 *        const engine = new window.TaskLogicEngine();
 *        engine.init().then(() => console.log('Engine ready!'));
 *      </script>
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.TaskLogicEngine = exports.TaskLogicEngine;
    root.TaskStore = exports.TaskStore;
    root.NotificationEngine = exports.NotificationEngine;
    root.ThoughtEngine = exports.ThoughtEngine;
    root.AudioEngine = exports.AudioEngine;
    root.TimeUtils = exports.TimeUtils;
    root.DEFAULT_CONFIG = exports.DEFAULT_CONFIG;
    root.DEFAULT_THOUGHTS = exports.DEFAULT_THOUGHTS;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ==========================================================================
  // 1. DEFAULT CONFIGURATION & THOUGHT REPOSITORY
  // ==========================================================================

  const DEFAULT_CONFIG = {
    animationType: "typewriter", // 'typewriter' | 'fade' | 'slide' | 'none'
    thoughtChangeSeconds: 8,     // rotation interval
    warningMinutes: 15,          // pre-deadline alert
    repeatGapMinutes: 30,        // overdue nudge gap
    maxOverdueReminders: 3,      // repeat count
    defaultMessages: {
      beforeDeadline: 'Reminder: "{task}" is due in {time_left}! 🚀 "{thought}"',
      overdue: 'Alert: "{task}" is now overdue! ⚠️ "{thought}"'
    },
    author: "Sameer",
    footerText: "ORBITAL PRODUCTIVITY PROTOCOL • MADE BY SAMEER",
    storagePrefix: "cosmotask_"
  };

  const DEFAULT_THOUGHTS = [
    "You have power over your mind - not outside events. Realize this, and you will find strength. — Marcus Aurelius, Meditations",
    "It is only with the heart that one can see rightly; what is essential is invisible to the eye. — Antoine de Saint-Exupéry, The Little Prince",
    "You do not rise to the level of your goals. You fall to the level of your systems. — James Clear, Atomic Habits",
    "The mystery of life isn't a problem to solve, but a reality to experience. — Frank Herbert, Dune",
    "Somewhere, something incredible is waiting to be known. — Carl Sagan, Cosmos",
    "Clarity about what matters provides clarity about what does not. — Cal Newport, Deep Work",
    "What you get by achieving your goals is not as important as what you become by achieving your goals. — Henry David Thoreau, Walden",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. — Ralph Waldo Emerson, Self-Reliance",
    "The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius, Meditations",
    "A journey of a thousand miles begins with a single step. — Lao Tzu, Tao Te Ching",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Will Durant, The Story of Philosophy",
    "It is not that we have a short time to live, but that we waste a lot of it. — Seneca, On the Shortness of Life",
    "When you want something, all the universe conspires in helping you to achieve it. — Paulo Coelho, The Alchemist",
    "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude. — Viktor E. Frankl, Man's Search for Meaning",
    "He who has a why to live can bear almost any how. — Friedrich Nietzsche, Twilight of the Idols",
    "If you only read the books that everyone else is reading, you can only think what everyone else is thinking. — Haruki Murakami, Norwegian Wood",
    "Do not go where the path may lead, go instead where there is no path and leave a trail. — Ralph Waldo Emerson",
    "Beware the barrenness of a busy life. — Socrates",
    "Simplicity is the prerequisite for reliability. — Edsger W. Dijkstra",
    "The only true wisdom is in knowing you know nothing. — Plato, The Republic",
    "In the depth of winter, I finally learned that within me there lay an invincible summer. — Albert Camus, Return to Tipasa",
    "Life is what happens to us while we are making other plans. — Allen Saunders",
    "Waste no more time arguing about what a good man should be. Be one. — Marcus Aurelius, Meditations",
    "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
    "Knowing others is intelligence; knowing yourself is true wisdom. — Lao Tzu, Tao Te Ching",
    "Not all those who wander are lost. — J.R.R. Tolkien, The Fellowship of the Ring",
    "There is nothing permanent except change. — Heraclitus",
    "Action is the foundational key to all success. — Pablo Picasso",
    "It always seems impossible until it's done. — Nelson Mandela, Long Walk to Freedom",
    "The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself. — Carl Sagan, Cosmos",
    "Dwell on the beauty of life. Watch the stars, and see yourself running with them. — Marcus Aurelius, Meditations",
    "I have been impressed with the urgency of doing. Knowing is not enough; we must apply. — Leonardo da Vinci",
    "Little by little, one travels far. — J.R.R. Tolkien, The Hobbit",
    "Happiness is not something ready-made. It comes from your own actions. — Dalai Lama, The Art of Happiness",
    "The secret of getting ahead is getting started. — Mark Twain",
    "Discipline equals freedom. — Jocko Willink, Extreme Ownership",
    "Small disciplines repeated with consistency every day lead to great achievements. — John C. Maxwell",
    "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. — Frank Herbert, Dune",
    "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference. — Robert Frost",
    "Your time is limited, so don't waste it living someone else's life. — Walter Isaacson, Steve Jobs",
    "Every strike brings me closer to the next home run. — Babe Ruth",
    "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
    "Do what you can, with what you have, where you are. — Theodore Roosevelt, Autobiography",
    "He who conquers himself is the mightiest warrior. — Confucius, Analects",
    "Even the darkest night will end and the sun will rise. — Victor Hugo, Les Misérables",
    "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away. — Antoine de Saint-Exupéry, Airman's Odyssey",
    "If you hear a voice within you say 'you cannot paint', then by all means paint, and that voice will be silenced. — Vincent van Gogh",
    "Great things are done by a series of small things brought together. — Vincent van Gogh",
    "Man cannot discover new oceans unless he has the courage to lose sight of the shore. — André Gide",
    "Focus is a muscle; the more you practice sustaining attention, the stronger it grows. — Daniel Goleman, Focus",
    "Efficiency is doing things right; effectiveness is doing the right things. — Peter Drucker, The Effective Executive",
    "To live is the rarest thing in the world. Most people exist, that is all. — Oscar Wilde",
    "Until you make the unconscious conscious, it will direct your life and you will call it fate. — Carl Jung",
    "Courage is resistance to fear, mastery of fear—not absence of fear. — Mark Twain",
    "The mind is everything. What you think you become. — The Dhammapada",
    "The soul becomes dyed with the color of its thoughts. — Marcus Aurelius, Meditations",
    "Nothing in life is to be feared, it is only to be understood. — Marie Curie",
    "The limits of my language mean the limits of my world. — Ludwig Wittgenstein, Tractatus Logico-Philosophicus",
    "If you want to build a ship, don't drum up people to collect wood, but teach them to long for the endless sea. — Antoine de Saint-Exupéry",
    "In any moment of decision, the best thing you can do is the right thing, the next best thing is the wrong thing, and the worst thing you can do is nothing. — Theodore Roosevelt",
    "We suffer more often in imagination than in reality. — Seneca, Letters from a Stoic",
    "You can't cross the sea merely by standing and staring at the water. — Rabindranath Tagore",
    "Energy flows where attention goes. — Tony Robbins, Awaken the Giant Within",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. — Ralph Waldo Emerson",
    "There are years that ask questions and years that answer. — Zora Neale Hurston, Their Eyes Were Watching God",
    "You can make more friends in two months by becoming interested in other people than you can in two years by trying to get people interested in you. — Dale Carnegie, How to Win Friends and Influence People",
    "An unexamined life is not worth living. — Socrates, Apology",
    "Adopt the pace of nature: her secret is patience. — Ralph Waldo Emerson",
    "What man actually needs is not a tensionless state but rather the striving and struggling for a worthwhile goal. — Viktor E. Frankl, Man's Search for Meaning",
    "A person who never made a mistake never tried anything new. — Albert Einstein",
    "If you are going through hell, keep going. — Winston Churchill",
    "Make each day your masterpiece. — John Wooden",
    "The only limit to our realization of tomorrow will be our doubts of today. — Franklin D. Roosevelt",
    "No pressure, no diamonds. — Thomas Carlyle",
    "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "We don't see things as they are, we see them as we are. — Anaïs Nin",
    "One day you will look back and see that all along you were blooming. — Morgan Harper Nichols",
    "Difficulties strengthen the mind, as labor does the body. — Seneca",
    "Change your thoughts and you change your world. — Norman Vincent Peale, The Power of Positive Thinking",
    "Never let the fear of striking out keep you from playing the game. — Babe Ruth",
    "The way to get started is to quit talking and begin doing. — Walt Disney",
    "It is during our darkest moments that we must focus to see the light. — Aristotle",
    "Turn your wounds into wisdom. — Oprah Winfrey",
    "If you don't like something, change it. If you can't change it, change your attitude. — Maya Angelou",
    "Try not to become a man of success, but rather become a man of value. — Albert Einstein",
    "Don't count the days, make the days count. — Muhammad Ali",
    "Success usually comes to those who are too busy to be looking for it. — Henry David Thoreau",
    "The creation of a thousand forests is in one acorn. — Ralph Waldo Emerson",
    "Do one thing every day that scares you. — Eleanor Roosevelt",
    "You miss 100 percent of the shots you don't take. — Wayne Gretzky",
    "The mind once stretched by a new idea never returns to its original dimensions. — Oliver Wendell Holmes Jr.",
    "A good traveler has no fixed plans, and is not intent on arriving. — Lao Tzu",
    "Real integrity is doing the right thing, knowing that nobody's going to know whether you did it or not. — Oprah Winfrey",
    "Continuous effort - not strength or intelligence - is the key to unlocking our potential. — Winston Churchill",
    "The sun himself on his island rocks is yet half-hidden in the mist. — Henry David Thoreau",
    "Out of difficulties grow miracles. — Jean de La Bruyère",
    "Look up at the stars and not down at your feet. Be curious. — Stephen Hawking, Brief Answers to the Big Questions",
    "Quiet minds cannot be perplexed or frightened, but go on in fortune or misfortune at their own private pace. — Robert Louis Stevenson"
  ];

  // ==========================================================================
  // 2. TIME & FORMATTING UTILITIES (TimeUtils)
  // ==========================================================================

  const TimeUtils = {
    /**
     * Formats timestamp into relative readable label:
     * "Today, 14:30", "Tomorrow, 09:00", "Yesterday, 18:00", or "Oct 25, 14:30"
     */
    formatDeadlineDisplay(timestamp) {
      if (!timestamp) return "No Deadline";
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return "Invalid Date";

      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow =
        d.getDate() === tomorrow.getDate() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getFullYear() === tomorrow.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      const timeStr = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });

      if (isToday) return `Today, ${timeStr}`;
      if (isTomorrow) return `Tomorrow, ${timeStr}`;
      if (isYesterday) return `Yesterday, ${timeStr}`;

      const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
      return `${dateStr}, ${timeStr}`;
    },

    /**
     * Formats milliseconds duration into human-readable remaining time:
     * e.g., "15 min", "2h 30m", "0 minutes"
     */
    formatTimeLeft(ms) {
      if (ms <= 0) return "0 minutes";
      const minutes = Math.round(ms / (60 * 1000));
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      const remMin = minutes % 60;
      return remMin > 0 ? `${hours}h ${remMin}m` : `${hours}h`;
    },

    /**
     * Computes status and badge details for a given task.
     * Returns: { timeLeftText, timeLeftIcon, chipLabel, chipClass, chipIcon, archetypeClass }
     */
    getTaskDisplayMeta(task, now = Date.now()) {
      const isDone = task.status === "done";
      const isOverdue = task.status === "overdue" || (!isDone && task.deadline <= now);
      const intensity = task.intensity || "medium";

      let timeLeftText = "";
      let timeLeftIcon = "timer";

      if (isDone) {
        timeLeftText = "Completed";
        timeLeftIcon = "done_all";
      } else if (isOverdue) {
        timeLeftText = "Trajectory Lag";
        timeLeftIcon = "history";
      } else {
        const diff = task.deadline - now;
        timeLeftText = `${this.formatTimeLeft(diff)} left`;
        timeLeftIcon = "timer";
      }

      let chipLabel = "NORMAL";
      let chipClass = "chip-normal";
      let chipIcon = "orbit";

      if (isDone) {
        chipLabel = "CALIBRATED";
        chipClass = "chip-done";
        chipIcon = "check_circle";
      } else if (isOverdue) {
        chipLabel = "OVERDUE";
        chipClass = "chip-overdue";
        chipIcon = "warning";
      } else if (intensity === "high") {
        chipLabel = "CRITICAL";
        chipClass = "chip-critical";
        chipIcon = "timer";
      } else if (intensity === "low") {
        chipLabel = "LOW ORBIT";
        chipClass = "chip-low";
        chipIcon = "explore";
      }

      let archetypeClass = "card-normal";
      if (isDone) archetypeClass = "card-done";
      else if (isOverdue) archetypeClass = "card-overdue";
      else if (intensity === "high") archetypeClass = "card-critical";
      else if (intensity === "low") archetypeClass = "card-low";

      return {
        timeLeftText,
        timeLeftIcon,
        chipLabel,
        chipClass,
        chipIcon,
        archetypeClass
      };
    },

    /**
     * Escape HTML characters to protect against XSS injection
     */
    escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  };

  // ==========================================================================
  // 3. AUDIO SYNTHESIZER ENGINE (Web Audio API)
  // ==========================================================================

  class AudioEngine {
    constructor() {
      this.ctx = null;
    }

    getAudioContext() {
      if (!this.ctx && typeof window !== "undefined") {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    /**
     * Synthesizes the signature cosmic dual-tone alert chime (D5 -> A5)
     * No sound files or external mp3 dependencies needed!
     */
    playCosmicChime() {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        // Frequency sweep from D5 (587.33Hz) up to A5 (880Hz)
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);

        // Exponential volume decay for a clean metallic chime
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch (err) {
        // Autoplay restrictions or headless env
      }
    }
  }

  // ==========================================================================
  // 4. THOUGHT / QUOTES REPOSITORY & BANNER ENGINE (ThoughtEngine)
  // ==========================================================================

  class ThoughtEngine {
    constructor(config = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIG, config);
      this.thoughts = [...DEFAULT_THOUGHTS];
      this.currentIndex = 0;
      this.bannerTimer = null;
      this.typewriterTimer = null;
      this.listeners = new Set();
      this.storageKey = `${this.config.storagePrefix}thoughts_v1`;
      this.versionKey = `${this.config.storagePrefix}thoughts_version`;
      this.currentVersion = "v2_100_book_lines";
    }

    init() {
      this.load();
    }

    load() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        const ver = localStorage.getItem(this.versionKey);
        const saved = localStorage.getItem(this.storageKey);
        if (saved && ver === this.currentVersion) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.thoughts = parsed;
            return;
          }
        }
        // Seed default 104 thoughts
        this.save();
        localStorage.setItem(this.versionKey, this.currentVersion);
      } catch (e) {
        console.warn("[ThoughtEngine] Load error:", e);
      }
    }

    save() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.thoughts));
      } catch (e) {
        console.warn("[ThoughtEngine] Save error:", e);
      }
    }

    getThoughts() {
      return [...this.thoughts];
    }

    getRandomThought() {
      if (!this.thoughts || this.thoughts.length === 0) {
        return "Stay focused on your flight path.";
      }
      const idx = Math.floor(Math.random() * this.thoughts.length);
      return this.thoughts[idx];
    }

    getCurrentThought() {
      if (!this.thoughts || this.thoughts.length === 0) return "";
      return this.thoughts[this.currentIndex % this.thoughts.length];
    }

    addThought(text) {
      if (!text || !text.trim()) return false;
      this.thoughts.unshift(text.trim());
      this.save();
      this.notify("thought:added", { text, index: 0 });
      return true;
    }

    updateThought(index, newText) {
      if (index < 0 || index >= this.thoughts.length || !newText || !newText.trim()) return false;
      this.thoughts[index] = newText.trim();
      this.save();
      this.notify("thought:updated", { index, text: this.thoughts[index] });
      return true;
    }

    deleteThought(index) {
      if (index < 0 || index >= this.thoughts.length) return false;
      const removed = this.thoughts.splice(index, 1)[0];
      if (this.currentIndex >= this.thoughts.length) {
        this.currentIndex = 0;
      }
      this.save();
      this.notify("thought:deleted", { index, text: removed });
      return true;
    }

    resetThoughts() {
      this.thoughts = [...DEFAULT_THOUGHTS];
      this.currentIndex = 0;
      this.save();
      this.notify("thought:reset", {});
    }

    /**
     * Start automatic rotation timer
     * @param {Function} onThoughtChange Callback invoked on each rotation with (thoughtText, animType)
     */
    startRotation(onThoughtChange) {
      this.stopRotation();
      const intervalMs = (this.config.thoughtChangeSeconds || 8) * 1000;

      if (typeof onThoughtChange === "function") {
        onThoughtChange(this.getCurrentThought(), this.config.animationType);
      }

      this.bannerTimer = setInterval(() => {
        if (!this.thoughts || this.thoughts.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.thoughts.length;
        const nextThought = this.getCurrentThought();
        if (typeof onThoughtChange === "function") {
          onThoughtChange(nextThought, this.config.animationType);
        }
        this.notify("thought:rotated", { thought: nextThought, index: this.currentIndex });
      }, intervalMs);
    }

    stopRotation() {
      if (this.bannerTimer) {
        clearInterval(this.bannerTimer);
        this.bannerTimer = null;
      }
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }
    }

    /**
     * Helper to run typewriter animation step-by-step
     * @param {string} text Full text to type
     * @param {Function} onChar Callback receiving updated substring
     * @param {number} speedMs Delay between characters in ms (default 35)
     */
    typewriter(text, onChar, speedMs = 35) {
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }
      let charIdx = 0;
      let current = "";
      this.typewriterTimer = setInterval(() => {
        if (charIdx < text.length) {
          current += text.charAt(charIdx);
          charIdx++;
          onChar(current, false);
        } else {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
          onChar(current, true); // true = complete
        }
      }, speedMs);
    }

    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }

    notify(event, payload) {
      for (const fn of this.listeners) {
        try {
          fn(event, payload);
        } catch (e) {
          console.error("[ThoughtEngine] Listener error:", e);
        }
      }
    }
  }

  // ==========================================================================
  // 5. NOTIFICATION & MULTI-TIER REMINDER ENGINE (NotificationEngine)
  // ==========================================================================

  class NotificationEngine {
    constructor(config = {}, thoughtEngine = null) {
      this.config = Object.assign({}, DEFAULT_CONFIG, config);
      this.thoughtEngine = thoughtEngine;
      this.listeners = new Set();
    }

    getCapacitorPlugin() {
      if (
        typeof window !== "undefined" &&
        window.Capacitor &&
        window.Capacitor.Plugins &&
        window.Capacitor.Plugins.LocalNotifications
      ) {
        return window.Capacitor.Plugins.LocalNotifications;
      }
      return null;
    }

    /**
     * Generates a deterministic positive 32-bit integer ID for Capacitor/Android
     */
    generateNotificationId(taskId, sequence = 1) {
      let hash = 0;
      const str = String(taskId);
      for (let i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
      }
      const base = Math.abs(hash) % 20000000;
      return (base * 100 + sequence) & 0x7fffffff;
    }

    /**
     * Interpolates {task}, {time_left}, and {thought} placeholders in messages
     */
    fillPlaceholders(template, task, timeLeftStr) {
      const thought = this.thoughtEngine
        ? this.thoughtEngine.getRandomThought()
        : "Stay focused on your journey.";
      return (template || "")
        .replace(/{task}/g, task.title || "Untitled Mission")
        .replace(/{time_left}/g, timeLeftStr)
        .replace(/{thought}/g, thought);
    }

    /**
     * Computes the schedule descriptors for a task across 3 stages:
     * 1. Pre-deadline warning (e.g. 15 minutes before)
     * 2. Deadline moment alert
     * 3. Repeated overdue nudges (e.g. every 30 minutes, up to N times)
     */
    buildTaskNotificationSchedule(task, now = Date.now()) {
      if (!task || task.status === "done") return [];

      const scheduled = [];
      const warningMinutes = this.config.warningMinutes || 15;
      const repeatGapMinutes = this.config.repeatGapMinutes || 30;
      const maxReminders = this.config.maxOverdueReminders || 3;
      const messages = this.config.defaultMessages || {};

      // Stage 1: Pre-deadline warning
      const beforeTime = task.deadline - warningMinutes * 60 * 1000;
      if (beforeTime > now) {
        const id = this.generateNotificationId(task.id, 1);
        const timeLeftStr = `${warningMinutes} minutes`;
        const bodyText = this.fillPlaceholders(messages.beforeDeadline, task, timeLeftStr);

        scheduled.push({
          id: id,
          title: `Orbit Warning: ${task.title}`,
          body: bodyText,
          schedule: { at: new Date(beforeTime), allowWhileIdle: true },
          extra: { taskId: task.id, type: "before" },
          sound: "default"
        });
      }

      // Stage 2: Exact deadline arrival
      if (task.deadline > now) {
        const id = this.generateNotificationId(task.id, 2);
        const bodyText = this.fillPlaceholders(messages.overdue, task, "0 minutes");

        scheduled.push({
          id: id,
          title: `CRITICAL DRIFT: ${task.title}`,
          body: bodyText,
          schedule: { at: new Date(task.deadline), allowWhileIdle: true },
          extra: { taskId: task.id, type: "overdue" },
          sound: "default"
        });
      }

      // Stage 3: Repeated overdue nudges
      for (let i = 1; i <= maxReminders; i++) {
        const nudgeTime = task.deadline + i * repeatGapMinutes * 60 * 1000;
        if (nudgeTime > now) {
          const id = this.generateNotificationId(task.id, 10 + i);
          const elapsedMinutes = i * repeatGapMinutes;
          const bodyText = this.fillPlaceholders(
            messages.overdue,
            task,
            `${elapsedMinutes}m overdue`
          );

          scheduled.push({
            id: id,
            title: `Overdue Nudge (${i}/${maxReminders}): ${task.title}`,
            body: bodyText,
            schedule: { at: new Date(nudgeTime), allowWhileIdle: true },
            extra: { taskId: task.id, type: "nudge" },
            sound: "default"
          });
        }
      }

      return scheduled;
    }

    /**
     * Schedules native or browser reminders for a task
     */
    async scheduleForTask(task) {
      if (!task || task.status !== "pending") return [];
      await this.cancelForTask(task);

      const items = this.buildTaskNotificationSchedule(task);
      const newIds = items.map((item) => item.id);
      task.notificationIds = newIds;

      const LocalNotifications = this.getCapacitorPlugin();
      if (LocalNotifications && items.length > 0) {
        try {
          await LocalNotifications.schedule({ notifications: items });
        } catch (err) {
          console.warn("[NotificationEngine] Capacitor schedule error:", err);
        }
      } else {
        // Fallback: in headless or desktop browser
        // Items are ready for dispatch or browser timer
      }

      return newIds;
    }

    /**
     * Cancels existing scheduled notifications for a task
     */
    async cancelForTask(task) {
      if (!task || !task.notificationIds || task.notificationIds.length === 0) return;

      const LocalNotifications = this.getCapacitorPlugin();
      if (LocalNotifications) {
        try {
          const cancelList = task.notificationIds.map((id) => ({ id }));
          await LocalNotifications.cancel({ notifications: cancelList });
        } catch (err) {
          console.warn("[NotificationEngine] Capacitor cancel error:", err);
        }
      }

      task.notificationIds = [];
    }

    /**
     * Checks permission status ('granted' | 'denied' | 'prompt')
     */
    async checkPermission() {
      const LocalNotifications = this.getCapacitorPlugin();
      if (LocalNotifications) {
        try {
          const res = await LocalNotifications.checkPermissions();
          return res.display === "granted";
        } catch (e) {}
      }
      if (typeof Notification !== "undefined") {
        return Notification.permission === "granted";
      }
      return false;
    }

    /**
     * Prompts user for notification permission
     */
    async requestPermission() {
      const LocalNotifications = this.getCapacitorPlugin();
      if (LocalNotifications) {
        try {
          const res = await LocalNotifications.requestPermissions();
          return res.display === "granted";
        } catch (e) {
          console.error("[NotificationEngine] Native request permission error:", e);
        }
      }
      if (typeof Notification !== "undefined") {
        try {
          const status = await Notification.requestPermission();
          return status === "granted";
        } catch (e) {
          console.error("[NotificationEngine] Web request permission error:", e);
        }
      }
      return false;
    }

    /**
     * Dispatches an immediate test notification (native or browser)
     */
    async sendTestNotification() {
      const title = "Orbital Test Transmission";
      const body = "Telemetry systems operational. Alarms calibrated.";

      const LocalNotifications = this.getCapacitorPlugin();
      if (LocalNotifications) {
        try {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: 999999,
                title: title,
                body: body,
                schedule: { at: new Date(Date.now() + 1500) },
                sound: "default"
              }
            ]
          });
          return true;
        } catch (e) {
          console.warn("[NotificationEngine] Native test error:", e);
        }
      }

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(title, { body });
          return true;
        } catch (e) {}
      }
      return false;
    }
  }

  // ==========================================================================
  // 6. TASK STORE & LIFECYCLE MANAGEMENT (TaskStore)
  // ==========================================================================

  class TaskStore {
    constructor(config = {}, notificationEngine = null) {
      this.config = Object.assign({}, DEFAULT_CONFIG, config);
      this.notificationEngine = notificationEngine;
      this.tasks = [];
      this.storageKey = `${this.config.storagePrefix}tasks_v1`;
      this.initKey = `${this.config.storagePrefix}initialized_v1`;
      this.listeners = new Set();
    }

    init() {
      this.load();
    }

    load() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        const isFirst = !localStorage.getItem(this.initKey);
        const saved = localStorage.getItem(this.storageKey);

        if (saved) {
          this.tasks = JSON.parse(saved) || [];
        }

        if (isFirst && (!this.tasks || this.tasks.length === 0)) {
          // Seed default sample mission data
          const now = Date.now();
          this.tasks = [
            {
              id: "task-" + now + "-1",
              title: "Deploy Lunar Rover Sensor Patch",
              deadline: now + 2 * 60 * 60 * 1000 + 30 * 60 * 1000,
              intensity: "high",
              status: "pending",
              createdAt: now,
              notificationIds: []
            },
            {
              id: "task-" + now + "-2",
              title: "Sync Telemetry with Orbital Base",
              deadline: now - 14 * 60 * 60 * 1000,
              intensity: "high",
              status: "overdue",
              createdAt: now - 24 * 60 * 60 * 1000,
              notificationIds: []
            },
            {
              id: "task-" + now + "-3",
              title: "Refuel Oxygen Reserves & Inspect Seals",
              deadline: now + 28 * 60 * 60 * 1000,
              intensity: "medium",
              status: "pending",
              createdAt: now,
              notificationIds: []
            }
          ];
          localStorage.setItem(this.initKey, "true");
          this.save();
        } else {
          this.updateStatuses();
        }
      } catch (e) {
        console.warn("[TaskStore] Load error:", e);
      }
    }

    save() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
      } catch (e) {
        console.warn("[TaskStore] Save error:", e);
      }
    }

    /**
     * Checks all pending tasks against current time.
     * Automatically transitions pending tasks with deadline <= now to 'overdue'.
     * Returns: { hasChanged: boolean, newlyOverdue: Array<Task> }
     */
    updateStatuses(now = Date.now()) {
      let hasChanged = false;
      const newlyOverdue = [];

      this.tasks.forEach((task) => {
        if (task.status === "pending" && task.deadline <= now) {
          task.status = "overdue";
          hasChanged = true;
          newlyOverdue.push(task);
        }
      });

      if (hasChanged) {
        this.save();
        this.notify("tasks:status_changed", { newlyOverdue });
      }

      return { hasChanged, newlyOverdue };
    }

    /**
     * Add a new task
     * @param {Object} data { title, deadline, intensity }
     */
    async createTask({ title, deadline, intensity = "medium" }) {
      if (!title || !title.trim()) {
        throw new Error("Task title is required.");
      }
      const parsedDeadline = typeof deadline === "number" ? deadline : new Date(deadline).getTime();
      if (isNaN(parsedDeadline)) {
        throw new Error("Invalid task deadline.");
      }

      const now = Date.now();
      const isPast = parsedDeadline <= now;

      const newTask = {
        id: "task-" + now + "-" + Math.floor(Math.random() * 1000),
        title: title.trim(),
        deadline: parsedDeadline,
        intensity: intensity || "medium",
        status: isPast ? "overdue" : "pending",
        createdAt: now,
        notificationIds: []
      };

      this.tasks.push(newTask);

      if (!isPast && this.notificationEngine) {
        await this.notificationEngine.scheduleForTask(newTask);
      }

      this.save();
      this.notify("task:created", { task: newTask });
      return newTask;
    }

    /**
     * Update an existing task
     */
    async updateTask(taskId, updates = {}) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) throw new Error(`Task ${taskId} not found.`);

      if (updates.title !== undefined) task.title = String(updates.title).trim();
      if (updates.intensity !== undefined) task.intensity = updates.intensity;

      if (updates.deadline !== undefined) {
        const d = typeof updates.deadline === "number" ? updates.deadline : new Date(updates.deadline).getTime();
        if (isNaN(d)) throw new Error("Invalid deadline timestamp.");
        task.deadline = d;

        const isPast = task.deadline <= Date.now();
        if (task.status !== "done") {
          task.status = isPast ? "overdue" : "pending";
        }
      }

      if (this.notificationEngine) {
        if (task.status === "pending") {
          await this.notificationEngine.scheduleForTask(task);
        } else {
          await this.notificationEngine.cancelForTask(task);
        }
      }

      this.save();
      this.notify("task:updated", { task });
      return task;
    }

    /**
     * Toggle status between done <-> pending/overdue
     */
    async toggleTaskStatus(taskId) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (!task) return null;

      if (task.status === "done") {
        // Revert to overdue if past, pending if future
        task.status = task.deadline <= Date.now() ? "overdue" : "pending";
        if (task.status === "pending" && this.notificationEngine) {
          await this.notificationEngine.scheduleForTask(task);
        }
      } else {
        // Complete
        task.status = "done";
        if (this.notificationEngine) {
          await this.notificationEngine.cancelForTask(task);
        }
      }

      this.save();
      this.notify("task:toggled", { task });
      return task;
    }

    /**
     * Delete a task
     */
    async deleteTask(taskId) {
      const idx = this.tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) return false;

      const [removed] = this.tasks.splice(idx, 1);
      if (this.notificationEngine) {
        await this.notificationEngine.cancelForTask(removed);
      }

      this.save();
      this.notify("task:deleted", { task: removed });
      return true;
    }

    /**
     * Queries and sorts tasks:
     * - Filters by filterName ('all' | 'pending' | 'done' | 'overdue')
     * - Filters by searchQuery (case-insensitive substring)
     * - Sorts: Pending/Overdue first by nearest deadline, Done tasks placed at bottom
     */
    query({ filter = "all", searchQuery = "", sort = true } = {}) {
      const queryStr = (searchQuery || "").trim().toLowerCase();

      let filtered = this.tasks.filter((t) => {
        if (filter !== "all" && t.status !== filter) return false;
        if (queryStr && !t.title.toLowerCase().includes(queryStr)) return false;
        return true;
      });

      if (sort) {
        filtered.sort((a, b) => {
          if (a.status === "done" && b.status !== "done") return 1;
          if (a.status !== "done" && b.status === "done") return -1;
          return a.deadline - b.deadline;
        });
      }

      return filtered;
    }

    /**
     * Returns real-time counts and metrics:
     * { total, pending, done, overdue, completionRate }
     */
    getCounters() {
      const counts = { total: this.tasks.length, pending: 0, done: 0, overdue: 0 };
      this.tasks.forEach((t) => {
        if (t.status === "pending") counts.pending++;
        else if (t.status === "done") counts.done++;
        else if (t.status === "overdue") counts.overdue++;
      });
      const rate = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;
      return { ...counts, completionRate: rate };
    }

    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }

    notify(event, payload) {
      for (const fn of this.listeners) {
        try {
          fn(event, payload);
        } catch (e) {
          console.error("[TaskStore] Listener error:", e);
        }
      }
    }
  }

  // ==========================================================================
  // 7. COMPREHENSIVE FACADE (TaskLogicEngine)
  // ==========================================================================

  class TaskLogicEngine {
    constructor(customConfig = {}) {
      this.config = Object.assign({}, DEFAULT_CONFIG, customConfig);
      this.storageKey = `${this.config.storagePrefix}settings_v1`;

      this.audio = new AudioEngine();
      this.thoughts = new ThoughtEngine(this.config);
      this.notifications = new NotificationEngine(this.config, this.thoughts);
      this.tasks = new TaskStore(this.config, this.notifications);

      this.monitorInterval = null;
      this.eventListeners = new Map();
    }

    /**
     * Initialize all sub-engines, load state, and start background clock
     */
    async init() {
      this.loadSettings();
      this.thoughts.init();
      this.tasks.init();

      // Forward sub-engine events
      this.tasks.subscribe((event, data) => this.emit(event, data));
      this.thoughts.subscribe((event, data) => this.emit(event, data));

      this.startStatusMonitor();
      this.emit("engine:ready", {
        tasksCount: this.tasks.tasks.length,
        thoughtsCount: this.thoughts.thoughts.length
      });
      return this;
    }

    loadSettings() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.config = Object.assign({}, this.config, parsed);
        }
      } catch (e) {
        console.warn("[TaskLogicEngine] Failed to load settings:", e);
      }
    }

    saveSettings() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
      } catch (e) {
        console.warn("[TaskLogicEngine] Failed to save settings:", e);
      }
    }

    /**
     * Update runtime settings (e.g., warning minutes, message templates)
     */
    async updateSettings(newSettings = {}) {
      this.config = Object.assign({}, this.config, newSettings);
      this.thoughts.config = this.config;
      this.notifications.config = this.config;
      this.tasks.config = this.config;
      this.saveSettings();

      // Reschedule all active pending reminders with new settings
      for (const task of this.tasks.tasks) {
        if (task.status === "pending") {
          await this.notifications.scheduleForTask(task);
        }
      }
      this.emit("settings:updated", { config: this.config });
    }

    /**
     * Starts the periodic 1-minute ticker.
     * Transitions any pending task that passes deadline to overdue and sounds alarm.
     */
    startStatusMonitor(intervalMs = 60000) {
      this.stopStatusMonitor();
      this.monitorInterval = setInterval(() => {
        const { hasChanged, newlyOverdue } = this.tasks.updateStatuses();
        if (hasChanged && newlyOverdue.length > 0) {
          this.audio.playCosmicChime();
          newlyOverdue.forEach((t) => {
            this.emit("task:overdue_alert", {
              task: t,
              title: "Critical Drift Detected",
              message: `Mission "${t.title}" has passed its scheduled deadline!`
            });
          });
        }
      }, intervalMs);
    }

    stopStatusMonitor() {
      if (this.monitorInterval) {
        clearInterval(this.monitorInterval);
        this.monitorInterval = null;
      }
    }

    /**
     * Factory reset: removes all data from storage and cancels alarms
     */
    async resetAll() {
      for (const t of this.tasks.tasks) {
        await this.notifications.cancelForTask(t);
      }
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(`${this.config.storagePrefix}tasks_v1`);
        localStorage.removeItem(`${this.config.storagePrefix}thoughts_v1`);
        localStorage.removeItem(`${this.config.storagePrefix}settings_v1`);
        localStorage.removeItem(`${this.config.storagePrefix}initialized_v1`);
      }
      this.config = Object.assign({}, DEFAULT_CONFIG);
      this.thoughts.resetThoughts();
      this.tasks.tasks = [];
      this.tasks.load();
      this.emit("engine:reset", {});
    }

    /**
     * Export full data snapshot as JSON string
     */
    exportJSON() {
      return JSON.stringify(
        {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          config: this.config,
          tasks: this.tasks.tasks,
          thoughts: this.thoughts.thoughts
        },
        null,
        2
      );
    }

    /**
     * Import full data snapshot from JSON string
     */
    async importJSON(jsonString) {
      const data = JSON.parse(jsonString);
      if (data.config) this.config = Object.assign(this.config, data.config);
      if (Array.isArray(data.tasks)) this.tasks.tasks = data.tasks;
      if (Array.isArray(data.thoughts)) this.thoughts.thoughts = data.thoughts;

      this.saveSettings();
      this.thoughts.save();
      this.tasks.save();

      for (const t of this.tasks.tasks) {
        if (t.status === "pending") {
          await this.notifications.scheduleForTask(t);
        }
      }
      this.emit("engine:imported", {});
    }

    // --- PUB/SUB EVENT EMITTER ---
    on(event, handler) {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, new Set());
      }
      this.eventListeners.get(event).add(handler);
      return () => this.off(event, handler);
    }

    off(event, handler) {
      if (this.eventListeners.has(event)) {
        this.eventListeners.get(event).delete(handler);
      }
    }

    emit(event, data) {
      const handlers = this.eventListeners.get(event);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(data);
          } catch (e) {
            console.error(`[TaskLogicEngine] Handler error on "${event}":`, e);
          }
        }
      }
    }

    /**
     * Helper to subscribe to any state changes (React / Vue reactivity helper)
     */
    subscribe(callback) {
      const events = [
        "task:created",
        "task:updated",
        "task:toggled",
        "task:deleted",
        "tasks:status_changed",
        "thought:added",
        "thought:updated",
        "thought:deleted",
        "settings:updated",
        "engine:reset"
      ];
      const unsubs = events.map((ev) => this.on(ev, () => callback(this)));
      return () => unsubs.forEach((unsub) => unsub());
    }
  }

  // Export classes and helpers
  return {
    TaskLogicEngine,
    TaskStore,
    NotificationEngine,
    ThoughtEngine,
    AudioEngine,
    TimeUtils,
    DEFAULT_CONFIG,
    DEFAULT_THOUGHTS
  };
});
