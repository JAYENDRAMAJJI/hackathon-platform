import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Trophy,
  Code2,
  Activity,
  ShieldAlert,
  FileSpreadsheet,
  Lock,
  Terminal,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function HelpDocumentation() {
  const [activeTab, setActiveTab] = useState<string>('USER_GUIDE');

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-blue-400" /> Platform Operational Guide & API Docs
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Comprehensive manual for contest managers, test case authors, live monitors, and API integrators.
        </p>
      </div>

      {/* Guide Category Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-xl">
        {[
          { key: 'USER_GUIDE', label: 'Admin User Guide', icon: BookOpen },
          { key: 'CONTEST_OPS', label: 'Contest Lifecycle', icon: Trophy },
          { key: 'QUESTIONS', label: 'Questions & Test Cases', icon: Code2 },
          { key: 'MONITORING', label: 'Session Interventions', icon: Activity },
          { key: 'ANOMALIES', label: 'Anomaly Review Protocol', icon: ShieldAlert },
          { key: 'API_DOCS', label: 'REST API Reference', icon: Terminal },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Documentation Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs text-slate-300 leading-relaxed">
        {activeTab === 'USER_GUIDE' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> Administrative Quickstart Guide
            </h2>
            <p>
              Welcome to the <b>Hackathon Arena 2.0 Administration Portal</b>. As an administrator, you possess comprehensive authority over university coding competitions, user authorizations, algorithmic repositories, and real-time execution engines.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">1. User Approvals</h4>
                <p className="text-slate-400">
                  Students registering with university Google accounts are initially placed in the <code>PENDING</code> queue. Review official university email domains and click <b>Approve</b> to grant arena access.
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">2. Contest Operations</h4>
                <p className="text-slate-400">
                  Schedule challenges, define duration windows, and control real-time transitions (Start, Pause, Resume, End) with synchronized server-authoritative countdowns.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CONTEST_OPS' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Contest Management Workflow
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white">1. Create / Draft Phase</div>
                <p className="text-slate-400">Configure contest metadata, difficulty range (1–10), Kotlin-only constraints, scoring matrices, and attempt/skip policies.</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white">2. Start & Active Monitoring</div>
                <p className="text-slate-400">When started, participants enter the Monaco code arena. Submissions are compiled against hidden and visible test suites in isolated Docker containers.</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white">3. Conclude & Finalize</div>
                <p className="text-slate-400">Ending the contest locks all participant timers, captures final score snapshots, and unlocks formal accreditation reports.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'QUESTIONS' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" /> Question & Test Suite Authoring Guidelines
            </h2>
            <p>
              All problem submissions must provide valid Kotlin function signatures and starter code templates.
            </p>
            <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl text-purple-200">
              <b>Important Security Rule:</b> Visible test cases serve as sample tests visible to student editors. Hidden test cases evaluate edge cases and stress tests and are strictly protected server-side.
            </div>
          </div>
        )}

        {activeTab === 'MONITORING' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Live Session Supervisory Interventions
            </h2>
            <p>
              Administrators can inspect student coding telemetry in real time, view active code snapshots, and execute interventions:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><b>Pause Session:</b> Freezes student editor countdown and pauses submission handling.</li>
              <li><b>Resume Session:</b> Unfreezes clock and re-enables active coding.</li>
              <li><b>Terminate Session:</b> Locks exam and finalizes current points. All interventions require documented reasons and are logged to the audit ledger.</li>
            </ul>
          </div>
        )}

        {activeTab === 'ANOMALIES' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Behavioral Anomaly Review Protocol
            </h2>
            <p>
              The platform employs automated heuristic detection for suspicious participant patterns:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <b className="text-rose-400">Instant Solve (&lt;5 seconds):</b> Triggered when a participant submits a passing solution within 5 seconds of opening a difficult question.
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <b className="text-amber-400">Difficulty Jump:</b> Triggered if difficulty level changes by &gt;2 tiers in a single progression step.
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <b className="text-purple-400">Multiple Login / IP Overlap:</b> Triggered when concurrent JWT sessions are active across distinct IP subnets.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'API_DOCS' && (
          <div className="space-y-4 font-mono text-xs">
            <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" /> OpenAPI / REST Endpoints
            </h2>
            <div className="space-y-2">
              {[
                { m: 'GET', path: '/api/admin/dashboard', desc: 'KPI cards, contest hero status, and quick statistics' },
                { m: 'GET', path: '/api/admin/badges', desc: 'Dynamic count of pending approvals and anomalies' },
                { m: 'GET', path: '/api/admin/users', desc: 'User directory with search, role, and status filters' },
                { m: 'POST', path: '/api/admin/users/:id/approve', desc: 'Approve pending student registration' },
                { m: 'POST', path: '/api/admin/users/:id/reject', desc: 'Reject registration with mandatory reason' },
                { m: 'GET', path: '/api/admin/contests', desc: 'Contest list and current operational states' },
                { m: 'POST', path: '/api/admin/contests/:id/start', desc: 'Start live contest and synchronized clock' },
                { m: 'GET', path: '/api/admin/questions', desc: '10-level question bank repository' },
                { m: 'GET', path: '/api/admin/test-cases', desc: 'Manage visible and hidden evaluation test suites' },
                { m: 'GET', path: '/api/admin/sessions', desc: 'Real-time participant sessions stream' },
                { m: 'GET', path: '/api/admin/submissions', desc: 'Read-only contest compiler submissions log' },
                { m: 'GET', path: '/api/admin/leaderboard', desc: 'Live scoreboard with dynamic recalculation' },
                { m: 'GET', path: '/api/admin/anomalies', desc: 'Flagged heuristic behavioral anomalies' },
                { m: 'GET', path: '/api/admin/audit-logs', desc: 'Immutable append-only security ledger' },
                { m: 'GET', path: '/api/admin/settings', desc: 'System parameters and Kotlin sandbox constraints' },
              ].map((ep, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      ep.m === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {ep.m}
                    </span>
                    <span className="text-white font-bold">{ep.path}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-sans">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
