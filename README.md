# 🚀 Hackathon Arena 2.0 — Real-Time Competitive Coding Platform

A modern, enterprise-grade competitive coding and hackathon management platform engineered with **React 19**, **TypeScript**, **TailwindCSS 4**, **Vite**, and an **Express Backend**. Features real-time code evaluation, dynamic context-wise organization, role-based access control (RBAC), and live telemetry.

---

## 🌟 Core Admin Panel Sections (Context-Wise & RBAC)

All five core operational sections in the Admin Panel are organized **context-wise** with dynamic filtering powered by the database (`db.contests`) and enforced by role-based permissions:

### 1. 📝 Question Manager (`/admin/questions`)
- **Context-Wise Organization**: Filter problems according to specific contests/contexts or view the global repository.
- **Role-Based Access**:
  - **Admins**: Full CRUD permissions (Add, Edit, Delete, Calibrate Difficulty Levels 1–10, Import questions).
  - **Faculty & Students**: Read-only access for problem inspection and previewing.
- **Adaptive Difficulty Engine**: 10 progressive difficulty tiers with automated solve-rate tracking and time metrics.

### 2. 🧪 Test Validator (`/admin/test-cases`)
- **Context-Wise Organization**: Filter test suites and validation cases by context and target problem.
- **Security Isolation**: Hidden validation suites are executed strictly inside the sandbox environment and filtered from student payloads.
- **Role-Based Access**:
  - **Admins**: Author, edit, delete, and trigger manual test execution runs.
  - **Faculty & Students**: View permitted visible test cases only.

### 3. 📡 Live Monitor (`/admin/live-sessions`)
- **Context-Wise Organization**: Track live participant sessions filtered by specific competition context or overall active arena attendance.
- **Telemetry & Anti-Cheating**: Real-time IP address verification, browser environment tracking, and heuristic anomaly detection.
- **Role-Based Access**:
  - **Admins**: Monitor all active participants and execute intervention controls (*Pause*, *Resume*, *Terminate* session).
  - **Faculty**: Monitor assigned students and assigned competition cohorts.
  - **Students**: View only their own active session status.

### 4. 📊 Submission Tracker (`/admin/submissions`)
- **Context-Wise Organization**: Filter immutable code submission logs by contest context, evaluation result, and difficulty level.
- **Audit Trail & Metrics**: Comprehensive execution metrics including runtime milliseconds, memory usage, and sandbox assertion reports.
- **Role-Based Access**:
  - **Admins**: Audit and inspect all submissions across the platform.
  - **Faculty**: Scoped access to submissions from their assigned cohorts.
  - **Students**: Scoped access to their personal submission history.

### 5. 🏆 Contest Rankings (`/admin/leaderboard`)
- **Dynamic Context Filter**: Dropdown filter displaying dynamic context names fetched directly from the database with an `"All Contexts"` overall option.
- **Dynamic Scoring Matrix**: Scores, solve counts, and ranks dynamically compute per context using configurable difficulty weights and tie-breakers.
- **Role-Based Access**:
  - **Admins**: View all rankings and trigger dynamic scoring weight recalculation.
  - **Faculty & Students**: View authorized standings with real-time refresh.

---

## 🔍 Context-Wise Organization Architecture

The platform uses a unified, dynamic context mechanism:
- **Component**: [`ContextSelector.tsx`](src/components/ContextSelector.tsx) & [`LeaderboardFilter.tsx`](src/components/LeaderboardFilter.tsx)
- **Automatic Sync**: Newly created contests automatically appear in the filter dropdown without code changes or restarts.
- **Clean Naming**: Dropdown displays only institutional context/contest names (never individual question titles).
- **URL Binding**: Seamlessly synchronizes with `?contextId=...` for bookmarking, sharing, and persistence across refreshes.

---

## 👩‍🏫 Faculty Supervision & Proctorship

- **Assigned Contest Scoping**: Faculty supervisors view and manage only contests assigned to them by administrators.
- **Cohort Supervision**: Real-time tracking of active student sessions, question progression, and anomaly alerts.
- **Supervisory Reports**: Generate and export attendance dossiers, performance breakdowns, and cohort analytics.

---

## 🧑‍💻 Student Contest Arena

- **Access Code Gate**: Join published hackathons using secure contest access codes.
- **Monaco Code Editor**: Full-featured IDE with syntax highlighting, autocomplete, and sample test assertion runners.
- **Live Scoreboard & Timer**: Synchronized contest countdown and real-time rank updates.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, React Router v7, Lucide React, Motion, Monaco Editor
- **Styling**: TailwindCSS 4, CSS Glassmorphism, Dark/Light Mode Theme Engine
- **Backend**: Node.js, Express, TypeScript (`tsx`), JWT Authentication, Server-Sent Events (SSE)
- **Bundler & Tooling**: Vite 6, esbuild, npm

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

### 2. Run Development Server
```bash
npm run dev
```

The unified full-stack application will be available at:
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

## 📦 Available Scripts

- `npm run dev`: Start the unified full-stack server on port 3000
- `npm run lint`: Run TypeScript static type checking (`tsc --noEmit`)
- `npm run build`: Build production frontend bundle and standalone server bundle
- `npm start`: Start the production server from compiled assets

---

## 📄 License
This project is proprietary and confidential for competitive hackathon and coding arena operations.
