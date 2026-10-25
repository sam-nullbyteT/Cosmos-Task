// Main application logic, state management, and reminder engine. DO NOT EDIT unless changing core logic.

(function () {
  "use strict";

  // --- STORAGE KEYS ---
  const STORAGE_KEYS = {
    TASKS: "cosmotask_tasks_v1",
    THOUGHTS: "cosmotask_thoughts_v1",
    SETTINGS: "cosmotask_settings_v1",
    INITIALIZED: "cosmotask_initialized_v1"
  };

  // --- STATE ---
  let state = {
    tasks: [],
    thoughts: [],
    settings: {
      animationType: "typewriter",
      thoughtChangeSeconds: 8,
      warningMinutes: 15,
      repeatGapMinutes: 30,
      maxOverdueReminders: 3,
      messages: {
        beforeDeadline: "",
        overdue: ""
      }
    },
    activeFilter: "all", // 'all' | 'pending' | 'done' | 'overdue'
    searchQuery: "",
    activeTab: "home",
    lastFocusedTextarea: null
  };

  // Banner rotation timer & animation references
  let bannerTimer = null;
  let typewriterTimer = null;
  let currentThoughtIndex = 0;

  // Background monitor timer
  let monitorInterval = null;

  // Confirmation modal callback
  let onConfirmCallback = null;

  // Check if running inside Capacitor native environment
  const isCapacitorNative = !!(
    window.Capacitor &&
    window.Capacitor.isNativePlatform &&
    window.Capacitor.isNativePlatform()
  );

  const LocalNotifications =
    window.Capacitor &&
    window.Capacitor.Plugins &&
    window.Capacitor.Plugins.LocalNotifications;

  // --- INITIALIZATION ---
  window.addEventListener("DOMContentLoaded", () => {
    initApp();
  });

  async function initApp() {
    loadSettings();
    loadThoughts();
    loadTasks();

    setupNavigation();
    setupSearch();
    setupCounters();
    setupTaskModal();
    setupThoughtModal();
    setupConfirmModal();
    setupMessagesScreen();
    setupSettingsScreen();
    setupInAppBannerDismiss();

    renderAll();
    startThoughtBanner();
    startStatusMonitor();
    initNotificationListeners();
    checkNotificationPermissionStatus();
  }

  // --- DATA LOADING & PERSISTENCE ---
  function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        state.settings = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved settings, falling back to CONFIG", e);
        fallbackSettings();
      }
    } else {
      fallbackSettings();
    }
  }

  function fallbackSettings() {
    const configDefaults = (typeof window.CONFIG !== "undefined") ? window.CONFIG : {};
    state.settings = {
      animationType: configDefaults.animationType || "typewriter",
      thoughtChangeSeconds: configDefaults.thoughtChangeSeconds || 8,
      warningMinutes: configDefaults.warningMinutes || 15,
      repeatGapMinutes: configDefaults.repeatGapMinutes || 30,
      maxOverdueReminders: configDefaults.maxOverdueReminders || 3,
      messages: {
        beforeDeadline:
          (configDefaults.defaultMessages && configDefaults.defaultMessages.beforeDeadline) ||
          'Reminder: "{task}" is due in {time_left}! 🚀 "{thought}"',
        overdue:
          (configDefaults.defaultMessages && configDefaults.defaultMessages.overdue) ||
          'Alert: "{task}" is now overdue! ⚠️ "{thought}"'
      }
    };
    saveSettings();
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  }

  function loadThoughts() {
    const saved = localStorage.getItem(STORAGE_KEYS.THOUGHTS);
    if (saved) {
      try {
        state.thoughts = JSON.parse(saved);
      } catch (e) {
        state.thoughts = [];
      }
    }

    // On first run or if empty, seed from THOUGHTS array
    if (!state.thoughts || state.thoughts.length === 0) {
      if (typeof window.THOUGHTS !== "undefined" && Array.isArray(window.THOUGHTS)) {
        state.thoughts = [...window.THOUGHTS];
      } else {
        state.thoughts = [
          "Reach for the stars, but remember to submit the lunar report on time.",
          "Small orbital steps today lead to cosmic leaps tomorrow."
        ];
      }
      saveThoughts();
    }
  }

  function saveThoughts() {
    localStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(state.thoughts));
  }

  function loadTasks() {
    const isFirstRun = !localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);

    if (saved) {
      try {
        state.tasks = JSON.parse(saved);
      } catch (e) {
        state.tasks = [];
      }
    }

    if (isFirstRun && (!state.tasks || state.tasks.length === 0)) {
      // Seed initial sample missions matching the design aesthetic
      const now = Date.now();
      state.tasks = [
        {
          id: "task-" + now + "-1",
          title: "Deploy Lunar Rover Sensor Patch",
          deadline: now + 2 * 60 * 60 * 1000 + 30 * 60 * 1000, // 2h 30m from now
          intensity: "high",
          status: "pending",
          createdAt: now,
          notificationIds: []
        },
        {
          id: "task-" + now + "-2",
          title: "Sync Telemetry with Orbital Base",
          deadline: now - 14 * 60 * 60 * 1000, // Overdue by 14 hours
          intensity: "high",
          status: "overdue",
          createdAt: now - 24 * 60 * 60 * 1000,
          notificationIds: []
        },
        {
          id: "task-" + now + "-3",
          title: "Refuel Oxygen Reserves & Inspect Seals",
          deadline: now + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000, // Tomorrow
          intensity: "medium",
          status: "pending",
          createdAt: now,
          notificationIds: []
        }
      ];
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
      saveTasks();
      rescheduleAllPendingTasks();
    } else {
      updateTaskStatuses();
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
  }

  // --- STATUS MONITOR & PERIODIC CLOCK ---
  function startStatusMonitor() {
    if (monitorInterval) clearInterval(monitorInterval);
    monitorInterval = setInterval(() => {
      const changed = updateTaskStatuses();
      if (changed) {
        renderTasks();
        renderCounters();
      }
    }, 60000); // Check every minute
  }

  function updateTaskStatuses() {
    const now = Date.now();
    let hasChanged = false;

    state.tasks.forEach((task) => {
      if (task.status === "pending" && task.deadline <= now) {
        task.status = "overdue";
        hasChanged = true;
        // Trigger in-app banner for tasks that become overdue while app is open
        triggerInAppBanner(
          "Critical Drift Detected",
          `Mission "${task.title}" has passed its scheduled orbital deadline!`,
          "overdue"
        );
      }
    });

    if (hasChanged) {
      saveTasks();
    }
    return hasChanged;
  }

  // --- NOTIFICATION & REMINDER ENGINE ---
  function generateNotificationId(taskId, seq) {
    // Generate positive 32-bit integer ID for Capacitor
    let hash = 0;
    const str = String(taskId);
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    const base = Math.abs(hash) % 20000000;
    return (base * 100 + seq) & 0x7fffffff;
  }

  function getRandomThought() {
    if (!state.thoughts || state.thoughts.length === 0) {
      return "Stay focused on your flight path.";
    }
    const idx = Math.floor(Math.random() * state.thoughts.length);
    return state.thoughts[idx];
  }

  function formatTimeLeft(ms) {
    if (ms <= 0) return "0 minutes";
    const minutes = Math.round(ms / (60 * 1000));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remMin = minutes % 60;
    return remMin > 0 ? `${hours}h ${remMin}m` : `${hours}h`;
  }

  function fillPlaceholders(template, task, timeLeftStr) {
    const thought = getRandomThought();
    return template
      .replace(/{task}/g, task.title)
      .replace(/{time_left}/g, timeLeftStr)
      .replace(/{thought}/g, thought);
  }

  async function scheduleTaskNotifications(task) {
    if (!task || task.status !== "pending") return;

    // First cancel any existing notifications for this task
    await cancelTaskNotifications(task);

    const now = Date.now();
    const scheduledNotifications = [];
    const newIds = [];

    const warningMinutes = state.settings.warningMinutes || 15;
    const repeatGapMinutes = state.settings.repeatGapMinutes || 30;
    const maxReminders = state.settings.maxOverdueReminders || 3;

    // 1. Before Deadline Notification
    const beforeTime = task.deadline - warningMinutes * 60 * 1000;
    if (beforeTime > now) {
      const id = generateNotificationId(task.id, 1);
      const timeLeftStr = `${warningMinutes} minutes`;
      const bodyText = fillPlaceholders(state.settings.messages.beforeDeadline, task, timeLeftStr);

      scheduledNotifications.push({
        id: id,
        title: `Orbit Warning: ${task.title}`,
        body: bodyText,
        schedule: { at: new Date(beforeTime), allowWhileIdle: true },
        extra: { taskId: task.id, type: "before" },
        sound: "default"
      });
      newIds.push(id);
    }

    // 2. Overdue Notification (exactly at deadline)
    if (task.deadline > now) {
      const id = generateNotificationId(task.id, 2);
      const bodyText = fillPlaceholders(state.settings.messages.overdue, task, "0 minutes");

      scheduledNotifications.push({
        id: id,
        title: `CRITICAL DRIFT: ${task.title}`,
        body: bodyText,
        schedule: { at: new Date(task.deadline), allowWhileIdle: true },
        extra: { taskId: task.id, type: "overdue" },
        sound: "default"
      });
      newIds.push(id);
    }

    // 3. Repeated Overdue Nudges
    for (let i = 1; i <= maxReminders; i++) {
      const nudgeTime = task.deadline + i * repeatGapMinutes * 60 * 1000;
      if (nudgeTime > now) {
        const id = generateNotificationId(task.id, 10 + i);
        const elapsedMinutes = i * repeatGapMinutes;
        const bodyText = fillPlaceholders(
          state.settings.messages.overdue,
          task,
          `${elapsedMinutes}m overdue`
        );

        scheduledNotifications.push({
          id: id,
          title: `Overdue Nudge (${i}/${maxReminders}): ${task.title}`,
          body: bodyText,
          schedule: { at: new Date(nudgeTime), allowWhileIdle: true },
          extra: { taskId: task.id, type: "nudge" },
          sound: "default"
        });
        newIds.push(id);
      }
    }

    task.notificationIds = newIds;

    // Native Capacitor Local Notifications
    if (LocalNotifications) {
      try {
        if (scheduledNotifications.length > 0) {
          await LocalNotifications.schedule({ notifications: scheduledNotifications });
        }
      } catch (err) {
        console.warn("Capacitor LocalNotifications schedule error:", err);
      }
    } else {
      // In standard browser: we log the schedule and manage in-memory timer
      console.log(`[Browser Notification Engine] Scheduled ${scheduledNotifications.length} reminder alerts for task "${task.title}".`);
    }

    saveTasks();
  }

  async function cancelTaskNotifications(task) {
    if (!task || !task.notificationIds || task.notificationIds.length === 0) return;

    if (LocalNotifications) {
      try {
        const cancelList = task.notificationIds.map((id) => ({ id }));
        await LocalNotifications.cancel({ notifications: cancelList });
      } catch (err) {
        console.warn("Capacitor cancel error:", err);
      }
    }

    task.notificationIds = [];
    saveTasks();
  }

  async function rescheduleAllPendingTasks() {
    for (const task of state.tasks) {
      if (task.status === "pending") {
        await scheduleTaskNotifications(task);
      }
    }
  }

  function initNotificationListeners() {
    if (LocalNotifications) {
      try {
        LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
          const taskId = action.notification && action.notification.extra && action.notification.extra.taskId;
          switchTab("home");
          if (taskId) {
            highlightTask(taskId);
          }
        });

        LocalNotifications.addListener("localNotificationReceived", (notification) => {
          triggerInAppBanner(
            notification.title || "Orbital Reminder",
            notification.body || "A task deadline notification has arrived.",
            "info"
          );
        });
      } catch (e) {
        console.warn("Notification listener registration skipped:", e);
      }
    }
  }

  async function checkNotificationPermissionStatus() {
    const badge = document.getElementById("perm-status-badge");
    if (!badge) return;

    if (LocalNotifications) {
      try {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display === "granted") {
          badge.textContent = "Active";
          badge.className = "permission-badge granted";
          return;
        }
      } catch (e) {}
    } else if (typeof Notification !== "undefined") {
      if (Notification.permission === "granted") {
        badge.textContent = "Active";
        badge.className = "permission-badge granted";
        return;
      }
    }

    badge.textContent = "Needs Permission";
    badge.className = "permission-badge pending";
  }

  async function requestNotificationPermissions() {
    let granted = false;
    if (LocalNotifications) {
      try {
        const res = await LocalNotifications.requestPermissions();
        granted = res.display === "granted";
      } catch (e) {
        console.error("Capacitor request permission failed", e);
      }
    } else if (typeof Notification !== "undefined") {
      try {
        const res = await Notification.requestPermission();
        granted = res === "granted";
      } catch (e) {
        console.error("Browser notification permission failed", e);
      }
    } else {
      showToast("Notification API not supported on this platform.", "error");
      return;
    }

    checkNotificationPermissionStatus();
    if (granted) {
      showToast("Notification permissions granted!", "success");
    } else {
      showToast("Notifications were not permitted.", "error");
    }
  }

  async function sendTestNotification() {
    const title = "Orbital Test Transmission";
    const body = "Telemetry systems operational. Exact alarms calibrated.";

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
        showToast("Test notification scheduled (1.5s).", "success");
      } catch (e) {
        console.error("Failed to schedule native test notification", e);
        fallbackBrowserNotification(title, body);
      }
    } else {
      fallbackBrowserNotification(title, body);
    }

    // Also trigger in-app banner immediately for instant feedback
    triggerInAppBanner(title, body, "info");
  }

  function fallbackBrowserNotification(title, body) {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(title, { body: body, icon: "assets/logo.png" });
        showToast("Browser notification dispatched.", "success");
      } catch (e) {
        showToast("Notification simulated in-app.", "info");
      }
    } else {
      showToast("Simulated notification: " + title, "info");
    }
  }

  // --- IN-APP BANNER & AUDIO CHIME ---
  let bannerDismissTimeout = null;

  function triggerInAppBanner(title, body, type) {
    const banner = document.getElementById("inapp-reminder-banner");
    const bannerTitle = document.getElementById("inapp-banner-title");
    const bannerBody = document.getElementById("inapp-banner-body");
    const bannerIcon = document.getElementById("inapp-banner-icon");

    if (!banner || !bannerTitle || !bannerBody) return;

    bannerTitle.textContent = title;
    bannerBody.textContent = body;

    if (type === "overdue") {
      banner.classList.add("overdue-alert");
      if (bannerIcon) bannerIcon.textContent = "warning";
    } else {
      banner.classList.remove("overdue-alert");
      if (bannerIcon) bannerIcon.textContent = "rocket_launch";
    }

    banner.classList.add("show");
    playCosmicChime();

    if (bannerDismissTimeout) clearTimeout(bannerDismissTimeout);
    bannerDismissTimeout = setTimeout(() => {
      dismissInAppBanner();
    }, 7000);
  }

  function dismissInAppBanner() {
    const banner = document.getElementById("inapp-reminder-banner");
    if (banner) {
      banner.classList.remove("show");
    }
    if (bannerDismissTimeout) clearTimeout(bannerDismissTimeout);
  }

  function setupInAppBannerDismiss() {
    const btn = document.getElementById("inapp-banner-dismiss");
    if (btn) {
      btn.addEventListener("click", dismissInAppBanner);
    }
  }

  function playCosmicChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay policy might prevent sound before user interaction
    }
  }

  // --- THOUGHT BANNER & ANIMATIONS ---
  function startThoughtBanner() {
    if (bannerTimer) clearInterval(bannerTimer);
    if (typewriterTimer) clearInterval(typewriterTimer);

    const wrapper = document.getElementById("thought-banner-wrapper");
    if (!wrapper) return;

    if (!state.thoughts || state.thoughts.length === 0) {
      wrapper.style.display = "none";
      return;
    }
    wrapper.style.display = "block";

    displayCurrentThought();

    const intervalMs = (state.settings.thoughtChangeSeconds || 8) * 1000;
    bannerTimer = setInterval(() => {
      rotateToNextThought();
    }, intervalMs);
  }

  function rotateToNextThought() {
    if (!state.thoughts || state.thoughts.length === 0) return;
    currentThoughtIndex = (currentThoughtIndex + 1) % state.thoughts.length;
    displayCurrentThought();
  }

  function displayCurrentThought() {
    const textSpan = document.getElementById("thought-content-span");
    const cursor = document.getElementById("typewriter-cursor");
    if (!textSpan) return;

    if (!state.thoughts || state.thoughts.length === 0) {
      textSpan.textContent = "";
      if (cursor) cursor.style.display = "none";
      return;
    }

    const thoughtText = state.thoughts[currentThoughtIndex] || "";
    const anim = state.settings.animationType || "typewriter";

    if (typewriterTimer) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }

    if (cursor) {
      cursor.style.display = anim === "typewriter" ? "inline-block" : "none";
    }

    if (anim === "typewriter") {
      textSpan.textContent = "";
      let charIdx = 0;
      typewriterTimer = setInterval(() => {
        if (charIdx < thoughtText.length) {
          textSpan.textContent += thoughtText.charAt(charIdx);
          charIdx++;
        } else {
          clearInterval(typewriterTimer);
          typewriterTimer = null;
        }
      }, 35);
    } else if (anim === "fade") {
      textSpan.classList.add("thought-fade-out");
      setTimeout(() => {
        textSpan.textContent = thoughtText;
        textSpan.classList.remove("thought-fade-out");
        textSpan.classList.add("thought-fade-in");
        setTimeout(() => textSpan.classList.remove("thought-fade-in"), 300);
      }, 300);
    } else if (anim === "slide") {
      textSpan.classList.add("thought-slide-out");
      setTimeout(() => {
        textSpan.textContent = thoughtText;
        textSpan.classList.remove("thought-slide-out");
        textSpan.classList.add("thought-slide-in");
        setTimeout(() => textSpan.classList.remove("thought-slide-in"), 250);
      }, 250);
    } else {
      // None / static
      textSpan.textContent = thoughtText;
    }
  }

  // --- NAVIGATION ---
  function setupNavigation() {
    const navButtons = document.querySelectorAll(".nav-tab-btn");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        switchTab(tab);
      });
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;

    // Update bottom nav active classes
    const navButtons = document.querySelectorAll(".nav-tab-btn");
    navButtons.forEach((btn) => {
      if (btn.getAttribute("data-tab") === tabName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update visible view
    const views = document.querySelectorAll(".screen-view");
    views.forEach((view) => {
      if (view.id === `view-${tabName}`) {
        view.classList.add("active");
      } else {
        view.classList.remove("active");
      }
    });

    if (tabName === "home") {
      renderTasks();
      renderCounters();
    } else if (tabName === "messages") {
      populateMessagesScreen();
    } else if (tabName === "thoughts") {
      renderThoughtsList();
    } else if (tabName === "settings") {
      checkNotificationPermissionStatus();
      populateSettingsScreen();
    }
  }

  // --- SEARCH BAR ---
  function setupSearch() {
    const searchInput = document.getElementById("search-input");
    const clearBtn = document.getElementById("search-clear-btn");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) {
        clearBtn.style.display = state.searchQuery ? "flex" : "none";
      }
      renderTasks();
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        state.searchQuery = "";
        clearBtn.style.display = "none";
        searchInput.focus();
        renderTasks();
      });
    }
  }

  // --- COUNTERS & FILTERING ---
  function setupCounters() {
    const pods = document.querySelectorAll(".counter-pod");
    pods.forEach((pod) => {
      pod.addEventListener("click", () => {
        const filter = pod.getAttribute("data-filter");
        if (state.activeFilter === filter) {
          state.activeFilter = "all"; // Toggle off
        } else {
          state.activeFilter = filter;
        }
        renderCounters();
        renderTasks();
      });
    });
  }

  function renderCounters() {
    const counts = { pending: 0, done: 0, overdue: 0 };
    state.tasks.forEach((t) => {
      if (t.status === "pending") counts.pending++;
      else if (t.status === "done") counts.done++;
      else if (t.status === "overdue") counts.overdue++;
    });

    const pendingEl = document.getElementById("count-pending");
    const doneEl = document.getElementById("count-done");
    const overdueEl = document.getElementById("count-overdue");

    if (pendingEl) pendingEl.textContent = String(counts.pending).padStart(2, "0");
    if (doneEl) doneEl.textContent = String(counts.done).padStart(2, "0");
    if (overdueEl) overdueEl.textContent = String(counts.overdue).padStart(2, "0");

    // Highlight active counter
    const pods = document.querySelectorAll(".counter-pod");
    pods.forEach((pod) => {
      const f = pod.getAttribute("data-filter");
      if (f === state.activeFilter) {
        pod.classList.add("active-filter");
      } else {
        pod.classList.remove("active-filter");
      }
    });
  }

  // --- TASK RENDERING & SORTING ---
  function formatDeadlineDisplay(timestamp) {
    const d = new Date(timestamp);
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

    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;

    const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${dateStr}, ${timeStr}`;
  }

  function getTaskChipInfo(task) {
    if (task.status === "done") {
      return { label: "CALIBRATED", chipClass: "chip-done", icon: "check_circle" };
    }
    if (task.status === "overdue") {
      return { label: "OVERDUE", chipClass: "chip-overdue", icon: "warning" };
    }
    // Pending - reflect selected intensity
    const intensity = task.intensity || "medium";
    if (intensity === "high") {
      return { label: "CRITICAL", chipClass: "chip-critical", icon: "timer" };
    }
    if (intensity === "low") {
      return { label: "LOW ORBIT", chipClass: "chip-low", icon: "explore" };
    }
    return { label: "NORMAL", chipClass: "chip-normal", icon: "orbit" };
  }

  function getCardArchetypeClass(task) {
    if (task.status === "done") return "card-done";
    if (task.status === "overdue") return "card-overdue";
    const intensity = task.intensity || "medium";
    if (intensity === "high") {
      return "card-critical"; // Pale lavender hero card
    }
    if (intensity === "low") {
      return "card-low";
    }
    return "card-normal";
  }

  function renderTasks() {
    const container = document.getElementById("tasks-container");
    const emptyState = document.getElementById("tasks-empty-state");
    const radarCount = document.getElementById("tasks-radar-count");
    if (!container) return;

    // Filter tasks
    let filtered = state.tasks.filter((task) => {
      if (state.activeFilter !== "all" && task.status !== state.activeFilter) {
        return false;
      }
      if (state.searchQuery && !task.title.toLowerCase().includes(state.searchQuery)) {
        return false;
      }
      return true;
    });

    // Sort: Pending & Overdue sorted by nearest deadline first, Done tasks at bottom
    filtered.sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      return a.deadline - b.deadline;
    });

    if (radarCount) {
      radarCount.textContent = `${filtered.length} ${filtered.length === 1 ? "TASK" : "TASKS"} IN RADAR`;
    }

    if (filtered.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.style.display = "flex";
      return;
    } else {
      if (emptyState) emptyState.style.display = "none";
    }

    const now = Date.now();
    container.innerHTML = filtered
      .map((task) => {
        const archetype = getCardArchetypeClass(task);
        const chip = getTaskChipInfo(task);
        const deadlineStr = formatDeadlineDisplay(task.deadline);
        const isChecked = task.status === "done";
        const isOverdue = task.status === "overdue";

        let timeLeftText = "";
        let timeLeftIcon = "timer";
        if (isChecked) {
          timeLeftText = "Completed";
          timeLeftIcon = "done_all";
        } else if (isOverdue) {
          timeLeftText = "Trajectory Lag";
          timeLeftIcon = "history";
        } else {
          const diff = task.deadline - now;
          timeLeftText = `${formatTimeLeft(diff)} left`;
          timeLeftIcon = "timer";
        }

        return `
        <div class="task-card ${archetype}" id="task-card-${task.id}" data-id="${task.id}">
          <div class="card-top-row">
            <span class="task-chip ${chip.chipClass}">
              ${chip.label === "OVERDUE" ? '<span class="material-symbols-outlined" style="font-size: 12px;">warning</span>' : ""}
              ${chip.label}
            </span>
            <div class="task-time-left">
              <span class="material-symbols-outlined" style="font-size: 14px;">${timeLeftIcon}</span>
              <span>${timeLeftText}</span>
            </div>
          </div>

          <div class="card-main-row">
            <div class="card-content">
              <h2 class="task-title">${escapeHtml(task.title)}</h2>
              <div class="task-deadline-info">
                <span class="material-symbols-outlined" style="font-size: 15px;">schedule</span>
                <span class="task-deadline-text">${deadlineStr}</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="icon-action-btn edit-task-btn" data-id="${task.id}" title="Calibrate Task" aria-label="Edit Task" type="button">
                <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
              </button>
              <button class="icon-action-btn delete delete-task-btn" data-id="${task.id}" title="Abort Mission" aria-label="Delete Task" type="button">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
              </button>
              <button class="orbit-check-btn ${isChecked ? "checked" : ""}" data-id="${task.id}" aria-label="Toggle task status" type="button">
                <span class="material-symbols-outlined" style="font-size: 22px;">
                  ${isChecked ? "check_circle" : "radio_button_unchecked"}
                </span>
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    attachTaskCardEvents();
  }

  function attachTaskCardEvents() {
    // Check buttons
    document.querySelectorAll(".orbit-check-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        toggleTaskStatus(id);
      });
    });

    // Edit buttons
    document.querySelectorAll(".edit-task-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        openTaskModal(id);
      });
    });

    // Delete buttons
    document.querySelectorAll(".delete-task-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return;

        openConfirmDialog({
          title: "Abort Mission?",
          message: `Are you certain you want to purge mission "${task.title}" from your flight log?`,
          onConfirm: () => deleteTask(id)
        });
      });
    });
  }

  function highlightTask(taskId) {
    setTimeout(() => {
      const el = document.getElementById(`task-card-${taskId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.transform = "scale(1.04)";
        el.style.transition = "transform 0.3s ease";
        setTimeout(() => {
          el.style.transform = "scale(1)";
        }, 600);
      }
    }, 150);
  }

  // --- TASK ACTIONS ---
  async function toggleTaskStatus(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === "done") {
      // Undo done: revert to overdue if deadline passed, otherwise pending
      if (task.deadline <= Date.now()) {
        task.status = "overdue";
      } else {
        task.status = "pending";
        await scheduleTaskNotifications(task);
      }
      showToast("Mission reactivated into orbit.", "info");
    } else {
      // Mark as done
      task.status = "done";
      await cancelTaskNotifications(task);
      showToast("Mission calibrated and marked Done! 🎉", "success");
    }

    saveTasks();
    renderTasks();
    renderCounters();
  }

  async function deleteTask(taskId) {
    const idx = state.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;

    const task = state.tasks[idx];
    await cancelTaskNotifications(task);

    state.tasks.splice(idx, 1);
    saveTasks();
    renderTasks();
    renderCounters();
    showToast("Task successfully purged.", "info");
  }

  // --- TASK ADD / EDIT MODAL ---
  function setupTaskModal() {
    const fab = document.getElementById("btn-add-task");
    const closeBtn = document.getElementById("btn-task-close");
    const cancelBtn = document.getElementById("btn-task-cancel");
    const form = document.getElementById("form-task");
    const modal = document.getElementById("modal-task");
    const dateInput = document.getElementById("task-date-input");
    const timeInput = document.getElementById("task-time-input");

    if (fab) fab.addEventListener("click", () => openTaskModal());
    if (closeBtn) closeBtn.addEventListener("click", closeTaskModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeTaskModal);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeTaskModal();
      });
    }

    // Intensity selector buttons
    document.querySelectorAll(".intensity-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const intensity = btn.getAttribute("data-intensity");
        setIntensitySelection(intensity);
      });
    });

    const checkPastDeadline = () => {
      const d = dateInput.value;
      const t = timeInput.value;
      const warning = document.getElementById("task-past-warning");
      if (!warning) return;

      if (d && t) {
        const ts = new Date(`${d}T${t}`).getTime();
        if (ts < Date.now()) {
          warning.style.display = "flex";
        } else {
          warning.style.display = "none";
        }
      } else {
        warning.style.display = "none";
      }
    };

    if (dateInput) dateInput.addEventListener("change", checkPastDeadline);
    if (timeInput) timeInput.addEventListener("change", checkPastDeadline);

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await saveTaskFromModal();
      });
    }
  }

  function setIntensitySelection(intensity) {
    const hiddenInput = document.getElementById("task-intensity-input");
    if (hiddenInput) hiddenInput.value = intensity || "medium";
    document.querySelectorAll(".intensity-option-btn").forEach((btn) => {
      if (btn.getAttribute("data-intensity") === intensity) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });
  }

  function openTaskModal(taskId = null) {
    const modal = document.getElementById("modal-task");
    const titleEl = document.getElementById("modal-task-title");
    const idInput = document.getElementById("task-id-input");
    const titleInput = document.getElementById("task-title-input");
    const dateInput = document.getElementById("task-date-input");
    const timeInput = document.getElementById("task-time-input");
    const warning = document.getElementById("task-past-warning");

    if (warning) warning.style.display = "none";

    if (taskId) {
      // Editing existing task
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return;

      titleEl.textContent = "Calibrate Mission";
      idInput.value = task.id;
      titleInput.value = task.title;

      const d = new Date(task.deadline);
      dateInput.value = d.toISOString().split("T")[0];
      timeInput.value = d.toTimeString().slice(0, 5);

      setIntensitySelection(task.intensity || "medium");

      if (task.deadline < Date.now() && warning) {
        warning.style.display = "flex";
      }
    } else {
      // Creating new task
      titleEl.textContent = "Deploy Mission Task";
      idInput.value = "";
      titleInput.value = "";

      // Default to today + 2 hours
      const defaultDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
      dateInput.value = defaultDate.toISOString().split("T")[0];
      timeInput.value = defaultDate.toTimeString().slice(0, 5);

      setIntensitySelection("medium");
    }

    if (modal) modal.classList.add("active");
    setTimeout(() => {
      if (titleInput) titleInput.focus();
    }, 100);
  }

  function closeTaskModal() {
    const modal = document.getElementById("modal-task");
    if (modal) modal.classList.remove("active");
  }

  async function saveTaskFromModal() {
    const idInput = document.getElementById("task-id-input");
    const titleInput = document.getElementById("task-title-input");
    const dateInput = document.getElementById("task-date-input");
    const timeInput = document.getElementById("task-time-input");
    const intensityInput = document.getElementById("task-intensity-input");

    const title = titleInput.value.trim();
    if (!title) {
      showToast("Mission title is required.", "error");
      return;
    }

    const dateVal = dateInput.value;
    const timeVal = timeInput.value;
    if (!dateVal || !timeVal) {
      showToast("Date and time are required.", "error");
      return;
    }

    const deadline = new Date(`${dateVal}T${timeVal}`).getTime();
    if (isNaN(deadline)) {
      showToast("Invalid date or time entered.", "error");
      return;
    }

    const intensity = (intensityInput && intensityInput.value) || "medium";
    const now = Date.now();
    const isPast = deadline <= now;
    const existingId = idInput.value;

    if (existingId) {
      // Update existing
      const task = state.tasks.find((t) => t.id === existingId);
      if (!task) return;

      task.title = title;
      task.deadline = deadline;
      task.intensity = intensity;

      if (isPast) {
        task.status = "overdue";
        await cancelTaskNotifications(task);
      } else {
        // If it was overdue and deadline moved to future, status reverts to pending
        task.status = "pending";
        await scheduleTaskNotifications(task);
      }

      showToast("Mission recalibrated successfully.", "success");
    } else {
      // Create new
      const newTask = {
        id: "task-" + Date.now(),
        title: title,
        deadline: deadline,
        intensity: intensity,
        status: isPast ? "overdue" : "pending",
        createdAt: now,
        notificationIds: []
      };

      state.tasks.push(newTask);
      if (!isPast) {
        await scheduleTaskNotifications(newTask);
      }

      showToast("New mission deployed into orbit!", "success");
    }

    saveTasks();
    closeTaskModal();
    renderTasks();
    renderCounters();
  }

  // --- MESSAGES SCREEN (COMM) ---
  function setupMessagesScreen() {
    const beforeArea = document.getElementById("msg-before-deadline");
    const overdueArea = document.getElementById("msg-overdue");
    const saveBtn = document.getElementById("btn-save-messages");
    const resetBtn = document.getElementById("btn-reset-messages");
    const warningInput = document.getElementById("input-warning-minutes");
    const gapInput = document.getElementById("input-repeat-gap");

    // Track active textarea for chip insertions
    if (beforeArea) {
      beforeArea.addEventListener("focus", () => (state.lastFocusedTextarea = beforeArea));
      beforeArea.addEventListener("input", updateMessageLivePreview);
    }
    if (overdueArea) {
      overdueArea.addEventListener("focus", () => (state.lastFocusedTextarea = overdueArea));
      overdueArea.addEventListener("input", updateMessageLivePreview);
    }

    // Placeholder chips insertion
    document.querySelectorAll(".placeholder-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const targetId = chip.getAttribute("data-target");
        const placeholder = chip.getAttribute("data-insert");
        const textarea = document.getElementById(targetId);
        insertPlaceholderAtCursor(textarea || state.lastFocusedTextarea, placeholder);
      });
    });

    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const bVal = beforeArea.value.trim();
        const oVal = overdueArea.value.trim();
        const wVal = parseInt(warningInput.value, 10);
        const gVal = parseInt(gapInput.value, 10);

        if (!bVal || !oVal) {
          showToast("Message templates cannot be empty.", "error");
          return;
        }

        state.settings.messages.beforeDeadline = bVal;
        state.settings.messages.overdue = oVal;
        state.settings.warningMinutes = isNaN(wVal) || wVal < 1 ? 15 : wVal;
        state.settings.repeatGapMinutes = isNaN(gVal) || gVal < 5 ? 30 : gVal;

        saveSettings();
        await rescheduleAllPendingTasks();
        showToast("Reminder engine settings saved & rescheduled.", "success");
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        openConfirmDialog({
          title: "Reset Message Defaults?",
          message: "Restore default reminder message formats and timing intervals?",
          onConfirm: async () => {
            fallbackSettings();
            populateMessagesScreen();
            await rescheduleAllPendingTasks();
            showToast("Messages reset to default parameters.", "info");
          }
        });
      });
    }
  }

  function populateMessagesScreen() {
    const beforeArea = document.getElementById("msg-before-deadline");
    const overdueArea = document.getElementById("msg-overdue");
    const warningInput = document.getElementById("input-warning-minutes");
    const gapInput = document.getElementById("input-repeat-gap");

    if (beforeArea) beforeArea.value = state.settings.messages.beforeDeadline || "";
    if (overdueArea) overdueArea.value = state.settings.messages.overdue || "";
    if (warningInput) warningInput.value = state.settings.warningMinutes || 15;
    if (gapInput) gapInput.value = state.settings.repeatGapMinutes || 30;

    updateMessageLivePreview();
  }

  function insertPlaceholderAtCursor(textarea, textToInsert) {
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const current = textarea.value;

    textarea.value = current.substring(0, start) + textToInsert + current.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    textarea.focus();
    updateMessageLivePreview();
  }

  function updateMessageLivePreview() {
    const beforeArea = document.getElementById("msg-before-deadline");
    const overdueArea = document.getElementById("msg-overdue");
    const prevBefore = document.getElementById("preview-before-text");
    const prevOverdue = document.getElementById("preview-overdue-text");

    const sampleTask = { title: "Deploy Lunar Rover Sensor Patch" };
    const sampleThought = getRandomThought();

    if (prevBefore && beforeArea) {
      const text = beforeArea.value || "";
      prevBefore.textContent = text
        .replace(/{task}/g, sampleTask.title)
        .replace(/{time_left}/g, "15 minutes")
        .replace(/{thought}/g, sampleThought);
    }

    if (prevOverdue && overdueArea) {
      const text = overdueArea.value || "";
      prevOverdue.textContent = text
        .replace(/{task}/g, sampleTask.title)
        .replace(/{time_left}/g, "0 minutes")
        .replace(/{thought}/g, sampleThought);
    }
  }

  // --- THOUGHTS SCREEN (SYNAPSE) ---
  function setupThoughtModal() {
    const addBtn = document.getElementById("btn-open-add-thought");
    const closeBtn = document.getElementById("btn-thought-close");
    const cancelBtn = document.getElementById("btn-thought-cancel");
    const form = document.getElementById("form-thought");
    const modal = document.getElementById("modal-thought");

    if (addBtn) addBtn.addEventListener("click", () => openThoughtModal());
    if (closeBtn) closeBtn.addEventListener("click", closeThoughtModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeThoughtModal);

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeThoughtModal();
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        saveThoughtFromModal();
      });
    }
  }

  function renderThoughtsList() {
    const container = document.getElementById("thoughts-list-container");
    const countLabel = document.getElementById("thoughts-count-label");
    if (!container) return;

    if (countLabel) {
      countLabel.textContent = `${state.thoughts.length} ${state.thoughts.length === 1 ? "THOUGHT" : "THOUGHTS"} STORED`;
    }

    if (state.thoughts.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="padding: 24px;">
          <p class="empty-desc">Your neural repository is empty. Add thoughts to illuminate the cockpit banner.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = state.thoughts
      .map(
        (thought, idx) => `
      <div class="thought-item-card">
        <span class="thought-item-text">“${escapeHtml(thought)}”</span>
        <div style="display: flex; gap: 8px; flex-shrink: 0;">
          <button class="icon-action-btn edit-thought-btn" data-index="${idx}" aria-label="Edit Thought" type="button">
            <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
          </button>
          <button class="icon-action-btn delete delete-thought-btn" data-index="${idx}" aria-label="Delete Thought" type="button">
            <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // Attach actions
    container.querySelectorAll(".edit-thought-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        openThoughtModal(idx);
      });
    });

    container.querySelectorAll(".delete-thought-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        openConfirmDialog({
          title: "Purge Thought?",
          message: "Delete this thought from your synaptic memory bank?",
          onConfirm: () => {
            state.thoughts.splice(idx, 1);
            saveThoughts();
            renderThoughtsList();
            startThoughtBanner();
            showToast("Thought purged.", "info");
          }
        });
      });
    });
  }

  function openThoughtModal(thoughtIndex = null) {
    const modal = document.getElementById("modal-thought");
    const titleEl = document.getElementById("modal-thought-title");
    const idInput = document.getElementById("thought-id-input");
    const textInput = document.getElementById("thought-text-input");

    if (thoughtIndex !== null && thoughtIndex >= 0) {
      titleEl.textContent = "Calibrate Thought";
      idInput.value = String(thoughtIndex);
      textInput.value = state.thoughts[thoughtIndex] || "";
    } else {
      titleEl.textContent = "New Synaptic Thought";
      idInput.value = "";
      textInput.value = "";
    }

    if (modal) modal.classList.add("active");
    setTimeout(() => {
      if (textInput) textInput.focus();
    }, 100);
  }

  function closeThoughtModal() {
    const modal = document.getElementById("modal-thought");
    if (modal) modal.classList.remove("active");
  }

  function saveThoughtFromModal() {
    const idInput = document.getElementById("thought-id-input");
    const textInput = document.getElementById("thought-text-input");

    const text = textInput.value.trim();
    if (!text) {
      showToast("Thought content cannot be empty.", "error");
      return;
    }

    const idxStr = idInput.value;
    if (idxStr !== "") {
      const idx = parseInt(idxStr, 10);
      state.thoughts[idx] = text;
      showToast("Thought updated in neural network.", "success");
    } else {
      state.thoughts.unshift(text);
      showToast("New thought uploaded to cockpit.", "success");
    }

    saveThoughts();
    closeThoughtModal();
    renderThoughtsList();
    startThoughtBanner();
  }

  // --- SETTINGS SCREEN (PROTOCOL) ---
  function setupSettingsScreen() {
    // Animation picker buttons
    document.querySelectorAll(".anim-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const anim = btn.getAttribute("data-anim");
        state.settings.animationType = anim;
        saveSettings();
        updateAnimButtons();
        displayCurrentThought();
        showToast(`Thought banner set to ${anim} mode.`, "info");
      });
    });

    // Slider for thought change seconds
    const slider = document.getElementById("slider-thought-seconds");
    const badge = document.getElementById("badge-thought-seconds");
    if (slider && badge) {
      slider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        badge.textContent = `${val}s`;
        state.settings.thoughtChangeSeconds = val;
        saveSettings();
        startThoughtBanner();
      });
    }

    // Permission button
    const permBtn = document.getElementById("btn-request-perms");
    if (permBtn) permBtn.addEventListener("click", requestNotificationPermissions);

    // Test notification button
    const testBtn = document.getElementById("btn-test-notification");
    if (testBtn) testBtn.addEventListener("click", sendTestNotification);

    // Reset everything button
    const resetAllBtn = document.getElementById("btn-reset-all");
    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", () => {
        openConfirmDialog({
          title: "Factory Reset All Systems?",
          message: "This will completely erase all tasks, custom thoughts, and restored default settings. Cannot be undone.",
          onConfirm: () => resetEverything()
        });
      });
    }
  }

  function populateSettingsScreen() {
    updateAnimButtons();

    const slider = document.getElementById("slider-thought-seconds");
    const badge = document.getElementById("badge-thought-seconds");
    if (slider && badge) {
      const val = state.settings.thoughtChangeSeconds || 8;
      slider.value = val;
      badge.textContent = `${val}s`;
    }
  }

  function updateAnimButtons() {
    const curAnim = state.settings.animationType || "typewriter";
    document.querySelectorAll(".anim-option-btn").forEach((btn) => {
      if (btn.getAttribute("data-anim") === curAnim) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });
  }

  async function resetEverything() {
    // Cancel all scheduled notifications
    for (const t of state.tasks) {
      await cancelTaskNotifications(t);
    }

    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.THOUGHTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);

    loadSettings();
    loadThoughts();
    loadTasks();

    renderAll();
    startThoughtBanner();
    showToast("Cockpit systems fully restored to factory state.", "success");
  }

  // --- CONFIRMATION MODAL ---
  function setupConfirmModal() {
    const modal = document.getElementById("modal-confirm");
    const cancelBtn = document.getElementById("btn-confirm-cancel");
    const okBtn = document.getElementById("btn-confirm-ok");

    if (cancelBtn) cancelBtn.addEventListener("click", closeConfirmDialog);
    if (okBtn) {
      okBtn.addEventListener("click", () => {
        if (typeof onConfirmCallback === "function") {
          onConfirmCallback();
        }
        closeConfirmDialog();
      });
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeConfirmDialog();
      });
    }
  }

  function openConfirmDialog({ title, message, onConfirm }) {
    const modal = document.getElementById("modal-confirm");
    const titleEl = document.getElementById("confirm-modal-title");
    const msgEl = document.getElementById("confirm-modal-msg");

    if (titleEl) titleEl.textContent = title || "Confirm Action";
    if (msgEl) msgEl.textContent = message || "Are you sure you want to proceed?";

    onConfirmCallback = onConfirm;
    if (modal) modal.classList.add("active");
  }

  function closeConfirmDialog() {
    const modal = document.getElementById("modal-confirm");
    if (modal) modal.classList.remove("active");
    onConfirmCallback = null;
  }

  // --- TOAST SYSTEM ---
  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "info";
    if (type === "success") icon = "check_circle";
    if (type === "error") icon = "error";

    toast.innerHTML = `
      <span class="material-symbols-outlined toast-icon" style="font-size: 18px;">${icon}</span>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(16px)";
      toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2800);
  }

  // --- RENDER ALL & HELPERS ---
  function renderAll() {
    renderCounters();
    renderTasks();
    updateFooterCredits();
    updateAppVersion();
  }

  function updateAppVersion() {
    const version = (window.CONFIG && window.CONFIG.version) || "V 1.0.3";
    const badgeEl = document.getElementById("app-version-badge");
    if (badgeEl) badgeEl.textContent = version;
    const subtitleEl = document.getElementById("app-version-subtitle");
    if (subtitleEl) subtitleEl.textContent = `MISSION CONTROL • ${version}`;
  }

  function updateFooterCredits() {
    const footerText = (window.CONFIG && window.CONFIG.footerText) || "ORBITAL PRODUCTIVITY PROTOCOL • MADE BY SAMEER";
    const footEl = document.getElementById("protocol-footer");
    if (footEl) footEl.textContent = footerText;
    const navTag = document.getElementById("nav-protocol-tag");
    if (navTag) navTag.textContent = footerText;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
