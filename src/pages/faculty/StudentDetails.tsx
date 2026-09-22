import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Trophy,
  Activity,
  LineChart,
  History,
  FileCode,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Laptop,
  Globe,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { useToast } from '../../context/AdminToastContext';

export default function StudentDetails() {
  const { studentId } = useParams<{ studentId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId) return;
      try {
        setLoading(true);
        setError(null);
        const resp = await apiClient.get(`/faculty/students/${studentId}`);
        if (resp.success && resp.data) {
          setData(resp.data);
        } else {
          setError(resp.message || 'Failed to load student');
        }
      } catch (err: any) {
        setError(err.message || 'Access Denied or Student Not Found');
        showToast('error', 'Unable to access student profile');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Loading student profile and performance telemetry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-white">Profile Inaccessible</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{error || 'Student record does not exist or belongs to another supervision partition.'}</p>
        <Button size="sm" onClick={() => navigate('/faculty/students')} variant="outline" className="bg-slate-800 text-slate-200 border-slate-700">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Students
        </Button>
      </div>
    );
  }

  const { profile, contestPerformance, currentSession } = data;

  return (
    <div className="space-y-6">
      {/* Back button & header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faculty/students')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {profile.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                profile.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {profile.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile.department} • Student ID: <span className="font-mono text-slate-200 font-semibold">{profile.id}</span>
            </p>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/faculty/students/${profile.id}/performance`)}
            className="text-xs font-bold text-indigo-400 bg-indigo-950/30 border-indigo-500/40 hover:bg-indigo-950/50 rounded-xl"
          >
            <LineChart className="w-3.5 h-3.5 mr-1.5" />
            Performance
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/faculty/students/${profile.id}/activity`)}
            className="text-xs font-bold text-purple-400 bg-purple-950/30 border-purple-500/40 hover:bg-purple-950/50 rounded-xl"
          >
            <History className="w-3.5 h-3.5 mr-1.5" />
            Activity Log
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/faculty/live-sessions/${currentSession?.sessionId || 'sess_' + profile.id}`)}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Live Session
          </Button>
        </div>
      </div>

      {/* Grid: Profile & Current Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-800">
            <CardTitle className="text-sm font-black text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Student Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 font-bold text-xl flex items-center justify-center ring-2 ring-indigo-500/30">
                {profile.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm text-white">{profile.name}</p>
                <p className="text-slate-400">{profile.email}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-slate-500">
                  Registered: {new Date(profile.registrationDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">University Department</span>
                <span className="font-semibold text-white">{profile.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Account Status</span>
                <span className="font-bold text-emerald-400">{profile.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Last Login Timestamp</span>
                <span className="font-semibold text-white font-mono">
                  {new Date(profile.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Supervisory Access</span>
                <span className="font-bold text-indigo-400">Assigned Cohort</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Active Session Telemetry Card */}
        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden lg:col-span-2">
          <CardHeader className="p-5 pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Real-Time Session Telemetry
            </CardTitle>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {currentSession?.sessionStatus || 'ACTIVE'}
            </span>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Question</p>
                <p className="text-xs font-bold text-white mt-1 truncate">
                  {currentSession?.currentQuestion || 'Two Sum Target Indices'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Arena Level</p>
                <p className="text-xs font-bold text-indigo-400 mt-1">
                  Difficulty Level {currentSession?.currentDifficulty || 1}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Remaining</p>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                  {currentSession?.timeRemaining || '01:34:10'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IP & Device</p>
                <p className="text-xs font-mono text-slate-300 mt-1 truncate">
                  {currentSession?.ipAddress || '192.168.1.105'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-slate-800 bg-slate-950/40 rounded-xl">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Client Environment:</span>
                <span className="font-semibold text-white">{currentSession?.device || 'Chrome 124.0 / Ubuntu Linux'}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/faculty/live-sessions/${currentSession?.sessionId || 'sess_' + profile.id}`)}
                className="text-xs font-bold h-8 text-indigo-400 bg-indigo-950/30 border-indigo-500/40 hover:bg-indigo-950/50 rounded-xl"
              >
                Inspect Telemetry Stream
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contest Performance Metrics Grid */}
      <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-800">
          <CardTitle className="text-sm font-black text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Contest Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Score</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {contestPerformance?.score || 0} pts
              </p>
              <span className="text-[11px] text-slate-500">Rank #{contestPerformance?.rank || 1}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Solved / Attempts</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {contestPerformance?.solved || 0} / {contestPerformance?.attempts || 0}
              </p>
              <span className="text-[11px] text-emerald-400 font-semibold">{contestPerformance?.successRate || 0}% Success</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions Skipped</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {contestPerformance?.skipped || 0}
              </p>
              <span className="text-[11px] text-amber-400/80 font-semibold">Difficulty resets</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Difficulty</p>
              <p className="text-2xl font-black text-white mt-1">
                Level {contestPerformance?.currentDifficulty || 1}
              </p>
              <span className="text-[11px] text-slate-500">1 to 10 Scale</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highest Difficulty</p>
              <p className="text-2xl font-black text-purple-400 mt-1">
                Level {contestPerformance?.highestDifficulty || 1}
              </p>
              <span className="text-[11px] text-purple-400/80 font-semibold">Peak progression</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Solving Time</p>
              <p className="text-2xl font-black text-blue-400 mt-1">
                {contestPerformance?.averageSolvingTime || '14m 20s'}
              </p>
              <span className="text-[11px] text-blue-400/80 font-semibold">Per question</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
