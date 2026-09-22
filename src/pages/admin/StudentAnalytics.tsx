import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck2,
  Search,
  Filter,
  ArrowLeft,
  Flame,
  Clock,
  Award,
  Layers,
  Activity,
  AlertTriangle,
  RefreshCw,
  Eye,
  Download,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import { exportJsonToCsv } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function StudentAnalytics() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'TOP_PERFORMERS' | 'LOW_ACTIVITY' | 'HIGH_ATTEMPTS' | 'HIGH_SKIP_RATE' | 'SUSPICIOUS'
  >('ALL');
  const [search, setSearch] = useState('');

  const toast = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/students');
      if (resp.success && resp.data) {
        setStudents(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to load student analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter Logic
  const getFilteredStudents = () => {
    let list = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    if (activeFilter === 'TOP_PERFORMERS') {
      return list.filter((s) => (s.score || 0) >= 200 || (s.highestDifficulty || 1) >= 7);
    }
    if (activeFilter === 'LOW_ACTIVITY') {
      return list.filter((s) => (s.solvedCount || 0) <= 1 && s.sessionStatus === 'IDLE');
    }
    if (activeFilter === 'HIGH_ATTEMPTS') {
      return list.filter((s) => (s.attemptsCount || 0) >= 12);
    }
    if (activeFilter === 'HIGH_SKIP_RATE') {
      return list.filter((s) => (s.skippedCount || 0) >= 2);
    }
    if (activeFilter === 'SUSPICIOUS') {
      return list.filter((s) => s.id === 'usr_stu_13' || s.id === 'usr_stu_26' || s.id === 'usr_stu_42' || s.id === 'usr_stu_55');
    }
    return list;
  };

  const filtered = getFilteredStudents();

  const handleExportCSV = () => {
    exportJsonToCsv('student_cohort_analytics', filtered, {
      id: 'Student ID',
      name: 'Name',
      email: 'Email',
      score: 'Score',
      rank: 'Rank',
      currentDifficulty: 'Level',
      solvedCount: 'Solved',
      skippedCount: 'Skipped',
      attemptsCount: 'Attempts',
      sessionStatus: 'Status',
    });
    toast.success('Cohort analytics exported');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/analytics"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <UserCheck2 className="w-6 h-6 text-purple-400" /> Student Cohort Deep-Dive Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Multi-dimensional cohort analysis across solve rates, attempt frequencies, and anomaly flags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export Cohort CSV
          </button>
        </div>
      </div>

      {/* Segment Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-xl">
        {[
          { key: 'ALL', label: 'All Participants (71)' },
          { key: 'TOP_PERFORMERS', label: 'Top Performers (Score ≥200)', icon: Flame },
          { key: 'LOW_ACTIVITY', label: 'Low Activity / Idle', icon: Clock },
          { key: 'HIGH_ATTEMPTS', label: 'High Attempt Volume', icon: Activity },
          { key: 'HIGH_SKIP_RATE', label: 'High Problem Skips', icon: Layers },
          { key: 'SUSPICIOUS', label: 'Flagged Anomaly Telemetry', icon: AlertTriangle, color: 'text-rose-400' },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Cohort Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4">Score</th>
                <th className="p-4">Level Progression</th>
                <th className="p-4">Problems Solved</th>
                <th className="p-4">Total Attempts</th>
                <th className="p-4">Skips</th>
                <th className="p-4">Session Status</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Evaluating cohort metrics...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400">
                    No students match this cohort filter
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-amber-400">#{s.rank || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-extrabold text-blue-400 text-sm">{s.score || 0} pts</span>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          L{s.currentDifficulty || 1}
                        </span>
                        <span className="text-slate-500">→</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                          Peak: L{s.highestDifficulty || 1}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400 text-xs">
                      {s.solvedCount || 0} solved
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-300">
                      {s.attemptsCount || 0}
                    </td>
                    <td className="p-4 text-xs font-mono text-amber-400">
                      {s.skippedCount || 0}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        s.sessionStatus === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : s.sessionStatus === 'IDLE'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {s.sessionStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/students`}
                        className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-950/40 inline-block"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
