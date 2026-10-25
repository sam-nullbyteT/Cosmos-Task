# Cosmos-Task 🚀

CosmoTask is a futuristic, neumorphic orbital task management and productivity application designed for Web and Android (powered by Capacitor).

## ✨ Features

- **Orbital Neumorphic Design**: Sleek dark space aesthetic with tactile neumorphic controls, dynamic gradients, and fluid micro-animations.
- **Task Management**: Prioritization (Critical, Moderate, Low), categorization, deadline scheduling, sub-steps, and progress tracking.
- **Smart Reminders & Alerts**: Automated deadline warning notifications and overdue reminders powered by `@capacitor/local-notifications`.
- **Cosmic Thought Rotator**: Dynamic motivational banner rotating inspiring thoughts and quotes with configurable animation styles (typewriter, fade, slide).
- **Customizable Configuration**: Easy tuning via `config.js` and `thoughts.js` for notification timings, author credits, and thought feeds.
- **Cross-Platform**: Run locally as a lightweight web app or build as a native Android APK via Capacitor.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Neumorphic design system), JavaScript (ES6+)
- **Mobile Engine**: Capacitor 7 (Android, Local Notifications)
- **Audio Feedback**: Custom synthesizer / sound chimes for task completion

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- (For Android build) Android Studio and Android SDK

### Running Web Version Locally

```bash
# Clone the repository
git clone https://github.com/sam-nullbyteT/Cosmos-Task.git
cd Cosmos-Task

# Install dependencies
npm install

# Start local preview
npm start
```
Open your browser and navigate to `http://localhost:8080`.

### Building for Android

```bash
# Copy web assets to www/
npm run copy:www

# Sync with Capacitor Android platform
npm run sync

# Open project in Android Studio
npm run open:android
```

From Android Studio, build and run directly on your connected Android device or emulator.

---

**Author**: Sameer  
*ORBITAL PRODUCTIVITY PROTOCOL*