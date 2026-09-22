# 🚀 Hackathon Arena 2.0 — Real-Time Competitive Coding Platform

A modern, enterprise-grade competitive coding and hackathon management platform engineered with **React 19**, **TypeScript**, **TailwindCSS 4**, **Vite**, and an **Express Backend**.

---

## 🌟 Key Features

### 👨‍💼 1. Admin Management Suite
- **Contest Lifecycle Management**: Create, schedule, publish, edit, and monitor hackathons with dynamic duration calculation and access code generation.
- **Faculty Multi-Assignment**: Assign one or multiple faculty supervisors to specific contests with strict role-based access control (RBAC).
- **Question Calibration Matrix**: Manage adaptive algorithmic challenges across 10 progressive difficulty tiers with automated test case validation.
- **Live Anomaly & Integrity Center**: Real-time fraud detection, multi-IP concurrency tracking, and session intervention capabilities.
- **Comprehensive Reporting**: Generate and export official contest final standings, submission audit logs, and attendance dossiers.

### 👩‍🏫 2. Faculty Supervision & Proctorship
- **Contest Switcher & Scoped Telemetry**: Faculty supervisors view and manage only contests assigned to them by administrators.
- **Live Student Monitoring**: Real-time tracking of active student sessions, question progression, execution times, and memory metrics.
- **Intervention Controls**: Broadcast announcements, send individual supervisor warnings, or pause/terminate suspicious exam sessions.
- **Cohort Analytics & Supervision Dossiers**: In-depth score progression, success rate distributions, and submission audits.

### 🧑‍💻 3. Student Contest Arena
- **Access Code Gate**: Join published hackathons using secure contest access codes.
- **Interactive Monaco IDE**: Full-featured code editor with syntax highlighting, autocomplete, and sample test runners.
- **Adaptive Difficulty Engine**: Dynamic difficulty scaling based on student problem-solving speed and accuracy.
- **Live Scoreboard & Timer**: Synchronized contest countdown and real-time rank updates.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, React Router v7, Lucide React, Motion, Monaco Editor
- **Styling**: TailwindCSS 4, CSS Glassmorphism, Dark/Light Mode Theme Engine
- **Backend**: Node.js, Express, TypeScript (`tsx`), JWT Authentication, Server-Sent Events (SSE)
- **Tooling**: Vite 6, esbuild, npm

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm**: v9+

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/JAYENDRAMAJJI/hackathon-platform.git

# Navigate to project root
cd hackathon-platform

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file (or copy from `.env.example`):
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

The unified frontend & backend server will be available at:
- **Web Platform**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
- **Faculty Dashboard**: [http://localhost:3000/faculty/dashboard](http://localhost:3000/faculty/dashboard)
- **Student Dashboard**: [http://localhost:3000/student/dashboard](http://localhost:3000/student/dashboard)

---

## 🔑 Demo Credentials

| Role | Email / Identifier | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hackarena.edu` *(or `admin@hackathon.com`)* | `Pass@123` |
| **Faculty** | `faculty@hackarena.edu` *(or `faculty@hackathon.com`)* | `Pass@123` |
| **Student** | `student@hackarena.edu` *(or `student@hackathon.com`)* | `Pass@123` |

---

## 📦 Scripts

- `npm run dev`: Start the full-stack development server on port 3000
- `npm run lint`: Run TypeScript type-checking (`tsc --noEmit`)
- `npm run build`: Build production frontend bundle and server bundle
- `npm start`: Start the production server from compiled assets

---

## 📄 License
This project is proprietary and confidential for competitive hackathon operations.
