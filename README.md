---
name: ZenithFlow
version: 2.0.0
description: Intelligent productivity workspace integrated with physical fitness tracking, heatmaps, and conversational AI coaching.
author: Paramjit Singh
license: Proprietary (All Rights Reserved)
private: true
tech_stack:
  - Next.js (App Router)
  - Supabase (PostgreSQL & Auth)
  - Express.js (Node.js API Service)
  - Groq AI (Llama 3.3 completions)
  - Tailwind CSS & Framer Motion
---

<p align="center">
  <img src="public/logo.jpg" alt="ZenithFlow Logo" width="120" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(96, 104, 240, 0.25);" />
</p>

<h1 align="center">ZenithFlow — Intelligent Productivity OS</h1>

<p align="center">
  <b>A unified mental focus and physical health workspace combining task planning, workout volumes, biometrics widgets, mood tracking, and custom AI cognitive coaching.</b>
</p>

<p align="center">
  <a href="#license">
    <img src="https://img.shields.io/badge/license-proprietary-red?style=for-the-badge" alt="License: Proprietary" />
  </a>
  <img src="https://img.shields.io/badge/version-2.0.0-6068F0?style=for-the-badge" alt="Version 2.0.0" />
  <img src="https://img.shields.io/badge/next.js-16.2-black?style=for-the-badge" alt="Next.js" />
  <img src="https://img.shields.io/badge/supabase-emerald?style=for-the-badge" alt="Supabase" />
</p>

---

## 🚀 Key Modules & Features

### 1. 🎯 Sprint Planner & OKR Goals
* **Task Manager:** Set active tasks, filter by completed status, and log exact completion times.
* **OKR Dashboard:** Interactive timeline goal tracker showing percentage increments and days remaining.

### 2. 🏋️ Gym Workouts Logger
* **Exercise Log:** Track weights, reps, sets, and RPE (Rate of Perceived Exertion).
* **Chest/Back Routine Splits:** Dynamically computes total volume metrics for chest and back workouts.

### 3. 💧 Biometrics Logger (Snack & Fluid Widgets)
* **Quick Intake Logger:** One-click shortcuts for adding water (+0.25L) or calorie snacks (+100 kcal).
* **Database Subtraction Handler:** Clicking minus (-) queries today's entries to update or delete rows, preventing database clutter or negative logs.

### 4. 📊 Habits Heatmap Consistency Grid
* **Analytics Heatmap:** Displays daily performance and consistency indicators.
* **Glow Ring Highlight:** Rings today's grid cell with a violet spotlight to keep you accountable.
* **Completion Analytics:** Tracks tasks completed *today* (even if created in the past) to build your consistency score.

### 5. 📓 Mindfulness Journal & Reflection
* **Mood Logger:** Quick mood trackers combined with text journals.
* **Mindfulness Advice:** Integrated AI suggestions based on your daily entry.

### 6. 📱 Progressive Web App (PWA)
* **Install Prompt:** In-app PWA install trigger card and floating badges.
* **Service Worker Caching:** Stale-while-revalidate strategy for static resources.
* **Dev Bypass:** Clean local unregistration to prevent dev HMR infinite reload loops.

---

## 🔒 Subscription Tiers (Free vs. Pro)

* **Default Tier:** New users are automatically initialized on the **Free Tier**.
* **AI Coach Paywalls:** The conversable AI Coach chatbot (`/ai-coach`) and dashboard Coach Insights card are locked behind a Pro paywall.
* **Simulated Checkout:** Built-in purchase simulator on the `/pricing` page. Logged-in users can click "Upgrade to Pro" to trigger a simulated transaction that updates their plan to `pro` in Supabase, unlocks all AI coaching features, and redirects to the dashboard.
* **Admin Management:** Active plans can be updated by administrators in the profiles database to switch user states.

---

## 🛠️ Technical Architecture

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts
* **Backend:** Express.js REST API Server, TypeScript
* **Database & Auth:** Supabase (Auth sessions, PostgreSQL, Row Level Security policies)
* **AI Engine:** Groq API (Llama-3.3-70b-versatile, prompt optimized for conversational human-like messaging)

---

## 💻 Local Setup & Installation

### 1. Environment Configurations
Create a `.env.local` file in the root of the `momentum/` folder:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_GROQ_API_KEY="your-groq-api-key"
```

Create a `.env` file in the `momentum/server/` folder:

```env
PORT=5000
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 2. Run the Express Backend
Navigate to the server directory, install dependencies, and start the development server:

```bash
cd server
npm install
npm run dev
```

### 3. Run the Next.js Frontend
In a new terminal window, navigate to the main directory, install dependencies, and start the app:

```bash
npm install
npm run dev
```

---

## 📝 License

<a name="license"></a>

**Copyright (c) 2026 Paramjit Singh. All rights reserved.**

This software and all associated source files are **Proprietary and Confidential**. 

* **No Copying:** Unauthorized copying, cloning, hosting, duplication, or distribution of this code or any portion of this repository via any medium is strictly prohibited.
* **Commercial Restraints:** No commercial usage or white-labeling is permitted.
* **Copyright Notice:** This copyright notice must remain intact on all copies of this project.

*For inquiries or licensing agreements, contact Paramjit Singh directly.*
