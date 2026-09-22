import React, { useState, useEffect } from 'react';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
  Award,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { exportToCSV } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function PerformanceAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { showToast } = useToast();

  const fetchAnalytics = async (isManual = false) => {
    try {
      setRefreshing(true);
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const [resp] = await Promise.all([
        apiClient.get('/faculty/analytics/performance'),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setData(resp.data);
        if (isManual) {
          showToast('success', 'Cohort performance analytics refreshed');
        }
      }
    } catch (err) {
      console.error('Failed to load performance analytics:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh performance analytics');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(false);
  }, []);

  const metrics = data?.metrics;
  const charts = data?.charts;

  const handleExportCSV = () => {
    if (!metrics) {
      showToast('warning', 'No performance analytics data available to export');
      return;
    }
    const exportData = [
      { 'Metric': 'Average Student Score', 'Value': `${metrics.averageStudentScore} pts` },
      { 'Metric': 'Average Solving Time', 'Value': metrics.averageSolvingTime },
      { 'Metric': 'Overall Success Rate', 'Value': `${metrics.successRate}%` },
      { 'Metric': 'Total Questions Solved', 'Value': metrics.totalSolved },
      { 'Metric': 'Total Attempts Evaluated', 'Value': metrics.totalAttempts },
      { 'Metric': 'Total Skips', 'Value': metrics.totalSkips },
    ];
    exportToCSV('Hackathon_Arena_Cohort_Performance_Analytics', exportData);
    showToast('success', 'Cohort performance analytics exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <LineChart className="w-6 h-6" />
            </div>
            Cohort Performance Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated metrics, score distributions, and time duration benchmarks across your supervised student cohort.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* 6 Key Aggregated Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Average Score</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">
                {metrics.averageStudentScore} pts
              </p>
              <span className="text-[10px] text-slate-400">Per assigned student</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Avg Solving Speed</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {metrics.averageSolvingTime}
              </p>
              <span className="text-[10px] text-slate-400">Per accepted solution</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Overall Success Rate</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {metrics.successRate}%
              </p>
              <span className="text-[10px] text-emerald-400 font-medium">Evaluation accuracy</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Solved</p>
              <p className="text-2xl font-bold text-white mt-1">
                {metrics.totalSolved}
              </p>
              <span className="text-[10px] text-slate-400">Accepted verdicts</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Attempts</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {metrics.totalAttempts}
              </p>
              <span className="text-[10px] text-slate-400">Submissions made</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Skips</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {metrics.totalSkips}
              </p>
              <span className="text-[10px] text-amber-400 font-medium">Difficulty reset requests</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Score Distribution Histogram */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl lg:col-span-2">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Score Distribution Across Assigned Cohort
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-52 flex items-end gap-6 px-4 pb-2 border-b border-l border-slate-800">
                {charts.scoreDistribution.map((item: any, idx: number) => {
                  const maxCount = Math.max(...charts.scoreDistribution.map((s: any) => s.count)) || 10;
                  const heightPct = Math.max(15, Math.round((item.count / maxCount) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-[11px] font-bold text-indigo-400">
                        {item.count} students
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-300 group-hover:brightness-110"
                      />
                      <span className="text-[10px] font-semibold text-slate-400 mt-1">{item.range} pts</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Solving Time by Difficulty */}
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Average Solving Time (Minutes)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {charts.solvingTimeByDifficulty.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.level}</span>
                    <span className="font-mono font-bold text-blue-400">{item.minutes} min</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (item.minutes / 35) * 100)}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
