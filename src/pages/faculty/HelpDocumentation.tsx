import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Users,
  Activity,
  Trophy,
  AlertTriangle,
  FileSpreadsheet,
  Shield,
  Layers,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function HelpDocumentation() {
  const [selectedTopic, setSelectedTopic] = useState('overview');

  const topics = [
    {
      id: 'overview',
      title: 'Faculty Supervisory Role Overview',
      icon: Shield,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-black text-white">Role & Boundary Guidelines</h3>
          <p>
            As a Faculty Supervisor on the University Hackathon Platform, your primary responsibility is active supervision, live session telemetry inspection, performance tracking, anomaly review, and report generation for your assigned student cohort.
          </p>
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/80 space-y-2 text-indigo-200">
            <p className="font-bold text-indigo-300 text-xs">Key Supervisory Permissions:</p>
            <ul className="list-disc list-inside space-y-1.5 text-indigo-200/90 text-xs">
              <li>Full visibility into assigned students&apos; active code sessions and live telemetry.</li>
              <li>Read-only access to submissions, hidden test case pass counts, and real-time leaderboards.</li>
              <li>Reviewing heuristic anomaly flags with supervisor evaluation notes.</li>
              <li>Session intervention controls (Pause/Resume/Conclude session) or Admin escalation.</li>
              <li>Multi-format report generation and CSV data exports.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'monitoring',
      title: 'Live Monitor Guide',
      icon: Activity,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-black text-white">Heartbeats & Active Code Preview</h3>
          <p>
            The Live Monitoring interface receives real-time WebSocket heartbeats every 5 seconds. You can inspect:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-white">Active Question:</strong> The specific algorithmic problem the student currently has open in Monaco Editor.</li>
            <li><strong className="text-white">Difficulty Level:</strong> 1 to 10 progressive calibration level.</li>
            <li><strong className="text-white">Code Snapshot:</strong> Live Kotlin 2.0 source code currently authored in the sandbox.</li>
            <li><strong className="text-white">Client Environment:</strong> Verified IP address, operating system, and browser fingerprint.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'anomalies',
      title: 'Anomaly Review & Evaluation Protocol',
      icon: AlertTriangle,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-black text-white">Heuristic Fraud Detection Handling</h3>
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 space-y-2 text-amber-200">
            <p className="font-bold text-amber-300 text-xs">Crucial Integrity Rule:</p>
            <p className="text-xs leading-relaxed">
              Anomalies are heuristic signals (Instant solves under 5s, difficulty jumps, rapid compile loops, multiple simultaneous IP logins). Students are NOT penalized or suspended automatically.
            </p>
          </div>
          <p>
            When inspecting an anomaly, review the surrounding event timeline and code diff before marking as <span className="text-indigo-400 font-bold">Reviewed</span>, dismissing as <span className="text-slate-400 font-bold">False Positive</span>, or escalating to Platform Administrators.
          </p>
        </div>
      ),
    },
    {
      id: 'reports',
      title: 'Supervisory Reporting & CSV Exports',
      icon: FileSpreadsheet,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-black text-white">Generating Official Contest Records</h3>
          <p>
            Official supervision reports can be generated for:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-white">Student Performance Reports:</strong> Complete progression history, solve times, attempts, and rank for any student.</li>
            <li><strong className="text-white">Contest Supervisory Reports:</strong> Cohort score distribution, completion metrics, and submission accuracy.</li>
            <li><strong className="text-white">Live Session Logs & Anomaly Ledgers:</strong> CSV downloads and print-ready formatted outputs.</li>
          </ul>
        </div>
      ),
    },
  ];

  const currentTopic = topics.find((t) => t.id === selectedTopic) || topics[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Supervisor Help & Operations Manual
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed operational guides, student telemetry protocols, anomaly evaluation rules, and platform FAQs.
          </p>
        </div>
      </div>

      {/* Main Documentation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Topics Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {topics.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTopic === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/50'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                  <span className="truncate">{t.title}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 pb-4 border-b border-slate-800">
              <CardTitle className="text-base font-black text-white flex items-center gap-2.5">
                <currentTopic.icon className="w-5 h-5 text-indigo-400" />
                {currentTopic.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {currentTopic.content}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
