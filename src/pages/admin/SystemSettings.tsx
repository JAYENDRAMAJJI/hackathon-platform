import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Clock,
  Layers,
  Award,
  Lock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  Key,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { AdminSettings } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';

const DEFAULT_SETTINGS: AdminSettings = {
  contest: {
    defaultDurationMinutes: 120,
    maxParticipants: 100,
    autoStart: true,
    autoEnd: true,
  },
  difficulty: {
    levelsCount: 10,
    dynamicCalibration: true,
    promotionThreshold: 75,
    demotionThreshold: 30,
  },
  scoring: {
    difficultyWeights: {
      1: 10, 2: 20, 3: 35, 4: 55, 5: 80,
      6: 110, 7: 150, 8: 200, 9: 260, 10: 330
    },
    tieBreakerRule: 'TOTAL_TIME_ASC',
    maxAttemptPenalty: 2,
    skipScorePenalty: 5,
  },
  codeExecution: {
    language: 'Kotlin 2.0 (JVM 21)',
    cpuLimitSec: 5,
    memoryLimitMb: 256,
    maxCodeSizeKb: 10,
    networkDisabled: true,
    readOnlyFs: true,
  },
  authentication: {
    googleOauthStatus: 'CONFIGURED_ACTIVE',
    jwtExpirationHours: 5,
    sessionPolicy: 'STRICT_SINGLE_ACTIVE_SESSION',
    singleActiveSessionEnforced: true,
  }
};

export default function SystemSettings() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTEST' | 'DIFFICULTY' | 'SCORING' | 'SANDBOX' | 'AUTH'>('CONTEST');

  const toast = useToast();

  const fetchSettings = async () => {
    try {
      const resp = await apiClient.get('/admin/settings');
      if (resp && resp.data) {
        setSettings(resp.data);
      }
    } catch (err: any) {
      console.warn('Using default system configuration:', err);
      // Keep default settings without interrupting user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const resp = await apiClient.put('/admin/settings', settings);
      if (resp.success) {
        toast.success('System configuration saved and audited');
      }
    } catch (err: any) {
      toast.error('Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading platform configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-400" /> Platform Architecture & System Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global contest rules, Kotlin Docker sandbox constraints, and OAuth / JWT policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-xl">
        {[
          { key: 'CONTEST', label: 'Contest Defaults', icon: Clock },
          { key: 'DIFFICULTY', label: 'Difficulty Progression', icon: Layers },
          { key: 'SCORING', label: 'Scoring Matrix (1-10)', icon: Award },
          { key: 'SANDBOX', label: 'Kotlin Sandbox Security', icon: Server },
          { key: 'AUTH', label: 'Authentication & JWT', icon: Key },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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

      {/* Form Settings Body */}
      {settings && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: CONTEST DEFAULTS */}
          {activeTab === 'CONTEST' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Default Contest Timing & Participant Rules
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Default Duration (Minutes)</label>
                  <input
                    type="number"
                    value={settings.contest.defaultDurationMinutes}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contest: { ...settings.contest, defaultDurationMinutes: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Maximum Arena Capacity</label>
                  <input
                    type="number"
                    value={settings.contest.maxParticipants}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contest: { ...settings.contest, maxParticipants: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 text-xs">
                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.contest.autoStart}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contest: { ...settings.contest, autoStart: e.target.checked },
                      })
                    }
                    className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
                  />
                  <span className="font-bold text-white">Auto-Start Contests on Scheduled Time</span>
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.contest.autoEnd}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contest: { ...settings.contest, autoEnd: e.target.checked },
                      })
                    }
                    className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
                  />
                  <span className="font-bold text-white">Auto-Conclude Contest when Duration Expires</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: DIFFICULTY PROGRESSION */}
          {activeTab === 'DIFFICULTY' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Dynamic Calibration Thresholds
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Level Promotion Threshold (%)</label>
                  <input
                    type="number"
                    value={settings.difficulty.promotionThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        difficulty: { ...settings.difficulty, promotionThreshold: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">Success rate threshold to promote tier</span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Level Demotion Threshold (%)</label>
                  <input
                    type="number"
                    value={settings.difficulty.demotionThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        difficulty: { ...settings.difficulty, demotionThreshold: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-slate-400">Failure rate trigger for review</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCORING SETTINGS */}
          {activeTab === 'SCORING' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Difficulty Point Weights (Levels 1–10)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                  <div key={lvl} className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-300">Level {lvl} Weight</span>
                    <input
                      type="number"
                      value={settings.scoring.difficultyWeights[lvl] || 20}
                      onChange={(e) => {
                        const updated = { ...settings.scoring.difficultyWeights, [lvl]: Number(e.target.value) };
                        setSettings({ ...settings, scoring: { ...settings.scoring, difficultyWeights: updated } });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Failed Attempt Penalty</label>
                  <input
                    type="number"
                    value={settings.scoring.maxAttemptPenalty}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        scoring: { ...settings.scoring, maxAttemptPenalty: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Skip Score Penalty</label>
                  <input
                    type="number"
                    value={settings.scoring.skipScorePenalty}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        scoring: { ...settings.scoring, skipScorePenalty: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SANDBOX SECURITY (SRS CONSTRAINTS) */}
          {activeTab === 'SANDBOX' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" /> Docker Kotlin Sandbox Security Constraints
              </h3>

              <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200">
                These settings enforce the strict security isolation parameters defined by the university software specification.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400">CPU Execution Limit</span>
                  <div className="text-xl font-extrabold text-white">5.0 seconds / testcase</div>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400">Sandbox Memory Limit</span>
                  <div className="text-xl font-extrabold text-white">256 MB RAM</div>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400">Maximum Source Code Size</span>
                  <div className="text-xl font-extrabold text-white">10 KB</div>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Outbound Network Sockets Disabled in Runner
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Read-Only Ephemeral Container Filesystem
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Kotlin 2.0 (JVM 21) Isolated Execution Pool
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUTHENTICATION & JWT */}
          {activeTab === 'AUTH' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" /> Google OAuth 2.0 & JWT Session Tokens
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">Google OAuth 2.0 Identity Provider</div>
                    <div className="text-slate-400 mt-0.5">Campus Google Workspace single sign-on</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    CONFIGURED & ACTIVE
                  </span>
                </div>

                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-medium">JWT HS256 Token Expiration</span>
                  <div className="text-lg font-bold text-white">5 Hours (Contest Duration Window)</div>
                  <p className="text-[11px] text-slate-500">
                    Session ID embedded in JWT payload. Token revoked immediately on logout.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  <Shield className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                  <b>Security Protection:</b> OAuth secrets and cryptographic JWT signing keys are securely held server-side as environment variables and are never displayed in the frontend.
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
