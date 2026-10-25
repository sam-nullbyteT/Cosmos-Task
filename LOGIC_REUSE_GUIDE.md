# Universal Task Logic Engine — Architecture & Reuse Guide

> **File Location:** `task-logic-engine.js`  
> **Type:** Universal Standalone JavaScript Module (Browser UMD, ES6 Module, CommonJS)  
> **Dependencies:** **Zero external libraries** (pure vanilla JS + Web Audio API + optional Capacitor LocalNotifications plugin)

---

## 1. What Logic Is Included in `task-logic-engine.js`

Every piece of application and business logic from this app is encapsulated into modular classes inside this single file:

| Component | Class / Object | Responsibilities & Logic Included |
| :--- | :--- | :--- |
| **Main Engine Facade** | `TaskLogicEngine` | Coordinates all sub-engines, manages settings, runs the 1-minute background status ticker, handles factory reset, and provides JSON import/export. |
| **Task State & Lifecycle** | `TaskStore` | Complete task CRUD, automatic overdue state transitions (`deadline <= now`), status toggling (`done` ⇄ `pending`/`overdue`), real-time search queries, priority sorting (urgent first, completed at bottom), and counter metrics calculation. |
| **Multi-Tier Notification Engine** | `NotificationEngine` | Computes 3-stage alarms: **Pre-deadline warning** (e.g. 15m before), **Exact deadline alert**, and **N overdue nudges** (every 30m). Generates positive 32-bit integer IDs for Android/Capacitor, fills dynamic template placeholders (`{task}`, `{time_left}`, `{thought}`), and manages permission checks. |
| **Synaptic Quotes / Thoughts** | `ThoughtEngine` | Bundles **104 literature and philosophy quotes**, manages banner rotation timers, provides character-by-character typewriter animation logic, and handles user custom quotes. |
| **Cosmic Audio Chime** | `AudioEngine` | Pure Web Audio API synthesizer generating a dual-tone ascending chime (D5: 587Hz → A5: 880Hz) with exponential volume decay. **No audio files or .mp3 downloads required!** |
| **Time & Display Helpers** | `TimeUtils` | Formats timestamps into human relative labels (`"Today, 14:30"`, `"Tomorrow"`, `"Yesterday"`), calculates remaining duration (`"2h 15m left"`, `"Trajectory Lag"`), maps intensity levels to chip styles, and provides HTML escaping. |
| **Default Settings & Repository** | `DEFAULT_CONFIG`, `DEFAULT_THOUGHTS` | Clean fallback configurations and full 104-quote neural thought repository. |

---

## 2. How to Use in Your Next Project

### Option A: Vanilla HTML & JavaScript

1. Copy `task-logic-engine.js` into your new project folder.
2. Include it in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Next Todo App</title>
</head>
<body>
  <h1 id="stats"></h1>
  <ul id="task-list"></ul>

  <script src="./task-logic-engine.js"></script>
  <script>
    // 1. Initialize the engine
    const engine = new window.TaskLogicEngine();

    async function start() {
      await engine.init();

      // 2. React to any state change (task added, deleted, toggled, or overdue)
      engine.subscribe(() => render());

      // 3. Listen for overdue alarms
      engine.on('task:overdue_alert', ({ task, title }) => {
        alert(`${title}: ${task.title}`);
      });

      render();
    }

    function render() {
      // Get counts
      const counts = engine.tasks.getCounters();
      document.getElementById('stats').textContent = 
        `Pending: ${counts.pending} | Done: ${counts.done} | Overdue: ${counts.overdue}`;

      // Get sorted & filtered tasks
      const tasks = engine.tasks.query({ filter: 'all' });
      const listEl = document.getElementById('task-list');
      listEl.innerHTML = tasks.map(t => `
        <li>
          <strong>${window.TimeUtils.escapeHtml(t.title)}</strong> 
          — [${t.status.toUpperCase()}] 
          — Due: ${window.TimeUtils.formatDeadlineDisplay(t.deadline)}
          <button onclick="engine.tasks.toggleTaskStatus('${t.id}')">Toggle</button>
          <button onclick="engine.tasks.deleteTask('${t.id}')">Delete</button>
        </li>
      `).join('');
    }

    start();
  </script>
</body>
</html>
```

---

### Option B: React / Next.js

1. Copy `task-logic-engine.js` to `src/services/task-logic-engine.js` (or `lib/task-logic-engine.js`).
2. Create a custom hook:

```jsx
// src/hooks/useTaskEngine.js
import { useState, useEffect, useRef } from 'react';
import { TaskLogicEngine, TimeUtils } from '../services/task-logic-engine';

export function useTaskEngine(customConfig = {}) {
  const engineRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [counters, setCounters] = useState({ total: 0, pending: 0, done: 0, overdue: 0 });
  const [activeThought, setActiveThought] = useState('');

  useEffect(() => {
    const engine = new TaskLogicEngine(customConfig);
    engineRef.current = engine;

    engine.init().then(() => {
      setTasks(engine.tasks.query());
      setCounters(engine.tasks.getCounters());
      setActiveThought(engine.thoughts.getCurrentThought());

      // Rotate thoughts
      engine.thoughts.startRotation((thought) => setActiveThought(thought));
    });

    // Auto-update React state on any task modification
    const unsubscribe = engine.subscribe(() => {
      setTasks(engine.tasks.query());
      setCounters(engine.tasks.getCounters());
    });

    return () => {
      unsubscribe();
      engine.stopStatusMonitor();
      engine.thoughts.stopRotation();
    };
  }, []);

  return {
    engine: engineRef.current,
    tasks,
    counters,
    activeThought,
    TimeUtils
  };
}
```

3. Use in your component:

```jsx
// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { useTaskEngine } from '../hooks/useTaskEngine';

