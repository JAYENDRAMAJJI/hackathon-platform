import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Code,
  GraduationCap,
  Trophy,
  ShieldCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  Layers,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Shield,
  Menu,
  X,
  FileCode,
  Zap,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/Logo';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'FACULTY') return '/faculty/dashboard';
    return '/admin/dashboard';
  };

  const faqs = [
    {
      q: 'What programming language is supported?',
      a: 'Kotlin 2.0 is supported across the platform. Participants write idiomatic Kotlin solutions evaluated server-side with strict memory and time constraints.',
    },
    {
      q: 'How do students access the contest?',
      a: 'Students authenticate using their university Google account. Upon first sign-in, accounts enter a supervised approval queue and gain full contest access once approved by faculty or administration.',
    },
    {
      q: 'How are submissions evaluated?',
      a: 'Solutions are compiled and executed in a secure server-side sandbox against both visible sample test cases and confidential hidden edge test cases.',
    },
    {
      q: 'Can I access the contest without approval?',
      a: 'No. To maintain institutional integrity and partition supervised cohorts, student accounts must be approved by authorized faculty before entering the contest arena.',
    },
    {
      q: 'Is the contest proctored?',
      a: 'The platform operates in an unproctored mode. Comprehensive background telemetry logs tab switches, rapid submission spikes, and IP anomalies for post-session supervisory audits.',
    },
    {
      q: 'How long is the contest?',
      a: 'The contest duration is centrally configured. The standard university format provides a 2-hour synchronized contest clock with real-time countdown.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Logo size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {BRAND_CONFIG.navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate(getDashboardPath())}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/register')}
                  className="text-xs font-semibold px-4 py-2 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Register
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:shadow-lg hover:shadow-indigo-600/30"
                >
                  Login
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
            {BRAND_CONFIG.navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(isAuthenticated ? getDashboardPath() : '/login');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-3 rounded-xl justify-center"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Login to Platform'}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-white via-slate-50 to-slate-100/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Synchronized University Coding Competition</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                CODE. SOLVE.{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-500">
                  COMPETE.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Challenge yourself with progressively difficult Kotlin programming problems, solve them in real time, and track your performance throughout the competition.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  Login to Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
                >
                  How It Works
                </a>
              </div>

              {/* 3. HERO TRUST INDICATORS */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kotlin Only
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Difficulty 1–10
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Real-Time Leaderboard
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Server-Side Evaluation
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Interactive Code Editor Illustration */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-indigo-950/40 overflow-hidden text-left font-mono">
                {/* Editor Top Bar */}
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-sans font-semibold text-slate-400">
                      Solution.kt
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                    Kotlin 2.0
                  </span>
                </div>

                {/* Editor Code Body */}
                <div className="p-4 sm:p-5 text-xs text-slate-300 space-y-1.5 leading-relaxed overflow-x-auto">
                  <div>
                    <span className="text-purple-400">class</span>{' '}
                    <span className="text-yellow-300">ContestSolver</span> &#123;
                  </div>
                  <div className="pl-4">
                    <span className="text-purple-400">fun</span>{' '}
                    <span className="text-blue-400">solve</span>(
                    <span className="text-orange-300">input</span>: <span className="text-emerald-400">String</span>
                    ): <span className="text-emerald-400">Int</span> &#123;
                  </div>
                  <div className="pl-8 text-slate-500">// Real-time algorithm evaluation</div>
                  <div className="pl-8">
                    <span className="text-purple-400">val</span> count = input.groupingBy &#123; it &#125;.eachCount()
                  </div>
                  <div className="pl-8">
                    <span className="text-purple-400">return</span> count.values.maxOrNull() ?: 0
                  </div>
                  <div className="pl-4">&#125;</div>
                  <div>&#125;</div>
                </div>

                {/* Editor Result Pill */}
                <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-sans font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Test Cases Passed: 6/6</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
                      Level 4
                    </span>
                    <span className="font-semibold text-slate-200">Score: 840 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            About the Platform
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Competitive Coding
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            Designed specifically for institutional programming competitions, this platform delivers structured programming challenges, progressive 10-level difficulty adaptation, instant server-side execution, live rank synchronization, and comprehensive supervisory oversight.
          </p>
        </div>
      </section>

      {/* 5. PLATFORM FEATURES GRID */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything You Need to Compete
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A high-performance environment engineered for participants, supervisors, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Kotlin Coding
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Write solutions using the Kotlin language with a dedicated Monaco-based coding experience, syntax validation, and standard library support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Progressive Difficulty
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Problems range dynamically from difficulty Level 1 to Level 10, calibrating challenges based on participant solving performance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Real-Time Evaluation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Submit code and receive immediate test-case results, compile diagnostics, execution benchmarks, and score allocations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Live Leaderboard
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Follow competition rankings through live SSE updates, score progression, streak counters, and difficulty tier badges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Performance Tracking
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Track cumulative score, attempts, solving velocity, difficulty advancement, and submission history in your profile.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Secure Evaluation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Code is evaluated server-side with controlled execution, memory limits, protected hidden test cases, and audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The four-step workflow from identity authentication to live ranking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 relative space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Login
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Authenticate using your university Google OAuth credentials.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 relative space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Approval
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                New student accounts remain pending until authorized by supervision.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 relative space-y-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Compete
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Solve Kotlin programming problems and submit solutions in the arena.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 relative space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Track
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                View scores, progress, and real-time leaderboard rank updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DIFFICULTY PROGRESSION */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" /> 10-Tier Calibration Engine
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Progress Through 10 Difficulty Levels
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
              Start at Level 1 and progress through increasingly challenging programming problems based on your performance.
            </p>
          </div>

          {/* 10-Level Line */}
          <div className="py-6 overflow-x-auto">
            <div className="min-w-[700px] flex items-center justify-between relative px-6">
              {/* Connecting line */}
              <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />

              {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
                <div key={lvl} className="relative z-10 flex flex-col items-center gap-2 group">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm transition-all group-hover:scale-110 ${
                      lvl <= 3
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : lvl <= 6
                        ? 'bg-blue-600 text-white shadow-blue-500/20'
                        : lvl <= 8
                        ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                        : 'bg-purple-600 text-white shadow-purple-500/20'
                    }`}
                  >
                    {lvl < 10 ? `0${lvl}` : lvl}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    L{lvl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. REAL-TIME COMPETITION SECTION */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" /> Synchronized Telemetry
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Live Contest Environment
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                All participants share a synchronized countdown timer, real-time leaderboard recalculations, active session status monitoring, and immediate score progression upon submission evaluation.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Synchronized 2-Hour Contest Countdown
                </li>
                <li className="flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Instant Server-Side Compilation & Score Allocation
                </li>
                <li className="flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Live SSE Event Feeds for Supervisors
                </li>
              </ul>
            </div>

            {/* Live Environment Visual Widget */}
            <div className="lg:col-span-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      LIVE CONTEST
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    71 Participants Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Time Remaining</p>
                    <p className="text-xl font-black text-cyan-400 font-mono mt-0.5">01:24:38</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Submissions Processed</p>
                    <p className="text-xl font-black text-indigo-400 font-mono mt-0.5">248</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5">
                  <div className="flex justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                    <span>Rank 1 • Alex Smith</span>
                    <span className="text-emerald-400 font-bold">1,240 pts (L5)</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                    <span>Rank 2 • Jordan Brown</span>
                    <span className="text-emerald-400 font-bold">1,120 pts (L4)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Rank 3 • Morgan Davis</span>
                    <span className="text-emerald-400 font-bold">980 pts (L4)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECURITY SECTION */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Institutional Integrity
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Secure by Design
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Compliant with university SRS standards for identity validation, role boundaries, and controlled execution.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Google OAuth 2.0</p>
              <p className="text-[11px] text-slate-500">Verified institutional identity without stored passwords</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Role-Based Access</p>
              <p className="text-[11px] text-slate-500">Strict boundaries across Student, Faculty, and Admin</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Sandboxed Execution</p>
              <p className="text-[11px] text-slate-500">Isolated server environments with memory/time ceilings</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Hidden Test Cases</p>
              <p className="text-[11px] text-slate-500">Confidential validation inputs shielded from participants</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Secure Sessions</p>
              <p className="text-[11px] text-slate-500">Single-active session policy and JWT token rotation</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Audit Logging</p>
              <p className="text-[11px] text-slate-500">Immutable logging of evaluations, reviews, and logins</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ROLE INFORMATION: ONE PLATFORM. THREE ROLES. */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              One Platform. Three Roles.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tailored workspaces for participants, supervisors, and platform administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-500 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    Compete
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    STUDENT
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Solve challenges
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Submit Kotlin code
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Track score & streak
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> View ranking & history
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login?role=STUDENT')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs"
              >
                Student Login
              </Button>
            </div>

            {/* Faculty Card */}
            <div className="p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                    Supervise
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    FACULTY
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Monitor student cohort
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Live session telemetry
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Review anomaly alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Generate official reports
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login?role=FACULTY')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs"
              >
                Faculty Login
              </Button>
            </div>

            {/* Admin Card */}
            <div className="p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-500 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                    Manage
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    ADMIN
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> User approvals & access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Question bank & test cases
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Contest management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Audit logs & analytics
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login?role=ADMIN')}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs"
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ SECTION */}
      <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Clear answers to common questions about platform access, rules, and evaluation.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4.5 text-left flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. FINAL CALL TO ACTION */}
      <section className="py-20 bg-linear-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Start Coding?
          </h2>
          <p className="text-base text-indigo-100 max-w-xl mx-auto">
            Sign in to access your competition dashboard, solve Kotlin challenges, and track your ranking.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-slate-100 text-indigo-700 font-bold text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-900/30 transition-all hover:scale-105"
            >
              Login to Platform
            </Button>
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <Logo size="md" />
            <p className="text-[11px] text-slate-400">
              {BRAND_CONFIG.tagline}
            </p>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-2.5">
            <p className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
              Platform
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="/" className="hover:text-indigo-600">Home</a></li>
              <li><a href="#features" className="hover:text-indigo-600">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-600">How It Works</a></li>
              <li><a href="#faq" className="hover:text-indigo-600">FAQ</a></li>
            </ul>
          </div>

          {/* Col 3: Access */}
          <div className="space-y-2.5">
            <p className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
              Access
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link to="/login?role=STUDENT" className="hover:text-indigo-600">Student Login</Link></li>
              <li><Link to="/login?role=FACULTY" className="hover:text-indigo-600">Faculty Login</Link></li>
              <li><Link to="/login?role=ADMIN" className="hover:text-indigo-600">Admin Login</Link></li>
              <li className="pt-1"><Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Create Account / Register</Link></li>
            </ul>
          </div>

          {/* Col 4: Information */}
          <div className="space-y-2.5">
            <p className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
              Information
            </p>
            <ul className="space-y-1.5 text-[11px]">
              <li><span className="cursor-pointer hover:text-indigo-600">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-indigo-600">Terms of Competition</span></li>
              <li><a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="hover:text-indigo-600">Supervision Help</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/60 text-center text-[11px] text-slate-400">
          {BRAND_CONFIG.copyright}
        </div>
      </footer>
    </div>
  );
}
