# 🏋️‍♂️ GymTracker Pro

GymTracker Pro is a premium, high-performance, installable mobile web application (PWA) designed specifically as a distraction-free workout companion for real-time tracking in the gym. Built for speed, efficiency, and offline-first reliability.

Developed by **Younes Sadir** for personal daily gym tracking.

---

## 🌟 Core Features

- **⚡ Quick Log Mode**: Fast keypad logging. Double-tap enter to instantly log reps and advance to the next set. Inputs auto-select current weight/reps on focus for immediate overwrites.
- **🕒 Circular Rest Timer HUD**: Automatically starts after logging a set. Minimizable into a floating bubble in the bottom-right corner. Features mobile vibration pulses (Vibration API) and synthetic frequency beeps (Web Audio API) when complete.
- **📱 Immersive Focus Mode**: A fullscreen, high-contrast, distraction-free view showing a giant exercise card with large inputs and dedicated log buttons. Perfect for one-handed usage on the gym floor.
- **📈 Progression Analytics**:
  - **One-Rep Max (1RM)**: Strength capacity estimations using the Brzycki index.
  - **Bodyweight Progression**: Logs weight with optional photo snapshots and automatically calculates 7-day and 30-day moving averages.
  - **Progression Charts**: Custom-drawn glowing SVG line curves and weekly muscle load volume distribution pie charts.
- **💾 Offline-First PWA**: Fully functional offline. Workouts logged while offline are queued locally and automatically synchronized to the database when connection is restored.
- **🔄 Smart Split Management**: Configured with a modern bodybuilding-focused **PPL/PP split** (Push 1, Pull, Legs, Push 2, Pull 2) with calves distributed 3x weekly across Push 1, Legs, and Pull 2.

---

## 🛠️ Technology Stack

- **Frontend**: React (JS/TS), Vite, Redux Toolkit, Tailwind CSS, Lucide Icons, Workbox PWA.
- **Backend**: Laravel API.
- **Hosting**: Vercel (Frontend) & Netlify-ready single-page application router fallback rules.

---

## 📲 Installation Instructions (PWA)

### iOS (Safari)
1. Open the deployed URL in Safari on your iPhone.
2. Tap the **Share** button in the Safari footer.
3. Scroll down and tap **"Add to Home Screen"**.
4. Launch GymTracker Pro from your home screen in standalone fullscreen mode.

### Android (Chrome)
1. Open the deployed URL in Chrome.
2. Click the custom bottom install prompt or tap the three dots menu at the top-right.
3. Select **"Install App"**.
4. Launch it directly from your app drawer.

---

## 🚀 Local Development Setup

1. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. **Backend Setup**:
   ```bash
   cd backend
   composer install
   php artisan serve
   ```

---

## 🌍 Deployed Hosting

- **Frontend**: Deployed on Vercel with automatic redirects and SPA fallback routing configured in `vercel.json`.
- **Offline Sync**: Auto-connection listeners handle background data synchronization to the Laravel API endpoint.