export default function Dashboard() {
  const { engine, tasks, counters, activeThought, TimeUtils } = useTaskEngine();
  const [title, setTitle] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title) return;
    await engine.tasks.createTask({
      title,
      deadline: Date.now() + 2 * 60 * 60 * 1000, // 2 hours from now
      intensity: 'high'
    });
    setTitle('');
  };

  return (
    <div style={{ padding: 20 }}>
      <blockquote>{activeThought}</blockquote>
      <p>Pending: {counters.pending} | Overdue: {counters.overdue} | Done: {counters.done}</p>

      <form onSubmit={handleAdd}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mission Title" />
        <button type="submit">Add Mission</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span>{task.title} ({TimeUtils.formatDeadlineDisplay(task.deadline)})</span>
            <button onClick={() => engine.tasks.toggleTaskStatus(task.id)}>Toggle</button>
            <button onClick={() => engine.tasks.deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Option C: Vue 3 (Composition API)

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { TaskLogicEngine, TimeUtils } from './task-logic-engine.js';

const engine = new TaskLogicEngine();
const tasks = ref([]);
const counters = ref({});
const currentThought = ref('');

onMounted(async () => {
  await engine.init();
  refresh();

  engine.subscribe(() => refresh());
  engine.thoughts.startRotation((t) => { currentThought.value = t; });
});

onUnmounted(() => {
  engine.stopStatusMonitor();
  engine.thoughts.stopRotation();
});

function refresh() {
  tasks.value = engine.tasks.query();
  counters.value = engine.tasks.getCounters();
}
</script>

<template>
  <div class="app">
    <div class="banner">{{ currentThought }}</div>
    <div class="stats">Done: {{ counters.done }} / {{ counters.total }}</div>
    <div v-for="task in tasks" :key="task.id" class="card">
      <h3>{{ task.title }}</h3>
      <p>{{ TimeUtils.formatDeadlineDisplay(task.deadline) }}</p>
      <button @click="engine.tasks.toggleTaskStatus(task.id)">Check</button>
    </div>
  </div>
</template>
```

---

### Option D: Capacitor Mobile App (Android / iOS)

If you are wrapping your project in **Capacitor**:
1. Install the Local Notifications plugin:
   ```bash
   npm install @capacitor/local-notifications
   npx cap sync
   ```
2. The `TaskLogicEngine` **automatically detects** `window.Capacitor.Plugins.LocalNotifications` without any extra setup!
3. To request permissions from a button:
   ```javascript
   await engine.notifications.requestPermission();
   ```
4. All multi-tier alarms (warning, deadline, overdue nudges) will automatically use native Android/iOS system alarms!

---

## 3. Core API Quick Reference

### Task Management (`engine.tasks`)
- `engine.tasks.createTask({ title, deadline, intensity })`: Creates, saves, and schedules notifications.
- `engine.tasks.updateTask(taskId, updates)`: Updates title, deadline, or intensity. Automatically reschedules alarms.
- `engine.tasks.toggleTaskStatus(taskId)`: Toggles between Done and Pending/Overdue.
- `engine.tasks.deleteTask(taskId)`: Cancels notifications and deletes from storage.
- `engine.tasks.query({ filter: 'all' | 'pending' | 'done' | 'overdue', searchQuery: '' })`: Returns sorted list.
- `engine.tasks.getCounters()`: Returns `{ total, pending, done, overdue, completionRate }`.

### Notification Engine (`engine.notifications`)
- `engine.notifications.scheduleForTask(task)`: Computes and schedules all 3 alarm stages.
- `engine.notifications.cancelForTask(task)`: Cancels all scheduled alerts.
- `engine.notifications.requestPermission()`: Prompts system notification permission dialog.
- `engine.notifications.sendTestNotification()`: Fires test alert in 1.5 seconds.
- `engine.notifications.fillPlaceholders(template, task, timeLeftStr)`: Injects dynamic values into strings.

### Quotes & Banner (`engine.thoughts`)
- `engine.thoughts.getRandomThought()`: Returns a random quote.
- `engine.thoughts.getCurrentThought()`: Returns current active rotating quote.
- `engine.thoughts.startRotation(callback)`: Starts rotation timer.
- `engine.thoughts.typewriter(text, onCharCallback, speedMs)`: Triggers character-by-character typing.
- `engine.thoughts.addThought(text)` / `updateThought(idx, text)` / `deleteThought(idx)`: Manages custom quotes.

### Audio & Sound FX (`engine.audio`)
- `engine.audio.playCosmicChime()`: Plays the dual-tone synthesizer alert (no audio files needed).

### Data & Settings (`engine`)
- `engine.updateSettings({ warningMinutes, repeatGapMinutes, ... })`: Updates config and reschedules alarms.
- `engine.exportJSON()`: Exports full database backup as JSON string.
- `engine.importJSON(jsonString)`: Restores database from backup JSON.
- `engine.resetAll()`: Factory reset.
- `engine.subscribe(callback)`: Reacts to any store update.
