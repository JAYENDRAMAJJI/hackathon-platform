import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sliders,
  Layers,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Code2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useToast } from '../../context/AdminToastContext';

interface DifficultyLevelStat {
  level: number;
  totalQuestions: number;
  activeQuestions: number;
  averageSuccessRate: number;
  averageSolvingTimeMinutes: number;
  skipRate: number;
  failureRate: number;
  calibratedStatus: 'EASY_FOR_LEVEL' | 'HARD_FOR_LEVEL' | 'BALANCED';
}

export default function DifficultyManagement() {
  const [levels, setLevels] = useState<DifficultyLevelStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const toast = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/questions/difficulty-stats');
      if (resp.success && resp.data) {
        setLevels(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to fetch difficulty calibration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Adaptive Calibration Algorithm
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-blue-400" /> Difficulty Matrix & Calibration Engine (Levels 1–10)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze empirical solve rates, detect problem miscalibrations, and dynamically rebalance question tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/questions"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
          >
            <Code2 className="w-4 h-4 text-emerald-400" /> Question Manager
          </Link>
          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* SRS Dynamic Calibration Rule Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-slate-900 border border-blue-500/30 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">SRS Dynamic Calibration Policy Active</h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              When a difficulty tier achieves &gt;75% average solve rate with solving time &lt;8 min, the engine recommends tier promotion. Problems with &lt;30% success rate are flagged for review.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            AUTO-BALANCED
          </span>
        </div>
      </div>

      {/* Level 1 to 10 Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {levels.map((lvl) => {
          const isEasy = lvl.level <= 3;
          const isMedium = lvl.level >= 4 && lvl.level <= 7;
          const isHard = lvl.level >= 8;

          return (
            <div
              key={lvl.level}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-blue-500/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className={`px-2.5 py-0.5 rounded-xl text-xs font-black border ${
                    isEasy
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : isMedium
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    LEVEL {lvl.level}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{lvl.totalQuestions} Qs</span>
                </div>

                <div className="py-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Success Rate:</span>
                      <span className="font-extrabold text-white">{lvl.averageSuccessRate}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          lvl.averageSuccessRate > 70
                            ? 'bg-emerald-500'
                            : lvl.averageSuccessRate > 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${lvl.averageSuccessRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Avg Time</span>
                      <span className="font-bold text-white mt-0.5 block">{lvl.averageSolvingTimeMinutes} min</span>
                    </div>
                    <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Skip Rate</span>
                      <span className="font-bold text-amber-400 mt-0.5 block">{lvl.skipRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <Link
                  to={`/admin/questions?difficulty=${lvl.level}`}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  View Level {lvl.level} Questions <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
